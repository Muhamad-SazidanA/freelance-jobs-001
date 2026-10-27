import type { Post, SiteOptions, Product } from '@/types/content';
import type { BreadcrumbItem, FaqItem } from '@/types/schema';

const SITE_URL = 'https://solusiaplikasi.id';

export function generateOrganizationSchema(options: SiteOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: options.companyName,
    legalName: options.organizationSchema.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/LogoHeader.png`,
    description: options.tagline,
    telephone: options.contact.phone,
    email: options.contact.email,
    foundingDate: `${options.organizationSchema.foundingYear}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: options.address.street,
      addressLocality: options.address.city,
      addressRegion: options.address.province,
      postalCode: options.address.postalCode,
      addressCountry: options.address.country,
    },
    sameAs: [
      options.socialMedia.linkedin,
      options.socialMedia.github,
      options.socialMedia.twitter,
    ].filter(Boolean),
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Solusi Aplikasi Integrasi',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'id-ID',
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateBlogPostSchema(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/articles/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/articles/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: 'id-ID',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${post.slug}`,
    },
    image: {
      '@type': 'ImageObject',
      url: post.featuredImage.url,
      width: post.featuredImage.width,
      height: post.featuredImage.height,
    },
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `${SITE_URL}/articles`,
      jobTitle: post.author.role,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/products/${product.slug}#software`,
    name: product.name,
    headline: product.headline,
    description: product.overview,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Cloud / Web-based',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      description: 'Hubungi tim untuk demo & penawaran enterprise',
    },
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function generateFaqSchema(faqs: FaqItem[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
