import { describe, expect, it } from 'vitest';
import { defaultLocale, localeCodes } from '../i18n/config';
import { localizePath } from '../i18n/utils';
import { contentAlternates, planPages, STATIC_PAGES } from './pages';

const other = localeCodes.find((lang) => lang !== defaultLocale);
const entry = (id: string, translationKey: string) => ({ id, data: { translationKey } }) as never;
const empty = { services: [], posts: [], legal: [] };

describe('planPages', () => {
  it('creates every static page for every locale', () => {
    const pages = planPages(empty);
    expect(pages).toHaveLength(STATIC_PAGES.length * localeCodes.length);
    expect(pages.find((p) => p.kind === 'home' && p.lang === defaultLocale)?.path).toBe('/');
  });

  it('creates one page per content entry under its localized route', () => {
    const pages = planPages({ ...empty, services: [entry(`${defaultLocale}/alpha`, 'alpha')] });
    const service = pages.find((p) => p.kind === 'service');
    expect(service?.path).toBe(localizePath('services', defaultLocale, 'alpha'));
    expect(service?.lang).toBe(defaultLocale);
  });

  it.skipIf(!other)('links translations through translationKey', () => {
    const services = [entry(`${defaultLocale}/alfa`, 'alpha'), entry(`${other}/alpha`, 'alpha')];
    const pages = planPages({ ...empty, services });
    const page = pages.find((p) => p.kind === 'service' && p.lang === defaultLocale);
    expect(page?.alternates).toEqual({
      [defaultLocale]: localizePath('services', defaultLocale, 'alfa'),
      [other!]: localizePath('services', other!, 'alpha'),
    });
  });

  it('rejects entries outside a locale folder', () => {
    expect(() => planPages({ ...empty, posts: [entry('zz/post', 'post')] })).toThrow(
      /locale folder/,
    );
    expect(() => planPages({ ...empty, posts: [entry('post', 'post')] })).toThrow(/locale folder/);
  });

  it('rejects duplicate public paths', () => {
    const dup = entry(`${defaultLocale}/alpha`, 'alpha');
    expect(() => planPages({ ...empty, services: [dup, dup] })).toThrow(/Duplicate page path/);
  });
});

describe('contentAlternates', () => {
  it('only lists languages where a translation exists', () => {
    const alternates = contentAlternates('blog', [entry(`${defaultLocale}/solo`, 'solo')], 'solo');
    expect(alternates).toEqual({ [defaultLocale]: localizePath('blog', defaultLocale, 'solo') });
  });
});
