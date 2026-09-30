import type { RouteKey } from '../i18n/routes';
import type { UiKey } from '../i18n/ui';

export interface NavItem {
  route: RouteKey;
  label: UiKey;
}

/** Header and footer navigation, in order. */
export const mainNav: NavItem[] = [
  { route: 'services', label: 'nav.services' },
  { route: 'about', label: 'nav.about' },
  { route: 'blog', label: 'nav.blog' },
  { route: 'faq', label: 'nav.faq' },
];

/** Primary call to action shown in the header. */
export const ctaNav: NavItem = { route: 'contact', label: 'cta.contact' };
