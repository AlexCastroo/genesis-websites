import { mkdirSync, writeFileSync } from 'node:fs';
import { redirects } from '../src/config/redirects';
import { renderNginxRedirects } from '../src/lib/nginx';

const target = new URL('../deploy/nginx/redirects.conf', import.meta.url);
mkdirSync(new URL('.', target), { recursive: true });
writeFileSync(target, renderNginxRedirects(redirects));
console.log(`nginx: ${redirects.length} redirect(s) → deploy/nginx/redirects.conf`);
