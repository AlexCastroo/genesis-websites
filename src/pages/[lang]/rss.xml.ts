import type { APIRoute, GetStaticPaths } from 'astro';
import { defaultLocale, isLang, localeCodes } from '../../i18n/config';
import { feed } from '../../lib/rss';

export const getStaticPaths = (() =>
  localeCodes
    .filter((lang) => lang !== defaultLocale)
    .map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  isLang(params.lang) ? feed(params.lang) : new Response(null, { status: 404 });
