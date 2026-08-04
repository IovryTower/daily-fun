import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const fun = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/fun' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['meme', 'joke', 'quote', 'gif', 'image', 'other']),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    description: z.string().optional(),
    source: z.string().optional(),
  }),
});

export const collections = { fun };
