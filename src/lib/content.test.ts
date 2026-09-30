import { describe, expect, it } from 'vitest';
import { entryLang, entrySlug, isPublished, slugify } from './content';

describe('entry ids', () => {
  it('splits "<lang>/<slug>"', () => {
    expect(entryLang('es/tiendas-online')).toBe('es');
    expect(entrySlug('es/tiendas-online')).toBe('tiendas-online');
  });

  it('returns an empty slug for ids without folder', () => {
    expect(entrySlug('orphan')).toBe('');
  });
});

describe('isPublished', () => {
  it('hides drafts only in production', () => {
    expect(isPublished({ draft: true }, true)).toBe(false);
    expect(isPublished({ draft: true }, false)).toBe(true);
    expect(isPublished({ draft: false }, true)).toBe(true);
    expect(isPublished({}, true)).toBe(true);
  });
});

describe('slugify', () => {
  it('strips accents and punctuation', () => {
    expect(slugify('¿Preguntas Generales?')).toBe('preguntas-generales');
    expect(slugify('Diseño & Márketing')).toBe('diseno-marketing');
  });
});
