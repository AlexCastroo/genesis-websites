import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditHtml } from './lib/audit-html';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
if (!existsSync(dist)) {
  console.error('dist/ not found — run `pnpm build` first');
  process.exit(1);
}

const problems: string[] = [];
for (const required of ['robots.txt', 'llms.txt', 'sitemap-index.xml', 'rss.xml', '404.html']) {
  if (!existsSync(join(dist, required))) problems.push(`missing dist/${required}`);
}

const pages = (readdirSync(dist, { recursive: true }) as string[]).filter((file) =>
  file.endsWith('.html'),
);
for (const file of pages) {
  for (const issue of auditHtml(readFileSync(join(dist, file), 'utf8'))) {
    problems.push(`${file.replace(/\\/g, '/')}: ${issue}`);
  }
}

for (const problem of problems) console.error(`error ${problem}`);
console.log(`verify-dist: ${pages.length} page(s), ${problems.length} problem(s)`);
process.exit(problems.length > 0 ? 1 : 0);
