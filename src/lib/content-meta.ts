import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLang, type Lang } from '../i18n/config';
import type { RouteKey } from '../i18n/routes';
import { localizePath, staticAlternates, type Alternates } from '../i18n/utils';
import { readFrontmatter } from './frontmatter';
import { STATIC_PAGES } from './pages';

/** Collections that produce public pages, and the route they live under. */
export const ROUTED_COLLECTIONS = {
  services: 'services',
  blog: 'blog',
  legal: 'legal',
} as const satisfies Record<string, RouteKey>;

export type RoutedCollection = keyof typeof ROUTED_COLLECTIONS;

export interface EntryMeta {
  path: string;
  lang: Lang;
  translationKey: string;
  lastmod?: Date;
  noindex: boolean;
  draft: boolean;
}

export interface ContentMeta {
  lastmod: Map<string, Date>;
  noindex: Set<string>;
  /** path → every language version of that page (only pages with 2+ versions). */
  alternates: Map<string, Alternates>;
}

interface Version {
  lang: string;
  path: string;
}

/** Sitemap i18n only pairs identical paths; translated slugs need explicit groups. */
export function groupAlternates(groups: Version[][]): Map<string, Alternates> {
  const map = new Map<string, Alternates>();
  for (const group of groups) {
    if (group.length < 2) continue;
    const alternates = Object.fromEntries(group.map((v) => [v.lang, v.path])) as Alternates;
    for (const version of group) map.set(version.path, alternates);
  }
  return map;
}

export function entryMeta(
  collection: RoutedCollection,
  relativeFile: string,
  source: string,
): EntryMeta | null {
  const [lang, ...rest] = relativeFile.replace(/\\/g, '/').replace(/\.md$/, '').split('/');
  if (!isLang(lang) || rest.length === 0) return null;
  const data = readFrontmatter(source);
  const raw = data.updated || data.published;
  const date = raw ? new Date(raw) : undefined;
  return {
    path: localizePath(ROUTED_COLLECTIONS[collection], lang, rest.join('/')),
    lang,
    translationKey: data.translationKey ?? '',
    lastmod: date && !Number.isNaN(date.getTime()) ? date : undefined,
    noindex: data.noindex === 'true',
    draft: data.draft === 'true',
  };
}

function listMarkdown(dir: string): string[] {
  try {
    return (readdirSync(dir, { recursive: true }) as string[]).filter((file) =>
      file.endsWith('.md'),
    );
  } catch {
    return [];
  }
}

/** Read at config time (Node) to feed the sitemap with lastmod and noindex exclusions. */
export function collectContentMeta(contentDir: URL): ContentMeta {
  const root = fileURLToPath(contentDir);
  const meta: ContentMeta = { lastmod: new Map(), noindex: new Set(), alternates: new Map() };
  const groups = new Map<string, Version[]>();
  for (const collection of Object.keys(ROUTED_COLLECTIONS) as RoutedCollection[]) {
    const dir = join(root, collection);
    for (const file of listMarkdown(dir)) {
      const entry = entryMeta(collection, file, readFileSync(join(dir, file), 'utf8'));
      if (!entry || entry.draft) continue;
      if (entry.lastmod) meta.lastmod.set(entry.path, entry.lastmod);
      if (entry.noindex) meta.noindex.add(entry.path);
      if (entry.translationKey) {
        const key = `${collection}:${entry.translationKey}`;
        groups.set(key, [...(groups.get(key) ?? []), { lang: entry.lang, path: entry.path }]);
      }
    }
  }
  const staticGroups = STATIC_PAGES.map((key) =>
    Object.entries(staticAlternates(key)).map(([lang, path]) => ({ lang, path: path as string })),
  );
  meta.alternates = groupAlternates([...staticGroups, ...groups.values()]);
  return meta;
}
