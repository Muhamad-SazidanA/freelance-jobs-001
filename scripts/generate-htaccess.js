/**
 * Script: generate-htaccess.js
 * Reference: PRD Section 11A (Apache 2.4 .htaccess dynamic rewrite rules)
 * Injects 301 redirects managed in WordPress into dist/.htaccess
 */

import fs from 'node:fs';
import path from 'node:path';

const distPath = path.resolve('dist');
const htaccessPath = path.join(distPath, '.htaccess');
const redirectsJsonPath = path.resolve('src/content/mock/redirects.json');

async function injectRedirects() {
  if (!fs.existsSync(htaccessPath)) {
    console.warn('[htaccess] No dist/.htaccess found. Creating one from public/.htaccess');
    const sourceHtaccess = path.resolve('public/.htaccess');
    if (fs.existsSync(sourceHtaccess)) {
      if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });
      fs.copyFileSync(sourceHtaccess, htaccessPath);
    } else {
      console.error('[htaccess] public/.htaccess not found.');
      return;
    }
  }

  let redirects = [];
  if (fs.existsSync(redirectsJsonPath)) {
    try {
      redirects = JSON.parse(fs.readFileSync(redirectsJsonPath, 'utf8'));
    } catch (e) {
      console.warn('[htaccess] Could not parse redirects.json:', e.message);
    }
  }

  let htaccessContent = fs.readFileSync(htaccessPath, 'utf8');

  const redirectRules = redirects
    .map((r) => `RewriteRule ^${r.fromPath.replace(/^\//, '')}$ ${r.toPath} [R=${r.statusCode || 301},L]`)
    .join('\n');

  const markerStart = '# BEGIN WP_DYNAMIC_REDIRECTS';
  const markerEnd = '# END WP_DYNAMIC_REDIRECTS';

  const replacement = `${markerStart}\n<IfModule mod_rewrite.c>\nRewriteEngine On\n${redirectRules}\n</IfModule>\n${markerEnd}`;

  if (htaccessContent.includes(markerStart) && htaccessContent.includes(markerEnd)) {
    htaccessContent = htaccessContent.replace(
      new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`),
      replacement
    );
  } else {
    htaccessContent += `\n\n${replacement}\n`;
  }

  fs.writeFileSync(htaccessPath, htaccessContent, 'utf8');
  console.log(`[htaccess] Successfully injected ${redirects.length} dynamic redirect rules into dist/.htaccess`);
}

injectRedirects();
