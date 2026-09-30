import { describe, expect, it } from 'vitest';
import { buildLlms } from './llms';

const input = {
  name: 'Acme',
  description: 'Acme sells anvils.',
  tagline: 'Anvils since 1949.',
  facts: ['Location: Madrid'],
  services: [{ title: 'Anvils', url: 'https://acme.test/anvils', note: 'Heavy.' }],
  faqs: [{ q: 'Price?', a: 'Ask us.' }],
  posts: [],
  contact: ['Email: hi@acme.test'],
  languages: [{ title: 'English', url: 'https://acme.test/en' }],
};

describe('buildLlms', () => {
  it('follows the llms.txt layout: H1, blockquote summary, then sections', () => {
    const txt = buildLlms(input);
    expect(txt.startsWith('# Acme\n\n> Acme sells anvils.\n\nAnvils since 1949.\n')).toBe(true);
    expect(txt).toContain('## Services\n\n- [Anvils](https://acme.test/anvils): Heavy.');
    expect(txt).toContain('### Price?\n\nAsk us.');
  });

  it('omits empty sections and collapses blank lines', () => {
    const txt = buildLlms(input);
    expect(txt).not.toContain('## Blog');
    expect(txt).not.toMatch(/\n{3,}/);
    expect(txt.endsWith('\n')).toBe(true);
  });
});
