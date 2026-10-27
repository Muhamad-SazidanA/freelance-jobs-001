import type { APIRoute } from 'astro';
import { getAllPosts, getSiteOptions } from '@/content/loaders/wp-graphql-loader';

export const GET: APIRoute = async (context) => {
  const posts = await getAllPosts();
  const options = await getSiteOptions();
  const siteUrl = context.site?.origin || 'https://solusiaplikasi.id';

  const itemsXml = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/articles/${post.slug}</link>
      <guid>${siteUrl}/articles/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${post.author.name}</author>
    </item>`
    )
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${options.companyName} Articles</title>
    <link>${siteUrl}/articles</link>
    <description>${options.tagline}</description>
    <language>id-ID</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
