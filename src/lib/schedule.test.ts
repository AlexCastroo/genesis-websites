import { describe, expect, it } from 'vitest';
import { groupSchedule, spotsStatus, todayTab, type Band, type DaySchedule } from './schedule';

const slot = (time: string, band: Band, spots = 3) => ({
  time,
  band,
  spots,
  className: 'Reformer',
  instructor: 'Ana',
});

describe('groupSchedule', () => {
  it('orders days Mo→Sa, bands morning→evening, slots by time, and drops empty bands', () => {
    const days: DaySchedule[] = [
      { day: 'Tu', slots: [slot('18:45', 'evening'), slot('07:30', 'morning')] },
      { day: 'Mo', slots: [slot('10:30', 'morning'), slot('09:00', 'morning')] },
    ];
    const grouped = groupSchedule(days);
    expect(grouped.map((d) => d.day)).toEqual(['Mo', 'Tu']);
    expect(grouped[0]!.bands).toHaveLength(1);
    expect(grouped[0]!.bands[0]!.slots.map((s) => s.time)).toEqual(['09:00', '10:30']);
    expect(grouped[1]!.bands.map((b) => b.band)).toEqual(['morning', 'evening']);
  });

  it('drops days without slots', () => {
    expect(groupSchedule([{ day: 'Sa', slots: [] }])).toEqual([]);
  });
});

describe('spotsStatus', () => {
  it.each([
    [0, { tone: 'full', action: 'waitlist' }],
    [1, { tone: 'last', action: 'book' }],
    [4, { tone: 'open', action: 'book' }],
  ])('%i spots → %o', (spots, expected) => {
    expect(spotsStatus(spots)).toEqual(expected);
  });

  it('treats negative or fractional input defensively', () => {
    expect(spotsStatus(-2)).toEqual({ tone: 'full', action: 'waitlist' });
    expect(spotsStatus(1.5).tone).toBe('open');
  });
});

describe('todayTab', () => {
  const all = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

  it('selects the current weekday', () => {
    expect(todayTab(new Date('2026-09-30T10:00:00'), [...all])).toBe('We');
  });

  it('falls back to the first available day on Sunday', () => {
    expect(todayTab(new Date('2026-10-04T10:00:00'), [...all])).toBe('Mo');
  });

  it('falls back to the first available day when today has no classes', () => {
    expect(todayTab(new Date('2026-10-03T10:00:00'), ['Mo', 'Tu'])).toBe('Mo');
  });
});
