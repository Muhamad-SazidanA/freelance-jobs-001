import { getDb } from './db';
import { slugifyText } from './toc';

export async function generateUniqueSlug(
  model: 'post' | 'landingPage',
  source: string,
  excludeId?: number
): Promise<string> {
  const baseSlug = slugifyText(source) || 'untitled';
  const db = getDb();
  if (!db) return baseSlug;

  const where = {
    slug: { startsWith: baseSlug },
    ...(excludeId ? { NOT: { id: excludeId } } : {}),
  };

  const rows =
    model === 'post'
      ? await db.post.findMany({ where, select: { slug: true } })
      : await db.landingPage.findMany({ where, select: { slug: true } });

  if (rows.length === 0) return baseSlug;
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(baseSlug)) return baseSlug;

  let i = 1;
  while (taken.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}
