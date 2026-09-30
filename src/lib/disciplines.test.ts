import { describe, expect, it } from 'vitest';
import { disciplineFilters } from './disciplines';

describe('disciplineFilters', () => {
  it('returns each present category once, in the fixed display order', () => {
    expect(disciplineFilters(['restorative', 'reformer', 'mat', 'reformer'])).toEqual([
      'reformer',
      'mat',
      'restorative',
    ]);
  });

  it('returns nothing for no disciplines', () => {
    expect(disciplineFilters([])).toEqual([]);
  });
});
