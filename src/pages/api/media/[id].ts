import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { parseNumericId } from '@/lib/api-helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = parseNumericId(params.id);
  if (!id) return new Response('Not found', { status: 404 });

  const db = getDb();
  if (!db) return new Response('Database unavailable', { status: 503 });

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(asset.data), {
    status: 200,
    headers: {
      'Content-Type': asset.mimeType,
      'Content-Length': String(asset.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
