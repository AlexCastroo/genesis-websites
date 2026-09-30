import type { SiteConfig } from '../config/site';
import { absoluteUrl } from './seo';

export type JsonLdNode = Record<string, unknown>;

export interface Crumb {
  name: string;
  path: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface WebPageInput {
  path: string;
  /** WebPage subtype: 'AboutPage', 'ContactPage', 'CollectionPage', 'FAQPage'... */
  type?: string;
  name: string;
  description: string;
  lang: string;
  hasBreadcrumb?: boolean;
  datePublished?: Date;
  dateModified?: Date;
  mainEntity?: JsonLdNode[];
}

export interface ArticleInput {
  path: string;
  headline: string;
  description: string;
  lang: string;
  published: Date;
  updated?: Date;
  author: string;
  /** Absolute URL */
  image?: string;
}

const DAYS = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
} as const;

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/** Recursively removes undefined, null, '', [] and {} so no empty property reaches the markup. */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => compact(item)).filter((item) => !isEmpty(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = compact(item);
      if (!isEmpty(cleaned)) out[key] = cleaned;
    }
    return out as T;
  }
  return value;
}

export function schemaIds(site: Pick<SiteConfig, 'url'>) {
  const home = absoluteUrl(site.url, '/');
  return { website: `${home}#website`, organization: `${home}#organization` };
}

export function graph(nodes: JsonLdNode[]): JsonLdNode {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function websiteNode(
  site: SiteConfig,
  input: { lang: string; description: string },
): JsonLdNode {
  const ids = schemaIds(site);
  return compact({
    '@type': 'WebSite',
    '@id': ids.website,
    url: absoluteUrl(site.url, '/'),
    name: site.name,
    description: input.description,
    inLanguage: input.lang,
    publisher: { '@id': ids.organization },
  });
}

export function organizationNode(site: SiteConfig, input: { description: string }): JsonLdNode {
  const ids = schemaIds(site);
  const logo = absoluteUrl(site.url, site.logo);
  const node: JsonLdNode = {
    '@type': site.entity.schemaType,
    '@id': ids.organization,
    name: site.name,
    legalName: site.legalName,
    url: absoluteUrl(site.url, '/'),
    description: input.description,
    logo: { '@type': 'ImageObject', url: logo },
    image: logo,
    email: site.contact.email,
    telephone: site.contact.phone,
    sameAs: Object.values(site.social).filter(Boolean),
  };
  if (!site.entity.local) return compact(node);
  return compact({
    ...node,
    priceRange: site.entity.priceRange,
    areaServed: site.entity.areaServed,
    address: site.address && {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: site.geo && {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHoursSpecification: site.openingHours?.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.days.map((day) => DAYS[day]),
      opens: hours.opens,
      closes: hours.closes,
    })),
  });
}

export function webPageNode(site: SiteConfig, input: WebPageInput): JsonLdNode {
  const ids = schemaIds(site);
  const url = absoluteUrl(site.url, input.path);
  return compact({
    '@type': input.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: input.lang,
    isPartOf: { '@id': ids.website },
    about: { '@id': ids.organization },
    breadcrumb: input.hasBreadcrumb ? { '@id': `${url}#breadcrumb` } : undefined,
    datePublished: input.datePublished?.toISOString(),
    dateModified: input.dateModified?.toISOString(),
    mainEntity: input.mainEntity,
  });
}

export function breadcrumbNode(site: SiteConfig, path: string, crumbs: Crumb[]): JsonLdNode {
  return compact({
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(site.url, path)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(site.url, crumb.path),
    })),
  });
}

export function serviceNode(
  site: SiteConfig,
  input: { path: string; name: string; description: string },
): JsonLdNode {
  const url = absoluteUrl(site.url, input.path);
  return compact({
    '@type': 'Service',
    '@id': `${url}#service`,
    url,
    name: input.name,
    serviceType: input.name,
    description: input.description,
    provider: { '@id': schemaIds(site).organization },
    areaServed: site.entity.areaServed,
  });
}

export function faqQuestions(items: FaqItem[]): JsonLdNode[] {
  return items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  }));
}

/** Standalone FAQPage node for pages whose main type is not FAQPage (home, service detail). */
export function faqPageNode(site: SiteConfig, path: string, items: FaqItem[]): JsonLdNode {
  const url = absoluteUrl(site.url, path);
  return compact({
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    isPartOf: { '@id': `${url}#webpage` },
    mainEntity: faqQuestions(items),
  });
}

export function articleNode(site: SiteConfig, input: ArticleInput): JsonLdNode {
  const ids = schemaIds(site);
  const url = absoluteUrl(site.url, input.path);
  return compact({
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: input.headline,
    description: input.description,
    inLanguage: input.lang,
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    datePublished: input.published.toISOString(),
    dateModified: input.updated?.toISOString(),
    image: input.image,
    author:
      input.author === site.name
        ? { '@id': ids.organization }
        : { '@type': 'Person', name: input.author },
    publisher: { '@id': ids.organization },
  });
}
