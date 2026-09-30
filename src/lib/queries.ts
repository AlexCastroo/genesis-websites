import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/config';
import { entryLang, isPublished } from './content';
import type { DaySchedule } from './schedule';

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

export async function getPlans(
  group?: 'bonos' | 'membresias',
): Promise<CollectionEntry<'plans'>[]> {
  const entries = await getCollection('plans', (entry) => !group || entry.data.group === group);
  const groupOrder = ['bonos', 'membresias'];
  return entries.sort(
    (a, b) =>
      groupOrder.indexOf(a.data.group) - groupOrder.indexOf(b.data.group) ||
      a.data.order - b.data.order,
  );
}

/** The trial class is the single source of the price shown in every "book a trial" CTA. */
export async function getTrialPlan(): Promise<CollectionEntry<'plans'>> {
  const trial = (await getPlans()).find((entry) => entry.data.translationKey === 'trial');
  if (!trial) throw new Error('Missing plan with translationKey "trial" in src/content/plans');
  return trial;
}

export async function getSchedule(): Promise<DaySchedule[]> {
  const entries = await getCollection('schedule');
  return entries.map((entry) => ({ day: entry.data.day, slots: entry.data.slots }));
}

export async function getTeam(): Promise<CollectionEntry<'team'>[]> {
  return (await getCollection('team')).sort((a, b) => a.data.order - b.data.order);
}

export async function getTestimonials(): Promise<CollectionEntry<'testimonials'>[]> {
  return (await getCollection('testimonials')).sort((a, b) => a.data.order - b.data.order);
}

export async function getSpaces(): Promise<CollectionEntry<'spaces'>[]> {
  return (await getCollection('spaces')).sort((a, b) => a.data.order - b.data.order);
}
