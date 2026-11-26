import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { hashPassword, setSessionCookie, verifyPasswordHash } from '@/lib/auth';
import { json } from '@/lib/api-helpers';

export const prerender = false;

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Format request tidak valid.' }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Email/Username dan kata sandi wajib diisi.' }, 400);
  }

  const identifier = parsed.data.identifier.trim().toLowerCase();
  const plainPassword = parsed.data.password.trim();

  const envUser = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const envEmail = (process.env.ADMIN_EMAIL || 'admin@solusiaplikasi.id').trim().toLowerCase();
  const envPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim() || '';

  const isEnvIdentifier = identifier === envUser || identifier === envEmail;

  const db = getDb();
  if (db) {
    try {
      let user = await db.adminUser.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
      });

      if (!user && isEnvIdentifier && envPasswordHash && verifyPasswordHash(plainPassword, envPasswordHash)) {
        const count = await db.adminUser.count();
        if (count === 0) {
          user = await db.adminUser.create({
            data: {
              email: envEmail,
              username: envUser,
              passwordHash: envPasswordHash.startsWith('scrypt:')
                ? envPasswordHash
                : hashPassword(plainPassword),
              name: 'Admin SAI',
            },
          });
        }
      }

      if (user && verifyPasswordHash(plainPassword, user.passwordHash)) {
        setSessionCookie(
          cookies,
          {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
          },
          request
        );
        return json({ success: true, user: { name: user.name, email: user.email, username: user.username } });
      }
    } catch {
    }
  }

  if (isEnvIdentifier && envPasswordHash && verifyPasswordHash(plainPassword, envPasswordHash)) {
    setSessionCookie(
      cookies,
      {
        id: 'env-admin',
        email: envEmail,
        username: envUser,
        name: 'Admin SAI',
      },
      request
    );
    return json({ success: true, user: { name: 'Admin SAI', email: envEmail, username: envUser } });
  }

  return json({ error: 'Email/Username atau kata sandi tidak cocok.' }, 401);
};
