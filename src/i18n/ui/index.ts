import type { Lang } from '../config';
import { es, type UiKey } from './es';

export type { UiKey };

/** Adding a locale to config.ts without a dictionary here is a type error. */
export const dictionaries: Record<Lang, Record<UiKey, string>> = { es };
