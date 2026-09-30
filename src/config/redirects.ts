export interface Redirect {
  /** Exact old path, starting with '/', no trailing slash. */
  from: string;
  /** New path ('/...') or absolute URL. */
  to: string;
}

/**
 * Permanent (301) redirects. Rendered into deploy/nginx/redirects.conf at build time.
 * Example: { from: '/en/servicios', to: '/en/services' }
 */
export const redirects: Redirect[] = [];
