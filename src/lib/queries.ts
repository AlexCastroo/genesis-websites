import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/config';
import { entryLang, isPublished } from './content';

const PRODUCTION = import.meta.env.PROD;

const inLang = (lang: Lang | undefined, id: string) => !lang || entryLang(id) === lang;

export async function getServices(lang?: Lang): Promise<CollectionEntry<'services'>[]> {
  const entries = await getCollection(
    'services',
    (entry) => inLang(lang, entry.id) && isPublished(entry.data, PRODUCTION),
  );
  return entries.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getPosts(lang?: Lang): Promise<CollectionEntry<'blog'>[]> {
  const entries = await getCollection(
    'blog',
    (entry) => inLang(lang, entry.id) && isPublished(entry.data, PRODUCTION),
  );
  return entries.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

export async function getFaqs(lang?: Lang): Promise<CollectionEntry<'faq'>[]> {
  const entries = await getCollection('faq', (entry) => inLang(lang, entry.id));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getLegal(lang?: Lang): Promise<CollectionEntry<'legal'>[]> {
  const entries = await getCollection('legal', (entry) => inLang(lang, entry.id));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function findLegal(
  lang: Lang,
  translationKey: string,
): Promise<CollectionEntry<'legal'> | undefined> {
  return (await getLegal(lang)).find((entry) => entry.data.translationKey === translationKey);
}
