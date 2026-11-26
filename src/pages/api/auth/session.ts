import type { APIRoute } from 'astro';
import { getSessionFromCookies } from '@/lib/auth';
import { json } from '@/lib/api-helpers';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const session = getSessionFromCookies(cookies);
  if (!session) return json({ authenticated: false }, 401);
  return json({ authenticated: true, user: session });
};
