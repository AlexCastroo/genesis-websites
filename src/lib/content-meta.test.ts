import { describe, expect, it } from 'vitest';
import { defaultLocale } from '../i18n/config';
import { localizePath } from '../i18n/utils';
import { entryMeta } from './content-meta';

describe('entryMeta', () => {
  it('maps a file to its public path and prefers `updated` over `published`', () => {
    const meta = entryMeta(
      'blog',
      `${defaultLocale}/hola.md`,
      '---\npublished: 2026-01-01\nupdated: 2026-02-01\n---\n',
    );
    expect(meta).toEqual({
      path: localizePath('blog', defaultLocale, 'hola'),
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
    expect(entryMeta('services', 'zz/x.md', '')).toBeNull();
    expect(
      entryMeta('services', `${defaultLocale}/x.md`, '---\nupdated: nope\n---')?.lastmod,
    ).toBeUndefined();
  });
});
