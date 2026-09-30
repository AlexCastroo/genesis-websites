import type { Redirect } from '../config/redirects';

const SAFE_PATH = /^\/[A-Za-z0-9\-._~/%]*$/;
const SAFE_TARGET = /^[A-Za-z0-9\-._~/%:?=&#+]+$/;

function validate(rule: Redirect): void {
  const label = `redirect ${rule.from} → ${rule.to}`;
  if (!rule.from.startsWith('/')) throw new Error(`${label}: "from" must start with "/"`);
  if (!SAFE_PATH.test(rule.from)) throw new Error(`${label}: "from" has invalid characters`);
  if (rule.from.length > 1 && rule.from.endsWith('/')) {
    throw new Error(`${label}: "from" must not have a trailing slash (Nginx strips it first)`);
  }
  if (!rule.to.startsWith('/') && !/^https?:\/\//.test(rule.to)) {
    throw new Error(`${label}: "to" must be a path or an http(s) URL`);
  }
  if (!SAFE_TARGET.test(rule.to)) throw new Error(`${label}: "to" has invalid characters`);
  if (rule.from === rule.to) throw new Error(`${label}: points to itself`);
}

/** Renders src/config/redirects.ts as Nginx exact-match 301 locations. */
export function renderNginxRedirects(list: Redirect[]): string {
  const seen = new Set<string>();
  const lines = list.map((rule) => {
    validate(rule);
    if (seen.has(rule.from)) throw new Error(`redirect ${rule.from}: duplicate "from"`);
    seen.add(rule.from);
    return `location = ${rule.from} { return 301 ${rule.to}; }`;
  });
  const header =
    '# GENERATED from src/config/redirects.ts by scripts/gen-nginx-redirects.ts — do not edit';
  return `${[header, ...lines].join('\n')}\n`;
}
