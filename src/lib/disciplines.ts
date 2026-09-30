export type DisciplineCategory = 'reformer' | 'mat' | 'prenatal' | 'restorative';

export const CATEGORY_ORDER: DisciplineCategory[] = ['reformer', 'mat', 'prenatal', 'restorative'];

/** Filter chips to show: categories present in the catalogue, once each, in display order. */
export function disciplineFilters(categories: DisciplineCategory[]): DisciplineCategory[] {
  const present = new Set(categories);
  return CATEGORY_ORDER.filter((category) => present.has(category));
}
