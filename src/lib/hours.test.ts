import { describe, expect, it } from 'vitest';
import { formatOpeningDays } from './hours';

const name = (day: string) =>
  ({
    Mo: 'lunes',
    Tu: 'martes',
    We: 'miércoles',
    Th: 'jueves',
    Fr: 'viernes',
    Sa: 'sábado',
    Su: 'domingo',
  })[day]!;

describe('formatOpeningDays', () => {
  it('collapses three or more consecutive days into a range', () => {
    expect(formatOpeningDays(['Mo', 'Tu', 'We', 'Th', 'Fr'], name, { to: 'a', and: 'y' })).toBe(
      'Lunes a viernes',
    );
  });

  it('lists one or two days with "y"', () => {
    expect(formatOpeningDays(['Sa'], name, { to: 'a', and: 'y' })).toBe('Sábado');
    expect(formatOpeningDays(['Sa', 'Su'], name, { to: 'a', and: 'y' })).toBe('Sábado y domingo');
  });

  it('lists non-consecutive days in week order', () => {
    expect(formatOpeningDays(['Fr', 'Mo', 'We'], name, { to: 'a', and: 'y' })).toBe(
      'Lunes, miércoles y viernes',
    );
  });
});
