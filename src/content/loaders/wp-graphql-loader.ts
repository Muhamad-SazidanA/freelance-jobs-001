import type { Post, SiteOptions, Product } from '@/types/content';
import mockPosts from '@/content/mock/posts.json';
import mockProducts from '@/content/mock/products.json';
import mockSiteOptions from '@/content/mock/site-options.json';

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || 'https://solusiaplikasi.id/solution/graphql';
const WP_BUILD_TOKEN = process.env.WP_BUILD_TOKEN || '';
const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== 'false';

/**
 * Generic GraphQL fetcher with fallback to local mock fixtures.
 */
export async function fetchGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T | null> {
  if (USE_MOCK_DATA) {
    return null;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SolusiAplikasi-StaticBuild/4.1',
    };

    if (WP_BUILD_TOKEN) {
      headers['Authorization'] = `Bearer ${WP_BUILD_TOKEN}`;
      headers['X-Build-Token'] = WP_BUILD_TOKEN;
    }

    const response = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.warn(`[WPGraphQL] Request failed with HTTP ${response.status}. Falling back to mock data.`);
      return null;
    }

    const json = await response.json();
    if (json.errors) {
      console.warn(`[WPGraphQL] Errors returned:`, json.errors);
      return null;
    }

    return json.data as T;
  } catch (err) {
    console.warn(`[WPGraphQL] Connection error: ${(err as Error).message}. Falling back to mock fixtures.`);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  if (!USE_MOCK_DATA) {
    const query = `
      query GetAllPosts {
        posts(first: 100, where: { status: PUBLISH }) {
          nodes {
            id
            slug
            title
            date
            modified
            excerpt
            content
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
            categories {
              nodes {
                id
                name
                slug
              }
            }
            tags {
              nodes {
                id
                name
                slug
              }
            }
            author {
              node {
                id
                name
                slug
                description
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    `;
    const data = await fetchGraphQL<{ posts?: { nodes?: any[] } }>(query);
    if (data?.posts?.nodes && data.posts.nodes.length > 0) {
      return data.posts.nodes.map((node: any) => ({
        id: String(node.id),
        slug: node.slug,
        title: node.title,
        publishedAt: node.date,
        updatedAt: node.modified || node.date,
        excerpt: node.excerpt ? node.excerpt.replace(/<[^>]+>/g, '').trim() : '',
        content: node.content || '',
        quickAnswerSummary: '',
        featuredImage: {
          url: node.featuredImage?.node?.sourceUrl || '/images/articles/article-thumb-1.jpg',
          alt: node.featuredImage?.node?.altText || node.title,
          width: node.featuredImage?.node?.mediaDetails?.width || 1200,
          height: node.featuredImage?.node?.mediaDetails?.height || 630,
        },
        categories: (node.categories?.nodes || []).map((c: any) => ({
          id: String(c.id),
          name: c.name,
          slug: c.slug,
        })),
        tags: (node.tags?.nodes || []).map((t: any) => ({
          id: String(t.id),
          name: t.name,
          slug: t.slug,
        })),
        author: {
          id: String(node.author?.node?.id || '1'),
          name: node.author?.node?.name || 'Tim SAI',
          slug: node.author?.node?.slug || 'tim-sai',
          role: 'Editorial Team',
          bio: node.author?.node?.description || 'Tim SolusiAplikasi.id',
          avatarUrl: node.author?.node?.avatar?.url || '/images/team/avatar-default.webp',
        },
        readingTimeMinutes: Math.max(1, Math.round((node.content || '').split(/\s+/).length / 200)),
        seo: {
          metaTitle: node.title,
          metaDescription: node.excerpt ? node.excerpt.replace(/<[^>]+>/g, '').trim() : '',
          canonicalUrl: `https://solusiaplikasi.id/articles/${node.slug}`,
          ogTitle: node.title,
          ogDescription: node.excerpt ? node.excerpt.replace(/<[^>]+>/g, '').trim() : '',
          ogImage: node.featuredImage?.node?.sourceUrl || '/images/articles/article-thumb-1.jpg',
        },
      }));
    }
  }
  return mockPosts as unknown as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getAllProducts(): Promise<Product[]> {
  return mockProducts as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug);
}

export async function getSiteOptions(): Promise<SiteOptions> {
  return mockSiteOptions as unknown as SiteOptions;
}
