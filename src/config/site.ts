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
  url: 'https://urozpilates.example',
  name: 'UROZ',
  legalName: 'UROZ Pilates & Wellness Studio S.L.',
  taxId: 'B00000000',
  entity: {
    schemaType: 'ExerciseGym',
    local: true,
    priceRange: '€€',
    areaServed: ['Madrid'],
  },
  contact: {
    email: 'hola@urozpilates.example',
    phone: '+34600000000',
    whatsapp: '34600000000',
  },
  address: {
    street: 'Calle Serrano 45',
    locality: 'Madrid',
    region: 'Madrid',
    postalCode: '28001',
    country: 'ES',
  },
  geo: { lat: 40.4271, lng: -3.6868 },
  openingHours: [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '07:30', closes: '21:00' },
    { days: ['Sa'], opens: '09:00', closes: '14:00' },
  ],
  social: {
    instagram: 'https://www.instagram.com/urozpilates.example',
  },
  logo: '/logo.png',
  ogImage: '/og-default.jpg',
  themeColor: '#fcf9f4',
  aiTraining: true,
};
