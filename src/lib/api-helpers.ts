import type { AstroCookies } from 'astro';
import { getSessionFromCookies, type AdminSessionPayload } from './auth';
import { getDb, type PrismaClient } from './db';
import { stripHtml } from './toc';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function requireAuth(cookies: AstroCookies): AdminSessionPayload | Response {
  const session = getSessionFromCookies(cookies);
  if (!session) {
    return json({ error: 'Unauthorized: silakan login terlebih dahulu.' }, 401);
  }
  return session;
}

export function requireDb(): PrismaClient | Response {
  const db = getDb();
  if (!db) {
    return json(
      { error: 'DATABASE_URL belum dikonfigurasi pada environment server.' },
      503
    );
  }
  return db;
}

export function parseNumericId(raw: string | undefined): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function resolveSeoMeta(
  title: string,
  metaTitle: string | undefined | null,
  metaDescription: string | undefined | null,
  subheading: string | undefined | null,
  content: string
) {
  const resolvedTitle = metaTitle?.trim() || title.trim();
  let resolvedDescription = metaDescription?.trim() || '';
  if (!resolvedDescription) {
    resolvedDescription = stripHtml(content).slice(0, 155) || subheading?.trim() || '';
  }
  return {
    metaTitle: resolvedTitle,
    metaDescription: resolvedDescription || null,
  };
}
