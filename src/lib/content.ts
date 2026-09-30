/** Content ids are "<lang>/<slug>" (folder = language, file name = slug). */
export function entryLang(id: string): string {
  return id.split('/')[0] ?? '';
}

export function entrySlug(id: string): string {
  return id.split('/').slice(1).join('/');
}

export function isPublished(data: { draft?: boolean }, production: boolean): boolean {
  return !(production && data.draft === true);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
