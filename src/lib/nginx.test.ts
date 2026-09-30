import { describe, expect, it } from 'vitest';
import { contactOrigin, renderNginxRedirects } from './nginx';

describe('renderNginxRedirects', () => {
  it('renders one exact-match 301 per redirect with a generated header', () => {
    const conf = renderNginxRedirects([
      { from: '/en/servicios', to: '/en/services' },
      { from: '/old', to: 'https://other.test/new' },
    ]);
    expect(conf).toMatch(/^# GENERATED/);
    expect(conf).toContain('location = /en/servicios { return 301 /en/services; }');
    expect(conf).toContain('location = /old { return 301 https://other.test/new; }');
  });

  it('renders only the header when there are no redirects', () => {
    expect(renderNginxRedirects([]).trim().split('\n')).toHaveLength(1);
  });

  it.each([
    [{ from: 'no-slash', to: '/x' }, /must start with "\/"/],
    [{ from: '/a b', to: '/x' }, /invalid characters/],
    [{ from: '/a', to: '/x;rm' }, /invalid characters/],
    [{ from: '/a/', to: '/x' }, /trailing slash/],
    [{ from: '/a', to: '/a' }, /points to itself/],
    [{ from: '/a', to: 'ftp://x' }, /must be a path or an http\(s\) URL/],
  ])('rejects unsafe or invalid rules %#', (rule, error) => {
    expect(() => renderNginxRedirects([rule])).toThrow(error);
  });

  it('rejects duplicate sources', () => {
    expect(() =>
      renderNginxRedirects([
        { from: '/a', to: '/b' },
        { from: '/a', to: '/c' },
      ]),
    ).toThrow(/duplicate/);
  });
});

describe('contactOrigin', () => {
  it('derives the CSP origin from the form endpoint', () => {
    expect(contactOrigin('https://formspree.io/f/abc123')).toBe('https://formspree.io');
    expect(contactOrigin('https://api.example.com:8443/leads?x=1')).toBe(
      'https://api.example.com:8443',
    );
  });

  it('returns an empty string when there is no endpoint', () => {
    expect(contactOrigin(undefined)).toBe('');
    expect(contactOrigin('')).toBe('');
  });

  it('rejects endpoints that are not absolute http(s) URLs', () => {
    expect(() => contactOrigin('/api/contact')).toThrow(/PUBLIC_CONTACT_ENDPOINT/);
    expect(() => contactOrigin('javascript:alert(1)')).toThrow(/PUBLIC_CONTACT_ENDPOINT/);
  });
});
