import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/config/site';
import { localeCodes } from '../src/i18n/config';
import { dictionaries } from '../src/i18n/ui';
import { parseScalars, readFrontmatter } from '../src/lib/frontmatter';
import { pageTitle } from '../src/lib/seo';
import {
  contentParity,
  findDuplicateKeys,
  invalidFileNames,
  lengthWarnings,
  type ContentRecord,
} from './lib/i18n-checks';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors: string[] = [];
const warnings: string[] = [];

// 1. Duplicate keys in dictionaries (JS silently keeps the last one).
const uiDir = join(root, 'src/i18n/ui');
for (const file of readdirSync(uiDir).filter(
  (name) => name.endsWith('.ts') && name !== 'index.ts',
)) {
  for (const key of findDuplicateKeys(readFileSync(join(uiDir, file), 'utf8'))) {
    errors.push(`src/i18n/ui/${file}: duplicate key "${key}"`);
  }
}

// 2. Content: file layout (error), translation parity and SEO lengths (warnings).
for (const collection of ['services', 'blog', 'legal', 'faq']) {
  const dir = join(root, 'src/content', collection);
  const files = (readdirSync(dir, { recursive: true }) as string[])
    .map((file) => file.replace(/\\/g, '/'))
    .filter((file) => /\.(md|ya?ml)$/.test(file));
  errors.push(...invalidFileNames(collection, files, localeCodes));
  const records: ContentRecord[] = files.map((file) => {
    const source = readFileSync(join(dir, file), 'utf8');
    const data = file.endsWith('.md') ? readFrontmatter(source) : parseScalars(source);
    return {
      file: `${collection}/${file}`,
      lang: file.split('/')[0] ?? '',
      translationKey: data.translationKey ?? '',
      title: data.title,
      description: data.description,
    };
  });
  warnings.push(...contentParity(collection, records, localeCodes));
  if (collection === 'services' || collection === 'blog') {
    for (const record of records) {
      warnings.push(
        ...lengthWarnings(
          record.file,
          record.title && pageTitle(record.title, SITE.name),
          record.description,
        ),
      );
    }
  }
}

// 3. Static page meta in dictionaries.
for (const lang of localeCodes) {
  const d = dictionaries[lang];
  warnings.push(
    ...lengthWarnings(`ui/${lang} meta.home`, d['meta.home.title'], d['meta.home.description']),
  );
  for (const page of ['services', 'about', 'contact', 'faq', 'blog'] as const) {
    warnings.push(
      ...lengthWarnings(
        `ui/${lang} meta.${page}`,
        pageTitle(d[`meta.${page}.title`], SITE.name),
        d[`meta.${page}.description`],
      ),
    );
  }
}

for (const warning of warnings) console.warn(`warn  ${warning}`);
for (const error of errors) console.error(`error ${error}`);
console.log(`i18n check: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length > 0 ? 1 : 0);
