export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}
