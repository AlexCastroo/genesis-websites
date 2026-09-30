import { defaultLocale, localeCodes, type Lang } from './config';
import { routes, type RouteKey } from './routes';
import { dictionaries, type UiKey } from './ui';

export type Alternates = Partial<Record<Lang, string>>;
export type Translate = (key: UiKey, vars?: Record<string, string | number>) => string;

export function useTranslations(lang: Lang): Translate {
  return (key, vars) => {
    const text = dictionaries[lang][key] ?? dictionaries[defaultLocale][key] ?? key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  };
}

/** '/', '/servicios', '/servicios/slug', '/en', '/en/services/slug'. Never a trailing slash. */
export function localizePath(routeKey: RouteKey, lang: Lang, slug?: string): string {
  const segments = [lang === defaultLocale ? '' : lang, routes[routeKey][lang], slug ?? ''].filter(
    Boolean,
  );
  return `/${segments.join('/')}`;
}

export function staticAlternates(routeKey: RouteKey): Alternates {
  return Object.fromEntries(localeCodes.map((lang) => [lang, localizePath(routeKey, lang)]));
}
