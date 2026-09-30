import { describe, expect, it } from 'vitest';
import { contentParity, findDuplicateKeys, invalidFileNames, lengthWarnings } from './i18n-checks';

describe('findDuplicateKeys', () => {
  it('detects keys repeated in a dictionary literal', () => {
    const src = "export const es = {\n  'a.b': 'x',\n  'a.c': 'y',\n  'a.b': 'z',\n} as const;";
    expect(findDuplicateKeys(src)).toEqual(['a.b']);
  });

  it('returns nothing for a clean dictionary', () => {
    expect(findDuplicateKeys("{ 'a': '1', 'b': '2' }\n")).toEqual([]);
  });
});

describe('invalidFileNames', () => {
  it('requires <locale>/<kebab-case file>', () => {
    expect(
      invalidFileNames(
        'blog',
        ['es/ok-post.md', 'fr/x.md', 'es/Bad Name.md', 'es/sub/x.md', 'x.md'],
        ['es', 'en'],
      ),
    ).toHaveLength(4);
    expect(invalidFileNames('faq', ['en/price.yaml'], ['es', 'en'])).toEqual([]);
  });
});

describe('contentParity', () => {
  it('warns when a translationKey is missing in a locale', () => {
    const warnings = contentParity(
      'services',
      [
        { file: 'services/es/a.md', lang: 'es', translationKey: 'a' },
        { file: 'services/en/a.md', lang: 'en', translationKey: 'a' },
        { file: 'services/es/b.md', lang: 'es', translationKey: 'b' },
      ],
      ['es', 'en'],
    );
    expect(warnings).toEqual(['services: "b" has no en version']);
  });

  it('warns about entries without translationKey', () => {
    expect(
      contentParity('blog', [{ file: 'blog/es/x.md', lang: 'es', translationKey: '' }], ['es']),
    ).toEqual(['blog/es/x.md: missing translationKey']);
  });
});

describe('lengthWarnings', () => {
  it('flags titles outside 30–60 and descriptions outside 120–160 characters', () => {
    expect(lengthWarnings('x', 'short', 'd'.repeat(100))).toEqual([
      'x: title has 5 chars (recommended 30–60)',
      'x: description has 100 chars (recommended 120–160)',
    ]);
    expect(lengthWarnings('x', 't'.repeat(45), 'd'.repeat(150))).toEqual([]);
  });
});
