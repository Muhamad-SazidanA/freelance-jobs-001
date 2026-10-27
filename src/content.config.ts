import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { getAllPosts, getAllProducts } from './content/loaders/wp-graphql-loader';

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  canonical: z.string().optional(),
  ogImage: z.string().optional(),
  noindex: z.boolean().optional(),
  metaKeywords: z.array(z.string()).optional(),
});

const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  role: z.string(),
  bio: z.string(),
  avatarUrl: z.string(),
  credentials: z.string().optional(),
  socialLinks: z
    .object({
      linkedin: z.string().optional(),
      github: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
});

const postsCollection = defineCollection({
  loader: async () => {
    const list = await getAllPosts();
    return list.map((item) => ({ ...item, id: item.slug }));
  },
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string(),
    excerpt: z.string(),
    quickAnswerSummary: z.string(),
    content: z.string(),
    featuredImage: z.object({
      url: z.string(),
      alt: z.string(),
      width: z.number().default(1200),
      height: z.number().default(630),
    }),
    categories: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
    ),
    tags: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
    ),
    author: authorSchema,
    readingTimeMinutes: z.number().default(5),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
    seo: seoSchema,
  }),
});

const productsCollection = defineCollection({
  loader: async () => {
    const list = await getAllProducts();
    return list.map((item) => ({ ...item, id: item.slug }));
  },
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    headline: z.string(),
    tagline: z.string(),
    heroImage: z.string(),
    overview: z.string(),
    features: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
    benefits: z.array(z.string()),
    useCases: z.array(z.string()),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

export const collections = {
  posts: postsCollection,
  products: productsCollection,
};
