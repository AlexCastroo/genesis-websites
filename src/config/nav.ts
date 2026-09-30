import type { Lang } from '../i18n/config';
import type { RouteKey } from '../i18n/routes';
import type { UiKey } from '../i18n/ui';
import { localizePath } from '../i18n/utils';

export interface NavItem {
  /** Internal page. */
  route?: RouteKey;
  /** In-page anchor appended to `route` ('#solicitud'), or the 'whatsapp' placeholder. */
  href?: string;
  label: UiKey;
  external?: boolean;
}

/** Header (left) and footer navigation, in order. */
export const mainNav: NavItem[] = [
  { route: 'home', label: 'nav.home' },
  { route: 'about', label: 'nav.about' },
  { route: 'services', label: 'nav.services' },
  { route: 'pricing', label: 'nav.pricing' },
];

/** Header (right) links. */
export const secondaryNav: NavItem[] = [
  { href: 'whatsapp', label: 'nav.whatsapp', external: true },
  { route: 'contact', label: 'nav.contact' },
];

/** Primary call to action shown in the header. */
export const ctaNav: NavItem = { route: 'pricing', href: '#solicitud', label: 'cta.trial' };

export function navHref(item: NavItem, lang: Lang, whatsappHref: string): string {
  if (item.href === 'whatsapp') return whatsappHref;
  const base = item.route ? localizePath(item.route, lang) : '';
  return item.href ? `${base}${item.href}` : base;
}
