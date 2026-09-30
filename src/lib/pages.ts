import type { CollectionEntry } from 'astro:content';
import { isLang, localeCodes, type Lang } from '../i18n/config';
import type { RouteKey } from '../i18n/routes';
import { localizePath, staticAlternates, type Alternates } from '../i18n/utils';
import { entryLang, entrySlug } from './content';

export const STATIC_PAGES = [
  'home',
  'services',
  'pricing',
  'about',
  'contact',
  'faq',
  'blog',
] as const satisfies readonly RouteKey[];
export type StaticKind = (typeof STATIC_PAGES)[number];

interface PageBase {
  path: string;
  lang: Lang;
  alternates: Alternates;
}

export type StaticPage = PageBase & { kind: StaticKind };
export type ServicePage = PageBase & { kind: 'service'; entry: CollectionEntry<'services'> };
export type PostPage = PageBase & { kind: 'post'; entry: CollectionEntry<'blog'> };
export type LegalPage = PageBase & { kind: 'legal'; entry: CollectionEntry<'legal'> };
export type Page = StaticPage | ServicePage | PostPage | LegalPage;

interface Translatable {
  id: string;
  data: { translationKey: string };
}

function langOf(entry: { id: string }): Lang {
  const lang = entryLang(entry.id);
  if (!isLang(lang) || !entrySlug(entry.id)) {
    throw new Error(
      `Content entry "${entry.id}" must live in a locale folder (${localeCodes.join(', ')})`,
    );
  }
  return lang;
}

export function entryPath(routeKey: RouteKey, entry: { id: string }): string {
  return localizePath(routeKey, langOf(entry), entrySlug(entry.id));
}

export function contentAlternates(
  routeKey: RouteKey,
  entries: Translatable[],
  translationKey: string,
): Alternates {
  const alternates: Alternates = {};
  for (const entry of entries) {
    if (entry.data.translationKey === translationKey) {
      alternates[langOf(entry)] = entryPath(routeKey, entry);
    }
  }
  return alternates;
}

function contentPages<K extends string, E extends Translatable>(
  kind: K,
  routeKey: RouteKey,
  entries: E[],
) {
  return entries.map((entry) => ({
    kind,
    entry,
    lang: langOf(entry),
    path: entryPath(routeKey, entry),
    alternates: contentAlternates(routeKey, entries, entry.data.translationKey),
  }));
}

/** Pure: every public page of the site, for every locale. */
export function planPages(input: {
  services: CollectionEntry<'services'>[];
  posts: CollectionEntry<'blog'>[];
  legal: CollectionEntry<'legal'>[];
}): Page[] {
  const statics: StaticPage[] = localeCodes.flatMap((lang) =>
    STATIC_PAGES.map((kind) => ({
      kind,
      lang,
      path: localizePath(kind, lang),
      alternates: staticAlternates(kind),
    })),
  );
  const pages: Page[] = [
    ...statics,
    ...contentPages('service', 'services', input.services),
    ...contentPages('post', 'blog', input.posts),
    ...contentPages('legal', 'legal', input.legal),
  ];
  const seen = new Set<string>();
  for (const page of pages) {
    if (seen.has(page.path)) throw new Error(`Duplicate page path "${page.path}"`);
    seen.add(page.path);
  }
  return pages;
}
