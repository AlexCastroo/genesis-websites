import type { Lang } from '../i18n/config';
import type { Alternates } from '../i18n/utils';

export interface ViewProps {
  lang: Lang;
  path: string;
  alternates: Alternates;
}
