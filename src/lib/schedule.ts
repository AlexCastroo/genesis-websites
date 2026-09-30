import type { DayCode } from '../config/site';

export type Band = 'morning' | 'midday' | 'evening';

export interface Slot {
  time: string;
  className: string;
  instructor: string;
  band: Band;
  spots: number;
}

export interface DaySchedule {
  day: DayCode;
  slots: Slot[];
}

export const DAY_ORDER: DayCode[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const BAND_ORDER: Band[] = ['morning', 'midday', 'evening'];
const JS_DAY: DayCode[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Days in week order with slots grouped by band and sorted by time; empty days/bands dropped. */
export function groupSchedule(days: DaySchedule[]) {
  return [...days]
    .filter((day) => day.slots.length > 0)
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    .map((day) => ({
      day: day.day,
      bands: BAND_ORDER.map((band) => ({
        band,
        slots: day.slots
          .filter((slot) => slot.band === band)
          .sort((a, b) => a.time.localeCompare(b.time)),
      })).filter((group) => group.slots.length > 0),
    }));
}

export function spotsStatus(spots: number): {
  tone: 'full' | 'last' | 'open';
  action: 'waitlist' | 'book';
} {
  if (spots <= 0) return { tone: 'full', action: 'waitlist' };
  if (spots === 1) return { tone: 'last', action: 'book' };
  return { tone: 'open', action: 'book' };
}

/** Tab to preselect: today if it has classes, otherwise the first available day. */
export function todayTab(date: Date, available: DayCode[]): DayCode {
  const today = JS_DAY[date.getDay()]!;
  return available.includes(today) ? today : available[0]!;
}
