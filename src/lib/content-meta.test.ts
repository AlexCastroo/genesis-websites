import { describe, expect, it } from 'vitest';
import { defaultLocale } from '../i18n/config';
import { localizePath } from '../i18n/utils';
import { entryMeta, groupAlternates } from './content-meta';

describe('entryMeta', () => {
  it('maps a file to its public path and prefers `updated` over `published`', () => {
    const meta = entryMeta(
      'blog',
      `${defaultLocale}/hola.md`,
      '---\npublished: 2026-01-01\nupdated: 2026-02-01\ntranslationKey: hello\n---\n',
    );
    expect(meta).toEqual({
      path: localizePath('blog', defaultLocale, 'hola'),
      lang: defaultLocale,
      translationKey: 'hello',
      lastmod: new Date('2026-02-01'),
      noindex: false,
      draft: false,
    });
  });

  it('accepts Windows separators', () => {
    expect(
      entryMeta('legal', `${defaultLocale}\\aviso.md`, '---\nnoindex: true\n---')?.noindex,
    ).toBe(true);
  });

  it('flags drafts', () => {
    expect(entryMeta('services', `${defaultLocale}/x.md`, '---\ndraft: true\n---')?.draft).toBe(
      true,
    );
  });

  it('ignores files outside a locale folder and invalid dates', () => {
    expect(entryMeta('services', `${defaultLocale}/x.md`, '')?.translationKey).toBe('');
    expect(entryMeta('services', 'zz/x.md', '')).toBeNull();
    expect(
      entryMeta('services', `${defaultLocale}/x.md`, '---\nupdated: nope\n---')?.lastmod,
    ).toBeUndefined();
  });
});

describe('groupAlternates', () => {
  it('maps every path of a translation group to the whole group', () => {
    const map = groupAlternates([
      [
        { lang: 'es', path: '/servicios/a' },
        { lang: 'en', path: '/en/services/a' },
      ],
    ]);
    const expected = { es: '/servicios/a', en: '/en/services/a' };
    expect(map.get('/servicios/a')).toEqual(expected);
    expect(map.get('/en/services/a')).toEqual(expected);
  });

  it('skips groups with a single language (no alternates to announce)', () => {
    expect(groupAlternates([[{ lang: 'es', path: '/solo' }]]).size).toBe(0);
  });
});
