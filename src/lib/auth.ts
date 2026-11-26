import { createHmac, randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const SESSION_COOKIE = 'sai_admin_session';

const EPHEMERAL_SECRET = randomBytes(32).toString('hex');

export interface AdminSessionPayload {
  id: number | string;
  email: string;
  username: string;
  name: string;
  exp: number;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.WP_ADMIN_SECRET_KEY ||
    EPHEMERAL_SECRET
  );
}

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPasswordHash(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash) return false;
  if (storedHash.startsWith('scrypt:')) {
    const [, salt, hex] = storedHash.split(':');
    if (!salt || !hex) return false;
    const expected = Buffer.from(hex, 'hex');
    const actual = scryptSync(plain, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
  const sha = createHash('sha256').update(plain).digest('hex');
  const a = Buffer.from(sha, 'utf8');
  const b = Buffer.from(storedHash.trim().toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signSessionToken(payload: AdminSessionPayload): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  const sig = createHmac('sha256', getSessionSecret())
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifySessionToken(token: string): AdminSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    if (!header || !body || !sig) return null;

    const expectedSig = createHmac('sha256', getSessionSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(fromBase64Url(body)) as AdminSessionPayload;
    if (!payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromCookies(cookies: AstroCookies): AdminSessionPayload | null {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(
  cookies: AstroCookies,
  user: Omit<AdminSessionPayload, 'exp'>,
  request?: Request
) {
  const token = signSessionToken({
    ...user,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const protoHeader = request?.headers.get('x-forwarded-proto') || '';
  const isHttps = request
    ? request.url.startsWith('https://') || protoHeader.includes('https')
    : process.env.NODE_ENV === 'production';

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}
