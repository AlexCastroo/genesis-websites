import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { SITE } from './src/config/site';
import { defaultLocale, isMultilingual, localeCodes, locales } from './src/i18n/config';
import { collectContentMeta } from './src/lib/content-meta';

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
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      i18n: isMultilingual
        ? {
            defaultLocale,
            locales: Object.fromEntries(localeCodes.map((lang) => [lang, locales[lang].hreflang])),
          }
        : undefined,
      filter: (page) => {
        const path = toPath(page);
        return path !== '/404' && !contentMeta.noindex.has(path);
      },
      serialize: (item) => {
        const lastmod = contentMeta.lastmod.get(toPath(item.url));
        return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
      },
    }),
  ],
});
