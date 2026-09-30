import { describe, expect, it } from 'vitest';
import type { SiteConfig } from '../config/site';
import {
  articleNode,
  breadcrumbNode,
  compact,
  faqPageNode,
  graph,
  organizationNode,
  schemaIds,
  serviceNode,
  webPageNode,
  websiteNode,
} from './schema';

const base: SiteConfig = {
  url: 'https://example.com',
  name: 'Acme',
  legalName: 'Acme S.L.',
  entity: { schemaType: 'Organization', local: false },
  contact: { email: 'hi@example.com' },
  social: { linkedin: 'https://linkedin.com/company/acme', x: '' },
  logo: '/logo.png',
  ogImage: '/og.jpg',
  themeColor: '#fff',
  aiTraining: true,
};

const local: SiteConfig = {
  ...base,
  entity: { schemaType: 'Restaurant', local: true, priceRange: '€€', areaServed: ['Madrid'] },
  contact: { email: 'hi@example.com', phone: '+34600000000' },
  address: { street: 'Calle 1', locality: 'Madrid', postalCode: '28001', country: 'ES' },
  geo: { lat: 40.4, lng: -3.7 },
  openingHours: [{ days: ['Mo', 'Tu'], opens: '09:00', closes: '18:00' }],
};

describe('compact', () => {
  it('drops undefined, empty strings, empty arrays and empty objects recursively', () => {
    expect(
      compact({ a: '', b: undefined, c: [], d: {}, e: { f: '' }, g: 0, h: ['x', ''] }),
    ).toEqual({
      g: 0,
      h: ['x'],
    });
  });
});

describe('schemaIds', () => {
  it('builds stable fragment ids from the site root', () => {
    expect(schemaIds(base)).toEqual({
      website: 'https://example.com/#website',
      organization: 'https://example.com/#organization',
    });
  });
});

describe('organizationNode', () => {
  it('emits a plain Organization without local-business fields or empty values', () => {
    const node = organizationNode(base, { description: 'Desc' });
    expect(node['@type']).toBe('Organization');
    expect(node.sameAs).toEqual(['https://linkedin.com/company/acme']);
    expect(node).not.toHaveProperty('telephone');
    expect(node).not.toHaveProperty('address');
    expect(node).not.toHaveProperty('openingHoursSpecification');
    expect(node).not.toHaveProperty('areaServed');
  });

  it('emits address, geo, hours and priceRange for local businesses', () => {
    const node = organizationNode(local, { description: 'Desc' });
    expect(node['@type']).toBe('Restaurant');
    expect(node.telephone).toBe('+34600000000');
    expect(node.address).toMatchObject({ '@type': 'PostalAddress', addressLocality: 'Madrid' });
    expect(node.geo).toMatchObject({ latitude: 40.4, longitude: -3.7 });
    expect(node.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday'],
        opens: '09:00',
        closes: '18:00',
      },
    ]);
    expect(node.priceRange).toBe('€€');
    expect(node).not.toHaveProperty('address.addressRegion');
  });

  it('ignores local fields when entity.local is false even if they are filled', () => {
    const node = organizationNode(
      { ...local, entity: { schemaType: 'Organization', local: false } },
      { description: 'D' },
    );
    expect(node).not.toHaveProperty('address');
  });
});

describe('page-level nodes', () => {
  it('links WebPage to website, organization and breadcrumb', () => {
    const node = webPageNode(base, {
      path: '/servicios',
      name: 'Servicios',
      description: 'D',
      lang: 'es',
      hasBreadcrumb: true,
      dateModified: new Date('2026-09-30T00:00:00Z'),
    });
    expect(node).toMatchObject({
      '@type': 'WebPage',
      '@id': 'https://example.com/servicios#webpage',
      isPartOf: { '@id': 'https://example.com/#website' },
      about: { '@id': 'https://example.com/#organization' },
      breadcrumb: { '@id': 'https://example.com/servicios#breadcrumb' },
      dateModified: '2026-09-30T00:00:00.000Z',
    });
  });

  it('numbers breadcrumb items and makes their URLs absolute', () => {
    const node = breadcrumbNode(base, '/en/services', [
      { name: 'Home', path: '/en' },
      { name: 'Services', path: '/en/services' },
    ]);
    expect(node.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/en' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: 'https://example.com/en/services',
      },
    ]);
  });

  it('builds Service, FAQPage and BlogPosting nodes linked to the organization', () => {
    expect(serviceNode(base, { path: '/s/a', name: 'A', description: 'D' })).toMatchObject({
      '@type': 'Service',
      provider: { '@id': 'https://example.com/#organization' },
    });
    expect(faqPageNode(base, '/faq', [{ q: 'Q?', a: 'A.' }])).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } },
      ],
    });
    const article = articleNode(base, {
      path: '/blog/x',
      headline: 'X',
      description: 'D',
      lang: 'es',
      published: new Date('2026-01-01T00:00:00Z'),
      author: 'Acme',
    });
    expect(article.author).toEqual({ '@id': 'https://example.com/#organization' });
    expect(article).not.toHaveProperty('dateModified');
  });

  it('wraps nodes in a single @graph with the schema.org context', () => {
    expect(graph([websiteNode(base, { lang: 'es', description: 'D' })])).toMatchObject({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'WebSite' }],
    });
  });
});
