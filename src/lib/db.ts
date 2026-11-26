import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PrismaClient as GeneratedPrismaClient } from '../../prisma/generated';

const require = createRequire(import.meta.url);

export type PrismaClient = GeneratedPrismaClient;

const globalForPrisma = globalThis as unknown as { prisma?: GeneratedPrismaClient };

function resolveGeneratedClientPath(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), 'prisma/generated/index.js'),
    path.resolve(currentDir, '../../prisma/generated/index.js'),
    path.resolve(currentDir, '../../../prisma/generated/index.js'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb(): GeneratedPrismaClient | null {
  if (!isDatabaseConfigured()) return null;
  if (!globalForPrisma.prisma) {
    const mod = require(resolveGeneratedClientPath()) as typeof import('../../prisma/generated');
    globalForPrisma.prisma = new mod.PrismaClient();
  }
  return globalForPrisma.prisma;
}
