import rss from '@astrojs/rss';
import { SITE } from '../config/site';
import { locales, type Lang } from '../i18n/config';
import { localizePath, useTranslations } from '../i18n/utils';
import { entrySlug } from './content';
import { getPosts } from './queries';

export async function feed(lang: Lang): Promise<Response> {
  const t = useTranslations(lang);
  const posts = await getPosts(lang);
  return rss({
    title: `${SITE.name} — ${t('blog.title')}`,
    description: t('blog.lead'),
    site: SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: localizePath('blog', lang, entrySlug(post.id)),
      categories: post.data.tags,
    })),
    customData: `<language>${locales[lang].hreflang}</language>`,
  });
}
