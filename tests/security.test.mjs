import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

test('Security: .env file must NOT be tracked by git', () => {
  try {
    const gitTracked = execSync('git ls-files .env', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
    assert.equal(gitTracked, '', '.env should never be tracked by git');
  } catch (err) {
    assert.fail(`Git command failed: ${err.message}`);
  }
});

test('Security: .gitignore must contain .env and secret patterns', () => {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  assert.ok(fs.existsSync(gitignorePath), '.gitignore must exist');
  const content = fs.readFileSync(gitignorePath, 'utf8');
  assert.match(content, /\.env/, '.gitignore must ignore .env files');
});

test('Security: .env.example must only contain placeholders, not real secrets', () => {
  const envExamplePath = path.join(ROOT_DIR, '.env.example');
  assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
  const content = fs.readFileSync(envExamplePath, 'utf8');

  // Verify placeholder values
  assert.ok(!content.includes('solusi_admin_secure_access_2026'), '.env.example must not contain live admin access token');
  assert.ok(!content.includes('admin2026'), '.env.example must not contain hardcoded default passwords');
});

test('Security: Source code (src/) must not contain hardcoded admin tokens or passwords', () => {
  const forbiddenPatterns = [
    'solusi_admin_secure_access_2026',
    'admin2026',
    'solusi2026',
  ];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?|astro|json)$/.test(entry.name)) {
        const text = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of forbiddenPatterns) {
          assert.ok(
            !text.includes(pattern),
            `Found forbidden pattern "${pattern}" in source file: ${path.relative(ROOT_DIR, fullPath)}`
          );
        }
      }
    }
  }

  scanDir(path.join(ROOT_DIR, 'src'));
});

test('Security: Apache .htaccess must block access to sensitive files', () => {
  const htaccessPath = path.join(ROOT_DIR, 'public/.htaccess');
  assert.ok(fs.existsSync(htaccessPath), 'public/.htaccess must exist');
  const content = fs.readFileSync(htaccessPath, 'utf8');

  assert.match(content, /FilesMatch.*env/, '.htaccess must deny access to .env files');
  assert.match(content, /Options\s+-Indexes/, '.htaccess must disable directory indexing (-Indexes)');
});
