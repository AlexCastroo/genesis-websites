import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { SITE } from './src/config/site';
import { defaultLocale, locales, type Lang } from './src/i18n/config';
import { collectContentMeta } from './src/lib/content-meta';
import { absoluteUrl } from './src/lib/seo';

const contentMeta = collectContentMeta(new URL('./src/content/', import.meta.url));

/** 'https://example.com/en/services' → '/en/services' */
const toPath = (url: string) => {
  const path = new URL(url).pathname.replace(/\.html$/, '');
  return path.length > 1 ? path.replace(/\/$/, '') : path;
};

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  build: { format: 'file' },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      weights: [300, 400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'EB Garamond',
      cssVariable: '--font-garamond',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => {
        const path = toPath(page);
        return path !== '/404' && !contentMeta.noindex.has(path);
      },
      // Built-in sitemap i18n only pairs identical paths; our slugs are translated, so links
      // come from translationKey groups (see collectContentMeta).
      serialize: (item) => {
        const path = toPath(item.url);
        const lastmod = contentMeta.lastmod.get(path);
        const alternates = contentMeta.alternates.get(path);
        const links: { lang: string; url: string }[] = alternates
          ? Object.entries(alternates).map(([lang, href]) => ({
              lang: locales[lang as Lang].hreflang,
              url: absoluteUrl(SITE.url, href as string),
            }))
          : [];
        const defaultHref = alternates?.[defaultLocale];
        if (defaultHref) links.push({ lang: 'x-default', url: absoluteUrl(SITE.url, defaultHref) });
        return {
          ...item,
          ...(lastmod && { lastmod: lastmod.toISOString() }),
          ...(links.length > 0 && { links }),
        };
      },
    }),
  ],
});
