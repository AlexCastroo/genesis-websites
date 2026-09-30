import { describe, expect, it } from 'vitest';
import { defaultLocale } from '../i18n/config';
import { localizePath } from '../i18n/utils';
import { navHref } from './nav';

const wa = 'https://wa.me/34600000000';

describe('navHref', () => {
  it('resolves a route to its localized path', () => {
    expect(navHref({ route: 'about', label: 'nav.about' }, defaultLocale, wa)).toBe(
      localizePath('about', defaultLocale),
    );
  });

  it('appends an in-page anchor to the route', () => {
    expect(navHref({ route: 'pricing', href: '#solicitud', label: 'cta.trial' }, defaultLocale, wa)).toBe(
      `${localizePath('pricing', defaultLocale)}#solicitud`,
    );
  });

  it('uses the WhatsApp link for the whatsapp placeholder', () => {
    expect(navHref({ href: 'whatsapp', label: 'nav.whatsapp', external: true }, defaultLocale, wa)).toBe(
      wa,
    );
  });
});
