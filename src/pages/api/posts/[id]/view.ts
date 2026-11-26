import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { json, parseNumericId } from '@/lib/api-helpers';

export const prerender = false;

export const POST: APIRoute = async ({ params }) => {
  const id = parseNumericId(params.id);
  if (!id) return json({ error: 'Invalid id' }, 400);

  const db = getDb();
  if (!db) return json({ ok: false });

  try {
    const post = await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return json({ ok: true, views: post.views });
  } catch {
    return json({ ok: false }, 404);
  }
};
