export interface LocaleInfo {
  /** Name shown in the language switcher, in its own language. */
  label: string;
  /** BCP-47 code for <html lang>, hreflang and the sitemap. */
  hreflang: string;
  /** Open Graph locale. */
  og: string;
  dir: 'ltr' | 'rtl';
}

/** Add or remove a language here, then add its dictionary in ui/ and its routes in routes.ts. */
export const locales = {
  es: { label: 'Español', hreflang: 'es', og: 'es_ES', dir: 'ltr' },
} as const satisfies Record<string, LocaleInfo>;

export type Lang = keyof typeof locales;

export const defaultLocale: Lang = 'es';

export const localeCodes = Object.keys(locales) as Lang[];

export const isMultilingual = localeCodes.length > 1;

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && Object.hasOwn(locales, value);
}
