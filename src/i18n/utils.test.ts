import { describe, expect, it } from 'vitest';
import { defaultLocale, localeCodes } from './config';
import { routes } from './routes';
import { localizePath, staticAlternates, useTranslations } from './utils';

const other = localeCodes.find((lang) => lang !== defaultLocale);

describe('localizePath', () => {
  it('maps the default-locale home to the root', () => {
    expect(localizePath('home', defaultLocale)).toBe('/');
  });

  it('builds default-locale pages without prefix and without trailing slash', () => {
    expect(localizePath('services', defaultLocale)).toBe(`/${routes.services[defaultLocale]}`);
  });

  it('appends a slug', () => {
    expect(localizePath('services', defaultLocale, 'alpha')).toBe(
      `/${routes.services[defaultLocale]}/alpha`,
    );
  });

  it.skipIf(!other)('prefixes non-default locales, including their home', () => {
    const lang = other!;
    expect(localizePath('home', lang)).toBe(`/${lang}`);
    expect(localizePath('services', lang, 'alpha')).toBe(`/${lang}/${routes.services[lang]}/alpha`);
  });
});

describe('staticAlternates', () => {
  it('returns one localized path per configured locale', () => {
    const alternates = staticAlternates('about');
    expect(Object.keys(alternates).sort()).toEqual([...localeCodes].sort());
    expect(alternates[defaultLocale]).toBe(localizePath('about', defaultLocale));
  });
});

describe('useTranslations', () => {
  it('returns the dictionary text', () => {
    const t = useTranslations(defaultLocale);
    expect(t('nav.home')).toBeTypeOf('string');
    expect(t('nav.home').length).toBeGreaterThan(0);
  });

  it('interpolates {vars} and leaves unknown placeholders intact', () => {
    const t = useTranslations(defaultLocale);
    expect(t('blog.readingTime', { minutes: 7 })).toContain('7');
    expect(t('blog.readingTime')).toContain('{minutes}');
  });
});
