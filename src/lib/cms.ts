import type { Post as PrismaPost, LandingPage as PrismaLandingPage } from '../../prisma/generated';
import { getDb } from './db';
import mockPosts from '@/content/mock/posts.json';
import type { Post as LegacyPost } from '@/types/content';

export interface PostRecord {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  subheading: string | null;
  category: string | null;
  author: string | null;
  authorImage: string | null;
  authorBadge: string | null;
  authorBio: string | null;
  showAuthor: boolean;
  reviewerName: string | null;
  reviewerImage: string | null;
  reviewerBadge: string | null;
  reviewerBio: string | null;
  showReviewer: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  status: 'draft' | 'published';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LandingFeatureItem {
  badge?: string;
  title: string;
  description: string;
}

export interface LandingPageRecord {
  id: number;
  title: string;
  slug: string;
  template: 'hero' | 'minimal';
  badgeText: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImage: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  ctaSecondaryLabel: string | null;
  ctaSecondaryUrl: string | null;
  showTrustBar: boolean;
  featuresJson: string;
  features: LandingFeatureItem[];
  content: string;
  showHeader: boolean;
  showFooter: boolean;
  showLeadForm: boolean;
  leadDefaultProduct: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  status: 'draft' | 'published';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export function parseLandingFeatures(raw: string | null | undefined): LandingFeatureItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.title === 'string')
      .map((x) => ({
        badge: typeof x.badge === 'string' ? x.badge : undefined,
        title: String(x.title),
        description: String(x.description || ''),
      }));
  } catch {
    return [];
  }
}

function mapPrismaLanding(lp: PrismaLandingPage): LandingPageRecord {
  return {
    ...lp,
    template: lp.template === 'minimal' ? 'minimal' : 'hero',
    features: parseLandingFeatures(lp.featuresJson),
  };
}

export function legacyMockToRecord(p: LegacyPost, index: number): PostRecord {
  const created = p.publishedAt ? new Date(p.publishedAt) : new Date();
  const updated = p.updatedAt ? new Date(p.updatedAt) : created;
  return {
    id: index + 1,
    title: p.title,
    slug: p.slug,
    content: p.content,
    imageUrl: p.featuredImage?.url || '/images/articles/article-thumb-1.jpg',
    subheading: p.quickAnswerSummary || p.excerpt || null,
    category: p.categories?.[0]?.name || 'Technology',
    author: p.author?.name || 'Admin SAI',
    authorImage: p.author?.avatarUrl || null,
    authorBadge: p.author?.role || 'Penulis',
    authorBio: p.author?.bio || null,
    showAuthor: true,
    reviewerName: null,
    reviewerImage: null,
    reviewerBadge: null,
    reviewerBio: null,
    showReviewer: false,
    metaTitle: p.seo?.title || p.title,
    metaDescription: p.seo?.description || p.excerpt || null,
    metaKeywords: p.tags?.map((t) => t.name).join(', ') || null,
    status: 'published',
    views: 0,
    createdAt: created,
    updatedAt: updated,
  };
}

export async function getPublishedPosts(limit?: number): Promise<{ posts: PostRecord[]; fromDb: boolean }> {
  const db = getDb();
  if (db) {
    try {
      const rows: PrismaPost[] = await db.post.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
      });
      return { posts: rows, fromDb: true };
    } catch {
    }
  }
  const fallback = (mockPosts as unknown as LegacyPost[]).map(legacyMockToRecord);
  return { posts: limit ? fallback.slice(0, limit) : fallback, fromDb: false };
}

export async function getPostBySlug(slug: string, includeDraft = false): Promise<{ post: PostRecord | null; fromDb: boolean }> {
  const db = getDb();
  if (db) {
    try {
      const row = await db.post.findUnique({ where: { slug } });
      if (row && (includeDraft || row.status === 'published')) {
        return { post: row, fromDb: true };
      }
      if (!includeDraft) {
        return { post: null, fromDb: true };
      }
      return { post: row, fromDb: true };
    } catch {
    }
  }
  const found = (mockPosts as unknown as LegacyPost[]).map(legacyMockToRecord).find((p) => p.slug === slug) || null;
  return { post: found, fromDb: false };
}

export async function getAdminPosts(): Promise<{ posts: PostRecord[]; dbReady: boolean }> {
  const db = getDb();
  if (!db) return { posts: [], dbReady: false };
  try {
    const rows = await db.post.findMany({ orderBy: { createdAt: 'desc' } });
    return { posts: rows, dbReady: true };
  } catch {
    return { posts: [], dbReady: false };
  }
}

export async function getLandingPageBySlug(
  slug: string,
  includeDraft = false
): Promise<{ page: LandingPageRecord | null; fromDb: boolean }> {
  const db = getDb();
  if (!db) return { page: null, fromDb: false };
  try {
    const row = await db.landingPage.findUnique({ where: { slug } });
    if (!row) return { page: null, fromDb: true };
    if (!includeDraft && row.status !== 'published') return { page: null, fromDb: true };
    return { page: mapPrismaLanding(row), fromDb: true };
  } catch {
    return { page: null, fromDb: false };
  }
}

export async function getAdminLandingPages(): Promise<{ pages: LandingPageRecord[]; dbReady: boolean }> {
  const db = getDb();
  if (!db) return { pages: [], dbReady: false };
  try {
    const rows = await db.landingPage.findMany({ orderBy: { createdAt: 'desc' } });
    return { pages: rows.map(mapPrismaLanding), dbReady: true };
  } catch {
    return { pages: [], dbReady: false };
  }
}

export function postRecordToLegacy(post: PostRecord): LegacyPost {
  const catName = post.category || 'Technology';
  const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'technology';
  const wordCount = (post.content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    publishedAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
    excerpt: post.metaDescription || post.subheading || post.title,
    quickAnswerSummary: post.subheading || post.metaDescription || '',
    content: post.content,
    featuredImage: {
      url: post.imageUrl || '/images/articles/article-thumb-1.jpg',
      alt: post.title,
      width: 1200,
      height: 630,
    },
    categories: [{ id: `cat-${catSlug}`, name: catName, slug: catSlug }],
    tags: (post.metaKeywords || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .map((k, i) => ({
        id: `tag-${i}`,
        name: k,
        slug: k.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
    author: {
      id: 'sai-author',
      name: post.author || 'Admin SAI',
      slug: (post.author || 'admin-sai').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      role: post.authorBadge || 'Editorial Team',
      bio: post.authorBio || 'Tim SolusiAplikasi.id',
      avatarUrl: post.authorImage || '/images/LogoHeader.png',
    },
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    seo: {
      title: post.metaTitle || `${post.title} | SolusiAplikasi.id`,
      description: post.metaDescription || post.subheading || post.title,
      canonical: `https://solusiaplikasi.id/articles/${post.slug}`,
      ogImage: post.imageUrl || '/images/articles/article-thumb-1.jpg',
    },
  };
}
