import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional().default(true),
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    categories: z.enum(['Dev Journal', 'Miscellaneous']).array()
  })
});

export const collections = { blog };
