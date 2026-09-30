import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { buildRobots } from '../lib/robots';

export const GET: APIRoute = () =>
  new Response(buildRobots(SITE), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
