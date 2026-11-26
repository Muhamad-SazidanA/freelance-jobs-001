import type { APIRoute } from 'astro';
import { clearSessionCookie } from '@/lib/auth';
import { json } from '@/lib/api-helpers';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  clearSessionCookie(cookies);
  return json({ success: true });
};
