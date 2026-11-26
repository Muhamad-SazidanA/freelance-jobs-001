import type { APIRoute } from 'astro';
import { z } from 'zod';
import { json, requireAuth, requireDb, resolveSeoMeta } from '@/lib/api-helpers';
import { generateUniqueSlug } from '@/lib/slug';

export const prerender = false;

export const postSchema = z.object({
  title: z.string().min(1, 'Judul artikel wajib diisi.').max(255),
  slug: z.string().max(255).optional(),
  subheading: z.string().max(255).nullish(),
  content: z.string().min(1, 'Konten artikel wajib diisi.'),
  imageUrl: z.string().nullish(),
  category: z.string().max(100).nullish(),
  author: z.string().max(100).nullish(),
  authorImage: z.string().nullish(),
  authorBadge: z.string().max(100).nullish(),
  authorBio: z.string().nullish(),
  showAuthor: z.boolean().optional(),
  reviewerName: z.string().max(100).nullish(),
  reviewerImage: z.string().nullish(),
  reviewerBadge: z.string().max(100).nullish(),
  reviewerBio: z.string().nullish(),
  showReviewer: z.boolean().optional(),
  metaTitle: z.string().max(255).nullish(),
  metaDescription: z.string().nullish(),
  metaKeywords: z.string().nullish(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const GET: APIRoute = async ({ cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } });
  return json({ posts });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Payload JSON tidak valid.' }, 400);
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message || 'Data artikel tidak valid.' }, 400);
  }

  const d = parsed.data;
  const slug = await generateUniqueSlug('post', d.slug?.trim() || d.title);
  const seo = resolveSeoMeta(d.title, d.metaTitle, d.metaDescription, d.subheading, d.content);

  const post = await db.post.create({
    data: {
      title: d.title.trim(),
      slug,
      subheading: d.subheading?.trim() || null,
      content: d.content,
      imageUrl: d.imageUrl || null,
      category: d.category?.trim() || 'Technology',
      author: d.author?.trim() || 'Admin SAI',
      authorImage: d.authorImage || null,
      authorBadge: d.authorBadge?.trim() || 'Penulis',
      authorBio: d.authorBio?.trim() || null,
      showAuthor: d.showAuthor ?? true,
      reviewerName: d.reviewerName?.trim() || null,
      reviewerImage: d.reviewerImage || null,
      reviewerBadge: d.reviewerBadge?.trim() || null,
      reviewerBio: d.reviewerBio?.trim() || null,
      showReviewer: d.showReviewer ?? false,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      metaKeywords: d.metaKeywords?.trim() || null,
      status: d.status,
    },
  });

  return json({ success: true, post }, 201);
};
