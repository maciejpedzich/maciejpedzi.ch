import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().default(false),
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    lastEditDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    tags: z.string().array(),
    categories: z.string().array()
  })
});

export const collections = { blog };
