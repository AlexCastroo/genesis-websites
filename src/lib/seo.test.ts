import { describe, expect, it } from 'vitest';
import { absoluteUrl, hreflangLinks, pageTitle, readingMinutes } from './seo';

describe('absoluteUrl', () => {
  it('keeps a single slash for the root', () => {
    expect(absoluteUrl('https://example.com', '/')).toBe('https://example.com/');
    expect(absoluteUrl('https://example.com/', '/')).toBe('https://example.com/');
  });

  it('joins paths without doubling slashes', () => {
    expect(absoluteUrl('https://example.com/', '/servicios')).toBe('https://example.com/servicios');
    expect(absoluteUrl('https://example.com', 'og.jpg')).toBe('https://example.com/og.jpg');
  });

  it('returns absolute inputs untouched', () => {
    expect(absoluteUrl('https://example.com', 'https://cdn.test/a.jpg')).toBe(
      'https://cdn.test/a.jpg',
    );
  });
});

describe('pageTitle', () => {
  it('appends the brand', () => {
    expect(pageTitle('Servicios', 'Marca')).toBe('Servicios — Marca');
  });

  it('does not repeat the brand', () => {
    expect(pageTitle('Marca — Inicio', 'Marca')).toBe('Marca — Inicio');
  });
});

describe('readingMinutes', () => {
  it('never returns less than one minute', () => {
    expect(readingMinutes('')).toBe(1);
  });

  it('rounds words / 200', () => {
    expect(readingMinutes(Array(1000).fill('word').join(' '))).toBe(5);
  });
});

describe('hreflangLinks', () => {
  const options = {
    siteUrl: 'https://example.com',
    defaultLang: 'es',
    hreflangOf: (lang: string) => lang,
  };

  it('emits nothing when there is only one language version', () => {
    expect(hreflangLinks({ es: '/servicios' }, options)).toEqual([]);
  });

  it('emits every version plus x-default pointing to the default locale', () => {
    expect(hreflangLinks({ es: '/servicios', en: '/en/services' }, options)).toEqual([
      { hreflang: 'es', href: 'https://example.com/servicios' },
      { hreflang: 'en', href: 'https://example.com/en/services' },
      { hreflang: 'x-default', href: 'https://example.com/servicios' },
    ]);
  });

  it('omits x-default when the default locale has no version', () => {
    const links = hreflangLinks({ en: '/en/a', fr: '/fr/a' }, options);
    expect(links.map((l) => l.hreflang)).toEqual(['en', 'fr']);
  });
});
