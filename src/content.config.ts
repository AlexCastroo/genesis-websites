import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faqItem = z.object({ q: z.string().min(1), a: z.string().min(1) });

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        translationKey: z.string().min(1),
        order: z.number().int().default(100),
        /** 40–60 words, factual, self-contained: rendered as the opening definition (GEO). */
        summary: z.string().min(1),
        image: image().optional(),
        imageAlt: z.string().optional(),
        faqs: z.array(faqItem).default([]),
        updated: z.coerce.date(),
        draft: z.boolean().default(false),
      })
      .refine((data) => !data.image || Boolean(data.imageAlt), {
        message: 'imageAlt is required when image is set',
        path: ['imageAlt'],
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

export const collections = { services, blog, faq, legal };
