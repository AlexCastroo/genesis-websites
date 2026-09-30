import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { defaultLocale, localeCodes, locales } from '../i18n/config';
import { localizePath, useTranslations } from '../i18n/utils';
import { entrySlug } from '../lib/content';
import { buildLlms } from '../lib/llms';
import { getFaqs, getPosts, getServices } from '../lib/queries';
import { absoluteUrl } from '../lib/seo';

export const GET: APIRoute = async () => {
  const lang = defaultLocale;
  const t = useTranslations(lang);
  const url = (path: string) => absoluteUrl(SITE.url, path);
  const [services, faqs, posts] = await Promise.all([
    getServices(lang),
    getFaqs(lang),
    getPosts(lang),
  ]);
  const address = SITE.address
    ? `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}, ${SITE.address.country}`
    : undefined;
  const hours = SITE.openingHours
    ?.map((h) => `${h.days.join(',')} ${h.opens}-${h.closes}`)
    .join('; ');

  const body = buildLlms({
    name: SITE.name,
    description: t('site.description'),
    tagline: t('site.tagline'),
    facts: [
      `Type: ${SITE.entity.schemaType}`,
      `Legal name: ${SITE.legalName}`,
      address && `Address: ${address}`,
      SITE.entity.areaServed?.length
        ? `Area served: ${SITE.entity.areaServed.join(', ')}`
        : undefined,
      hours && `Opening hours: ${hours}`,
      `Website: ${url('/')}`,
    ].filter((fact): fact is string => Boolean(fact)),
    services: services.map((service) => ({
      title: service.data.title,
      url: url(localizePath('services', lang, entrySlug(service.id))),
      note: service.data.summary,
    })),
    faqs: faqs.map((faq) => ({ q: faq.data.q, a: faq.data.a })),
    posts: posts.slice(0, 10).map((post) => ({
      title: post.data.title,
      url: url(localizePath('blog', lang, entrySlug(post.id))),
      note: post.data.description,
    })),
    contact: [
      `Email: ${SITE.contact.email}`,
      SITE.contact.phone && `Phone: ${SITE.contact.phone}`,
      `Contact page: ${url(localizePath('contact', lang))}`,
      ...Object.values(SITE.social).filter(Boolean),
    ].filter((item): item is string => Boolean(item)),
    languages: localeCodes
      .filter((code): boolean => code !== lang)
      .map((code) => ({ title: locales[code].label, url: url(localizePath('home', code)) })),
  });

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
