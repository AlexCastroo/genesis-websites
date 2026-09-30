import { describe, expect, it } from 'vitest';
import { formatDate, toIsoDate } from './dates';

describe('dates', () => {
  const date = new Date('2026-09-30T00:00:00Z');

  it('formats ISO dates for datetime attributes', () => {
    expect(toIsoDate(date)).toBe('2026-09-30');
  });

  it('formats human dates in UTC for the given locale', () => {
    expect(formatDate(date, 'es')).toBe('30 de septiembre de 2026');
    expect(formatDate(date, 'en')).toBe('September 30, 2026');
  });
});
