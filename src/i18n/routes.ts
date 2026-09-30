import type { Lang } from './config';

/** Translated URL segment per page. '' = root of the locale. */
export const routes = {
  home: { es: '' },
  about: { es: 'el-estudio' },
  services: { es: 'disciplinas' },
  pricing: { es: 'precios-y-horarios' },
  contact: { es: 'contacto' },
  faq: { es: 'preguntas-frecuentes' },
  blog: { es: 'blog' },
  legal: { es: 'legal' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;
