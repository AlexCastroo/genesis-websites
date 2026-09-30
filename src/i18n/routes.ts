import type { Lang } from './config';

/** Translated URL segment per page. '' = root of the locale. */
export const routes = {
  home: { es: '', en: '' },
  services: { es: 'servicios', en: 'services' },
  about: { es: 'sobre-nosotros', en: 'about' },
  contact: { es: 'contacto', en: 'contact' },
  faq: { es: 'preguntas-frecuentes', en: 'faq' },
  blog: { es: 'blog', en: 'blog' },
  legal: { es: 'legal', en: 'legal' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;
