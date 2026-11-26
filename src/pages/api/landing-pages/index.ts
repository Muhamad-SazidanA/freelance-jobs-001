import type { APIRoute } from 'astro';
import { z } from 'zod';
import { json, requireAuth, requireDb, resolveSeoMeta } from '@/lib/api-helpers';
import { generateUniqueSlug } from '@/lib/slug';

export const prerender = false;

export const landingPageSchema = z.object({
  title: z.string().min(1, 'Judul halaman wajib diisi.').max(255),
  slug: z.string().max(255).optional(),
  template: z.enum(['hero', 'minimal']).default('hero'),
  badgeText: z.string().max(120).nullish(),
  heroTitle: z.string().max(255).nullish(),
  heroSubtitle: z.string().nullish(),
  heroImage: z.string().nullish(),
  ctaLabel: z.string().max(100).nullish(),
  ctaUrl: z.string().max(500).nullish(),
  ctaSecondaryLabel: z.string().max(100).nullish(),
  ctaSecondaryUrl: z.string().max(500).nullish(),
  showTrustBar: z.boolean().optional(),
  features: z
    .array(
      z.object({
        badge: z.string().max(60).optional(),
        title: z.string().min(1).max(160),
        description: z.string().max(600),
      })
    )
    .optional(),
  content: z.string().default(''),
  showHeader: z.boolean().optional(),
  showFooter: z.boolean().optional(),
  showLeadForm: z.boolean().optional(),
  leadDefaultProduct: z.string().max(80).nullish(),
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

  const pages = await db.landingPage.findMany({ orderBy: { createdAt: 'desc' } });
  return json({ pages });
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

  const parsed = landingPageSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message || 'Data landing page tidak valid.' }, 400);
  }

  const d = parsed.data;
  const slug = await generateUniqueSlug('landingPage', d.slug?.trim() || d.title);
  const seo = resolveSeoMeta(
    d.title,
    d.metaTitle,
    d.metaDescription,
    d.heroSubtitle,
    d.content || d.heroSubtitle || d.title
  );

  const page = await db.landingPage.create({
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

  return json({ success: true, page }, 201);
};
