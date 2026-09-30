import { describe, expect, it } from 'vitest';
import { CONSENT_KEY, readConsent, writeConsent } from './consent';

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};

const throwing = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('consent storage', () => {
  it('round-trips a choice with a timestamp', () => {
    const storage = memory();
    writeConsent(storage, 'granted', new Date('2026-09-30T10:00:00Z'));
    expect(JSON.parse(storage.getItem(CONSENT_KEY)!)).toEqual({
      value: 'granted',
      date: '2026-09-30T10:00:00.000Z',
    });
    expect(readConsent(storage)).toBe('granted');
  });

  it('returns null when nothing is stored', () => {
    expect(readConsent(memory())).toBeNull();
  });

  it('returns null for corrupted or unexpected values', () => {
    const storage = memory();
    storage.setItem(CONSENT_KEY, '{not json');
    expect(readConsent(storage)).toBeNull();
    storage.setItem(CONSENT_KEY, JSON.stringify({ value: 'maybe' }));
    expect(readConsent(storage)).toBeNull();
  });

  it('never throws when storage is unavailable or blocked', () => {
    expect(readConsent(undefined)).toBeNull();
    expect(readConsent(throwing)).toBeNull();
    expect(() => writeConsent(throwing, 'denied')).not.toThrow();
    expect(() => writeConsent(undefined, 'denied')).not.toThrow();
  });
});
