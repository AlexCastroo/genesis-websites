import type { APIRoute } from 'astro';
import { defaultLocale } from '../i18n/config';
import { feed } from '../lib/rss';

export const GET: APIRoute = () => feed(defaultLocale);
