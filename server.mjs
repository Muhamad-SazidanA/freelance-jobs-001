import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve('.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    console.error('Failed reading .env:', err);
  }
}

if (!process.env.HOST) {
  process.env.HOST = '0.0.0.0';
}

if (process.env.PORT && !/^\d+$/.test(process.env.PORT)) {
  delete process.env.PORT;
}

await import('./dist/server/entry.mjs');
