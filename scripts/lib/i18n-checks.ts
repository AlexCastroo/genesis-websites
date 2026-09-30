export interface ContentRecord {
  file: string;
  lang: string;
  translationKey: string;
  title?: string;
  description?: string;
}

export function findDuplicateKeys(source: string): string[] {
  const counts = new Map<string, number>();
  for (const match of source.matchAll(/^\s*['"]([^'"]+)['"]\s*:/gm)) {
    counts.set(match[1]!, (counts.get(match[1]!) ?? 0) + 1);
  }
  return [...counts].filter(([, count]) => count > 1).map(([key]) => key);
}

export function invalidFileNames(
  collection: string,
  files: string[],
  langs: readonly string[],
): string[] {
  const errors: string[] = [];
  for (const file of files) {
    const [lang, ...rest] = file.split('/');
    if (!lang || !langs.includes(lang) || rest.length !== 1) {
      errors.push(
        `${collection}/${file}: must be <locale>/<file> with locale in [${langs.join(', ')}]`,
      );
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(md|ya?ml)$/.test(rest[0]!)) {
      errors.push(
        `${collection}/${file}: file name must be lowercase kebab-case (it becomes the URL slug)`,
      );
    }
  }
  return errors;
}

export function contentParity(
  collection: string,
  records: ContentRecord[],
  langs: readonly string[],
): string[] {
  const warnings: string[] = [];
  const byKey = new Map<string, Set<string>>();
  for (const record of records) {
    if (!record.translationKey) {
      warnings.push(`${record.file}: missing translationKey`);
      continue;
    }
    byKey.set(
      record.translationKey,
      (byKey.get(record.translationKey) ?? new Set()).add(record.lang),
    );
  }
  for (const [key, present] of byKey) {
    for (const lang of langs) {
      if (!present.has(lang)) warnings.push(`${collection}: "${key}" has no ${lang} version`);
    }
  }
  return warnings;
}

export function lengthWarnings(label: string, title?: string, description?: string): string[] {
  const warnings: string[] = [];
  if (title !== undefined && (title.length < 30 || title.length > 60)) {
    warnings.push(`${label}: title has ${title.length} chars (recommended 30–60)`);
  }
  if (description !== undefined && (description.length < 120 || description.length > 160)) {
    warnings.push(`${label}: description has ${description.length} chars (recommended 120–160)`);
  }
  return warnings;
}
