import type { APIRoute } from 'astro';
import { z } from 'zod';
import { json, parseNumericId, requireAuth, requireDb, resolveSeoMeta } from '@/lib/api-helpers';
import { generateUniqueSlug } from '@/lib/slug';
import { postSchema } from './index';

export const prerender = false;

const statusSchema = z.object({ status: z.enum(['draft', 'published']) });

export const GET: APIRoute = async ({ params, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID artikel tidak valid.' }, 400);

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return json({ error: 'Artikel tidak ditemukan.' }, 404);
  return json({ post });
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID artikel tidak valid.' }, 400);

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return json({ error: 'Artikel tidak ditemukan.' }, 404);

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
  const slugSource = d.slug?.trim() || (existing.title !== d.title ? d.title : existing.slug);
  const slug = await generateUniqueSlug('post', slugSource, id);
  const seo = resolveSeoMeta(d.title, d.metaTitle, d.metaDescription, d.subheading, d.content);

  const post = await db.post.update({
    where: { id },
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

  return json({ success: true, post });
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID artikel tidak valid.' }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Payload JSON tidak valid.' }, 400);
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Status harus draft atau published.' }, 400);

  const post = await db.post.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return json({ success: true, post });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID artikel tidak valid.' }, 400);

  await db.post.delete({ where: { id } });
  return json({ success: true });
};
