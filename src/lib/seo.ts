export interface HreflangLink {
  hreflang: string;
  href: string;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = siteUrl.replace(/\/+$/, '');
  if (path === '' || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageTitle(title: string, siteName: string): string {
  return title.includes(siteName) ? title : `${title} — ${siteName}`;
}

export function readingMinutes(text: string, wordsPerMinute = 200): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/** hreflang links only make sense with 2+ language versions of the same page. */
export function hreflangLinks(
  alternates: Partial<Record<string, string>>,
  options: { siteUrl: string; defaultLang: string; hreflangOf: (lang: string) => string },
): HreflangLink[] {
  const entries = Object.entries(alternates).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  );
  if (entries.length < 2) return [];
  const links = entries.map(([lang, path]) => ({
    hreflang: options.hreflangOf(lang),
    href: absoluteUrl(options.siteUrl, path),
  }));
  const defaultPath = alternates[options.defaultLang];
  if (defaultPath) {
    links.push({ hreflang: 'x-default', href: absoluteUrl(options.siteUrl, defaultPath) });
  }
  return links;
}
