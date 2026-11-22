import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

test('Content: mock/posts.json integrity and schema validation', () => {
  const postsPath = path.join(ROOT_DIR, 'src/content/mock/posts.json');
  assert.ok(fs.existsSync(postsPath), 'posts.json must exist');

  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  assert.ok(Array.isArray(posts), 'posts.json must be an array');
  assert.ok(posts.length > 0, 'posts.json must not be empty');

  for (const post of posts) {
    assert.ok(post.id, `Post missing id: ${JSON.stringify(post.slug)}`);
    assert.ok(post.slug, `Post missing slug: ${JSON.stringify(post.title)}`);
    assert.ok(post.title, `Post ${post.slug} missing title`);
    assert.ok(post.publishedAt, `Post ${post.slug} missing publishedAt`);
    assert.ok(post.author && post.author.name, `Post ${post.slug} missing author.name`);
    assert.ok(post.featuredImage && post.featuredImage.url, `Post ${post.slug} missing featuredImage.url`);
    assert.ok(post.seo && post.seo.title && post.seo.description, `Post ${post.slug} missing seo metadata`);
  }
});

test('Content: mock/products.json integrity and schema validation', () => {
  const productsPath = path.join(ROOT_DIR, 'src/content/mock/products.json');
  assert.ok(fs.existsSync(productsPath), 'products.json must exist');

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  assert.ok(Array.isArray(products), 'products.json must be an array');
  assert.equal(products.length, 5, 'Must contain all 5 core products');

  const expectedSlugs = ['cyclone', 'docuflo', 'nanonets', 'spensify', 'syclus'];
  const actualSlugs = products.map((p) => p.slug);

  for (const slug of expectedSlugs) {
    assert.ok(actualSlugs.includes(slug), `Missing expected product slug: ${slug}`);
  }

  for (const product of products) {
    assert.ok(product.id, `Product missing id: ${product.slug}`);
    assert.ok(product.name, `Product missing name: ${product.slug}`);
    assert.ok(product.heroImage, `Product missing heroImage: ${product.slug}`);
    assert.ok(Array.isArray(product.features) && product.features.length > 0, `Product ${product.slug} missing features`);
    assert.ok(Array.isArray(product.benefits) && product.benefits.length > 0, `Product ${product.slug} missing benefits`);
  }
});

test('Content: mock/redirects.json integrity', () => {
  const redirectsPath = path.join(ROOT_DIR, 'src/content/mock/redirects.json');
  assert.ok(fs.existsSync(redirectsPath), 'redirects.json must exist');

  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
  assert.ok(Array.isArray(redirects), 'redirects.json must be an array');

  for (const r of redirects) {
    assert.ok(r.fromPath && r.fromPath.startsWith('/'), `Invalid fromPath: ${r.fromPath}`);
    assert.ok(r.toPath, `Invalid toPath: ${r.toPath}`);
    assert.ok([301, 302, 307, 308].includes(r.statusCode), `Invalid statusCode: ${r.statusCode}`);
  }
});
