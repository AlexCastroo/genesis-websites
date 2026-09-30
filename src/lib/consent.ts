export const CONSENT_KEY = 'consent.v1';

export type ConsentValue = 'granted' | 'denied';

export function readConsent(storage: Pick<Storage, 'getItem'> | undefined): ConsentValue | null {
  try {
    const raw = storage?.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value?: unknown };
    return parsed.value === 'granted' || parsed.value === 'denied' ? parsed.value : null;
  } catch {
    return null;
  }
}

export function writeConsent(
  storage: Pick<Storage, 'setItem'> | undefined,
  value: ConsentValue,
  now: Date = new Date(),
): void {
  try {
    storage?.setItem(CONSENT_KEY, JSON.stringify({ value, date: now.toISOString() }));
  } catch {
    // Storage blocked or full: the choice lasts for this page view only.
  }
}
