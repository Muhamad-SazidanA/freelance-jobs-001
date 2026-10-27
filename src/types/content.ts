export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatarUrl: string;
  credentials?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt: string;
  excerpt: string;
  content: string;
  quickAnswerSummary: string; // 40-60 words GEO/AEO direct answer (PRD 7)
  featuredImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  author: Author;
  readingTimeMinutes: number;
  faqs?: Array<{ question: string; answer: string }>;
  seo: SeoMetadata;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  headline: string;
  tagline: string;
  heroImage: string;
  overview: string;
  features: Array<{ title: string; description: string }>;
  benefits: string[];
  useCases: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  summary: string;
  description: string;
  benefits: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedCaseStudySlugs?: string[];
  seo: SeoMetadata;
}

export interface Portfolio {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  industry: string;
  challenge: string;
  solution: string;
  resultsMetrics: Array<{ label: string; value: string }>;
  techStack: string[];
  featuredImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  gallery?: string[];
  testimonial?: {
    quote: string;
    authorName: string;
    authorRole: string;
    authorCompany: string;
  };
  seo: SeoMetadata;
}

export type SectionType =
  | 'hero'
  | 'problem_solution'
  | 'features'
  | 'services'
  | 'stats'
  | 'client_logos'
  | 'testimonials'
  | 'pricing'
  | 'comparison'
  | 'faq'
  | 'gallery'
  | 'video'
  | 'form'
  | 'cta'
  | 'rich_text';

export interface BaseSection {
  id: string;
  type: SectionType;
  isActive: boolean;
  order: number;
}

export interface HeroSectionData extends BaseSection {
  type: 'hero';
  heading: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  badge?: string;
}

export interface ProblemSolutionSectionData extends BaseSection {
  type: 'problem_solution';
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solutions: string[];
}

export interface FeaturesSectionData extends BaseSection {
  type: 'features';
  title: string;
  description?: string;
  features: Array<{ title: string; description: string; icon?: string }>;
}

export interface StatsSectionData extends BaseSection {
  type: 'stats';
  title?: string;
  stats: Array<{ number: string; label: string }>;
}

export interface ClientLogosSectionData extends BaseSection {
  type: 'client_logos';
  title?: string;
  logos: Array<{ name: string; logoUrl: string }>;
}

export interface TestimonialSectionData extends BaseSection {
  type: 'testimonials';
  title: string;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
    company: string;
    avatarUrl?: string;
  }>;
}

export interface PricingSectionData extends BaseSection {
  type: 'pricing';
  title: string;
  subtitle?: string;
  packages: Array<{
    name: string;
    price: string;
    features: string[];
    isPopular?: boolean;
    ctaText: string;
    ctaUrl: string;
  }>;
}

export interface ComparisonTableSectionData extends BaseSection {
  type: 'comparison';
  title: string;
  columns: string[];
  rows: Array<{ feature: string; values: (string | boolean)[] }>;
}

export interface FaqSectionData extends BaseSection {
  type: 'faq';
  title: string;
  subtitle?: string;
  items: Array<{ question: string; answer: string }>;
}

export interface CtaSectionData extends BaseSection {
  type: 'cta';
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  whatsappDirect?: boolean;
}

export interface FormSectionData extends BaseSection {
  type: 'form';
  title: string;
  description?: string;
  formType: 'contact' | 'lead' | 'consultation';
}

export interface RichTextSectionData extends BaseSection {
  type: 'rich_text';
  content: string;
}

export interface GallerySectionData extends BaseSection {
  type: 'gallery';
  title?: string;
  images?: Array<{ url: string; alt?: string }>;
}

export interface VideoSectionData extends BaseSection {
  type: 'video';
  title?: string;
  youtubeId?: string;
}

export type SectionData =
  | HeroSectionData
  | ProblemSolutionSectionData
  | FeaturesSectionData
  | StatsSectionData
  | ClientLogosSectionData
  | TestimonialSectionData
  | PricingSectionData
  | ComparisonTableSectionData
  | FaqSectionData
  | GallerySectionData
  | VideoSectionData
  | CtaSectionData
  | FormSectionData
  | RichTextSectionData;

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  layoutMode: 'full' | 'conversion_focus'; // conversion_focus hides nav & footer (PRD 6.2)
  campaignStartDate?: string;
  campaignEndDate?: string;
  sections: SectionData[];
  seo: SeoMetadata;
  tracking?: {
    customPixels?: string;
    utmCampaign?: string;
  };
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  metaKeywords?: string[];
}

export interface SiteOptions {
  companyName: string;
  tagline: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    workingHours: string;
  };
  socialMedia: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
  organizationSchema: {
    legalName: string;
    foundingYear: number;
    taxId?: string;
  };
}
