import { readConsent, writeConsent, type ConsentValue } from './consent';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Google Consent Mode v2: everything denied until the visitor accepts. */
export function initAnalytics(gaId: string): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js requires the `arguments` object itself, not an array.
    window.dataLayer.push(arguments);
  };

  const stored = readConsent(safeStorage());
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: stored === 'granted' ? 'granted' : 'denied',
    wait_for_update: 500,
  });
  window.gtag('js', new Date());
  window.gtag('config', gaId);

  const load = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.append(script);
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 3000 });
  else setTimeout(load, 1500);

  document.addEventListener('click', (event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (target?.dataset.track) trackEvent(target.dataset.track);
  });
}

export function setConsent(value: ConsentValue): void {
  writeConsent(safeStorage(), value);
  window.gtag?.('consent', 'update', { analytics_storage: value });
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (readConsent(safeStorage()) !== 'granted') return;
  window.gtag?.('event', name, params);
}
