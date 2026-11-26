import type { AstroGlobal } from 'astro';
import { getSessionFromCookies, type AdminSessionPayload } from './auth';
import { isDatabaseConfigured } from './db';

export interface AdminPageContext {
  session: AdminSessionPayload;
  dbConfigured: boolean;
}

export function resolveAdminPage(Astro: AstroGlobal): AdminPageContext | Response {
  const session = getSessionFromCookies(Astro.cookies);
  if (!session) {
    const target = `${Astro.url.pathname}${Astro.url.search}`;
    return Astro.redirect(`/login?from=${encodeURIComponent(target)}`);
  }
  return {
    session,
    dbConfigured: isDatabaseConfigured(),
  };
}
