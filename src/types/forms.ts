export interface LeadSubmissionPayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  sourceUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  turnstileToken: string;
  honeypot?: string; // Bot protection
}

export interface LeadSubmissionResponse {
  success: boolean;
  message: string;
  leadId?: string | number;
  errors?: Record<string, string>;
}
