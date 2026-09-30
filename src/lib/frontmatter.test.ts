import { describe, expect, it } from 'vitest';
import { parseScalars, readFrontmatter } from './frontmatter';

describe('readFrontmatter', () => {
  it('reads top-level scalar keys and unquotes values', () => {
    const src =
      '---\ntitle: "Hola: mundo"\nupdated: 2026-09-30\ndraft: true\nfaqs:\n  - q: x\n---\nBody';
    expect(readFrontmatter(src)).toEqual({
      title: 'Hola: mundo',
      updated: '2026-09-30',
      draft: 'true',
      faqs: '',
    });
  });

  it('handles CRLF and missing frontmatter', () => {
    expect(readFrontmatter('---\r\ntitle: A\r\n---\r\n')).toEqual({ title: 'A' });
    expect(readFrontmatter('no frontmatter')).toEqual({});
  });
});

describe('parseScalars', () => {
  it('ignores indented and comment lines', () => {
    expect(parseScalars("q: '¿Precio?'\n# comment\n  nested: x\norder: 2")).toEqual({
      q: '¿Precio?',
      order: '2',
    });
  });
});
