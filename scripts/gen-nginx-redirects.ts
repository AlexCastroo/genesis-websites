/**
 * Build-time Nginx inputs (consumed by the Docker image):
 *   deploy/nginx/redirects.conf  ← src/config/redirects.ts
 *   deploy/nginx/contact-origin  ← origin of PUBLIC_CONTACT_ENDPOINT, for the CSP
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { redirects } from '../src/config/redirects';
import { contactOrigin, renderNginxRedirects } from '../src/lib/nginx';

const dir = new URL('../deploy/nginx/', import.meta.url);
mkdirSync(dir, { recursive: true });

writeFileSync(new URL('redirects.conf', dir), renderNginxRedirects(redirects));
console.log(`nginx: ${redirects.length} redirect(s) → deploy/nginx/redirects.conf`);

const origin = contactOrigin(process.env.PUBLIC_CONTACT_ENDPOINT);
writeFileSync(new URL('contact-origin', dir), origin);
console.log(`nginx: contact origin "${origin}" → deploy/nginx/contact-origin`);
