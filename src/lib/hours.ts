import type { DayCode } from '../config/site';

const WEEK: DayCode[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Lunes a viernes", "Sábado y domingo", "Lunes, miércoles y viernes". */
export function formatOpeningDays(
  days: DayCode[],
  name: (day: DayCode) => string,
  words: { to: string; and: string },
): string {
  const sorted = [...new Set(days)].sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b));
  const consecutive = sorted.every(
    (day, i) => i === 0 || WEEK.indexOf(day) === WEEK.indexOf(sorted[i - 1]!) + 1,
  );
  if (consecutive && sorted.length >= 3) {
    return capitalize(`${name(sorted[0]!)} ${words.to} ${name(sorted.at(-1)!)}`);
  }
  const names = sorted.map(name);
  const text =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} ${words.and} ${names.at(-1)}` : names[0]!;
  return capitalize(text);
}
