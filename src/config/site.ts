export type DayCode = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

export interface OpeningHours {
  days: DayCode[];
  /** 24 h "HH:MM" */
  opens: string;
  closes: string;
}

export interface SiteConfig {
  /** Final domain, no trailing slash. Single source for canonical, hreflang, sitemap, schema, llms.txt. */
  url: string;
  name: string;
  legalName: string;
  taxId?: string;
  entity: {
    /** schema.org type: 'Organization', 'LocalBusiness' or a subtype ('Restaurant', 'Dentist', 'LegalService'...). */
    schemaType: string;
    /** true = emit address, geo, opening hours and priceRange (LocalBusiness and subtypes). */
    local: boolean;
    priceRange?: string;
    areaServed?: string[];
  };
  contact: {
    email: string;
    /** International format, e.g. +34600000000 */
    phone?: string;
    /** Digits only with country code, e.g. 34600000000 */
    whatsapp?: string;
  };
  address?: {
    street: string;
    locality: string;
    region?: string;
    postalCode: string;
    /** ISO 3166-1 alpha-2 */
    country: string;
  };
  geo?: { lat: number; lng: number };
  openingHours?: OpeningHours[];
  /** Empty values are ignored everywhere. */
  social: Partial<
    Record<'linkedin' | 'instagram' | 'facebook' | 'x' | 'youtube' | 'tiktok', string>
  >;
  /** Square logo for schema.org (min. 112×112), path under public/. */
  logo: string;
  /** Default 1200×630 share image, path under public/. */
  ogImage: string;
  themeColor: string;
  /** '@handle' */
  twitterHandle?: string;
  /** Allow AI training crawlers (GPTBot, ClaudeBot, Google-Extended...). Search/citation bots are always allowed. */
  aiTraining: boolean;
}

export const SITE: SiteConfig = {
  url: 'https://example.com',
  name: 'Nombre Comercial',
  legalName: 'Razón Social S.L.',
  taxId: 'B00000000',
  entity: {
    schemaType: 'LocalBusiness',
    local: true,
    priceRange: '€€',
    areaServed: ['Madrid'],
  },
  contact: {
    email: 'hola@example.com',
    phone: '+34600000000',
    whatsapp: '34600000000',
  },
  address: {
    street: 'Calle Ejemplo 1',
    locality: 'Madrid',
    region: 'Madrid',
    postalCode: '28001',
    country: 'ES',
  },
  geo: { lat: 40.4168, lng: -3.7038 },
  openingHours: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:00' }],
  social: {
    linkedin: 'https://www.linkedin.com/company/example',
    instagram: '',
    facebook: '',
    x: '',
    youtube: '',
    tiktok: '',
  },
  logo: '/logo.png',
  ogImage: '/og-default.jpg',
  themeColor: '#ffffff',
  twitterHandle: '',
  aiTraining: true,
};
