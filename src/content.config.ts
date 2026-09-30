import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faqItem = z.object({ q: z.string().min(1), a: z.string().min(1) });
const level = z.number().int().min(1).max(3);

/** Disciplines (classes) offered by the studio. */
const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** Optional <title> when `title` is too short for search results (30–60 chars incl. brand). */
      seoTitle: z.string().optional(),
      description: z.string().min(1),
      translationKey: z.string().min(1),
      order: z.number().int().default(100),
      /** 40–60 words, factual, self-contained: rendered as the opening definition (GEO). */
      summary: z.string().min(1),
      subtitle: z.string().min(1),
      category: z.enum(['reformer', 'mat', 'prenatal', 'restorative']),
      badge: z.string().min(1),
      duration: z.number().int().positive(),
      intensity: z.string().min(1),
      capacity: z.string().min(1),
      price: z.number().positive(),
      priceNote: z.string().min(1),
      highlights: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      compare: z.object({ strength: level, flexibility: level, calm: level, level: z.string() }),
      /** Card shown on the home page (only some disciplines). */
      homeTeaser: z
        .object({
          label: z.string(),
          title: z.string(),
          text: z.string(),
          meta: z.string(),
          image: image(),
          imageAlt: z.string(),
        })
        .optional(),
      image: image(),
      imageAlt: z.string().min(1),
      faqs: z.array(faqItem).default([]),
      updated: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        translationKey: z.string().min(1),
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        author: z.string().min(1),
        image: image().optional(),
        imageAlt: z.string().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
      })
      .refine((data) => !data.image || Boolean(data.imageAlt), {
        message: 'imageAlt is required when image is set',
        path: ['imageAlt'],
      }),
});

const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/*.yaml' }),
  schema: z.object({
    q: z.string().min(1),
    a: z.string().min(1),
    translationKey: z.string().min(1),
    category: z.string().optional(),
    order: z.number().int().default(100),
  }),
});

const legal = defineCollection({
  loader: glob({ base: './src/content/legal', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    /** 'legal-notice' | 'privacy' | 'cookies' (views and components look these up). */
    translationKey: z.string().min(1),
    order: z.number().int().default(100),
    updated: z.coerce.date(),
    noindex: z.boolean().default(false),
  }),
});

/** Class packs and memberships. `trial` is the single source of the trial-class price. */
const plans = defineCollection({
  loader: glob({ base: './src/content/plans', pattern: '**/*.yaml' }),
  schema: z.object({
    translationKey: z.string().min(1),
    group: z.enum(['bonos', 'membresias']),
    order: z.number().int(),
    eyebrow: z.string().min(1),
    icon: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    priceNote: z.string().min(1),
    features: z.array(z.string()).min(1),
    cta: z.string().min(1),
    highlight: z.enum(['none', 'recommended', 'dark']).default('none'),
    badge: z.string().optional(),
  }),
});

/** Weekly timetable, one file per day. */
const schedule = defineCollection({
  loader: glob({ base: './src/content/schedule', pattern: '**/*.yaml' }),
  schema: z.object({
    translationKey: z.string().min(1),
    day: z.enum(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']),
    slots: z.array(
      z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/),
        className: z.string().min(1),
        instructor: z.string().min(1),
        band: z.enum(['morning', 'midday', 'evening']),
        spots: z.number().int().min(0),
      }),
    ),
  }),
});

const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.yaml' }),
  schema: ({ image }) =>
    z.object({
      translationKey: z.string().min(1),
      order: z.number().int(),
      name: z.string().min(1),
      role: z.string().min(1),
      icon: z.string().min(1),
      quote: z.string().min(1),
      image: image(),
      imageAlt: z.string().min(1),
      founder: z.boolean().default(false),
    }),
});

const testimonials = defineCollection({
  loader: glob({ base: './src/content/testimonials', pattern: '**/*.yaml' }),
  schema: z.object({
    translationKey: z.string().min(1),
    order: z.number().int(),
    quote: z.string().min(1),
    name: z.string().min(1),
    detail: z.string().min(1),
  }),
});

const spaces = defineCollection({
  loader: glob({ base: './src/content/spaces', pattern: '**/*.yaml' }),
  schema: ({ image }) =>
    z.object({
      translationKey: z.string().min(1),
      order: z.number().int(),
      eyebrow: z.string().min(1),
      name: z.string().min(1),
      detail: z.string().min(1),
      image: image(),
      imageAlt: z.string().min(1),
      wide: z.boolean().default(false),
    }),
});

export const collections = {
  services,
  blog,
  faq,
  legal,
  plans,
  schedule,
  team,
  testimonials,
  spaces,
};
