export type SchemaType =
  | 'Organization'
  | 'LocalBusiness'
  | 'ProfessionalService'
  | 'WebSite'
  | 'WebPage'
  | 'BreadcrumbList'
  | 'BlogPosting'
  | 'Service'
  | 'FAQPage'
  | 'Person'
  | 'ImageObject';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
