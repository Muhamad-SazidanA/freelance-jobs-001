import type { APIRoute } from 'astro';
import { z } from 'zod';
import { json, parseNumericId, requireAuth, requireDb, resolveSeoMeta } from '@/lib/api-helpers';
import { generateUniqueSlug } from '@/lib/slug';
import { landingPageSchema } from './index';

export const prerender = false;

const statusSchema = z.object({ status: z.enum(['draft', 'published']) });

export const GET: APIRoute = async ({ params, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID landing page tidak valid.' }, 400);

  const page = await db.landingPage.findUnique({ where: { id } });
  if (!page) return json({ error: 'Landing page tidak ditemukan.' }, 404);
  return json({ page });
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID landing page tidak valid.' }, 400);

  const existing = await db.landingPage.findUnique({ where: { id } });
  if (!existing) return json({ error: 'Landing page tidak ditemukan.' }, 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Payload JSON tidak valid.' }, 400);
  }

  const parsed = landingPageSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message || 'Data landing page tidak valid.' }, 400);
  }

  const d = parsed.data;
  const slugSource = d.slug?.trim() || (existing.title !== d.title ? d.title : existing.slug);
  const slug = await generateUniqueSlug('landingPage', slugSource, id);
  const seo = resolveSeoMeta(
    d.title,
    d.metaTitle,
    d.metaDescription,
    d.heroSubtitle,
    d.content || d.heroSubtitle || d.title
  );

  const page = await db.landingPage.update({
    where: { id },
    data: {
      title: d.title.trim(),
      slug,
      template: d.template,
      badgeText: d.badgeText?.trim() || null,
      heroTitle: d.heroTitle?.trim() || d.title.trim(),
      heroSubtitle: d.heroSubtitle?.trim() || null,
      heroImage: d.heroImage || null,
      ctaLabel: d.ctaLabel?.trim() || 'Jadwalkan Demo',
      ctaUrl: d.ctaUrl?.trim() || '/request-demo',
      ctaSecondaryLabel: d.ctaSecondaryLabel?.trim() || null,
      ctaSecondaryUrl: d.ctaSecondaryUrl?.trim() || null,
      showTrustBar: d.showTrustBar ?? false,
      featuresJson: JSON.stringify(d.features ?? []),
      content: d.content || '',
      showHeader: d.showHeader ?? true,
      showFooter: d.showFooter ?? true,
      showLeadForm: d.showLeadForm ?? true,
      leadDefaultProduct: d.leadDefaultProduct?.trim() || null,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      metaKeywords: d.metaKeywords?.trim() || null,
      status: d.status,
    },
  });

  return json({ success: true, page });
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID landing page tidak valid.' }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Payload JSON tidak valid.' }, 400);
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Status harus draft atau published.' }, 400);

  const page = await db.landingPage.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return json({ success: true, page });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'ID landing page tidak valid.' }, 400);

  await db.landingPage.delete({ where: { id } });
  return json({ success: true });
};
