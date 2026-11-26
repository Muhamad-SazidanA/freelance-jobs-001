import type { APIRoute } from 'astro';
import { json, requireAuth, requireDb } from '@/lib/api-helpers';

export const prerender = false;

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = requireAuth(cookies);
  if (auth instanceof Response) return auth;

  const db = requireDb();
  if (db instanceof Response) return db;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Gunakan multipart form-data untuk upload gambar.' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'File gambar tidak ditemukan.' }, 400);
  }

  if (!ALLOWED_MIME.has(file.type.toLowerCase())) {
    return json({ error: 'Format gambar harus PNG, JPG, WEBP, GIF, atau SVG.' }, 400);
  }

  if (file.size > MAX_FILE_BYTES) {
    return json({ error: 'Ukuran gambar maksimal 2MB.' }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const asset = await db.mediaAsset.create({
    data: {
      filename: file.name || 'upload.webp',
      mimeType: file.type,
      size: file.size,
      data: Buffer.from(arrayBuffer),
    },
    select: { id: true, filename: true, mimeType: true, size: true },
  });

  return json({
    success: true,
    id: asset.id,
    url: `/api/media/${asset.id}`,
    filename: asset.filename,
    size: asset.size,
  }, 201);
};
