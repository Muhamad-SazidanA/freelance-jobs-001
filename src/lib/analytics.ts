/**
 * Analytics and Conversion Event Dispatcher
 * Dispatches events to GA4 (gtag), GTM (dataLayer), or Meta Pixel (fbq)
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  // If user explicitly declined non-essential cookies, consent is false
  return localStorage.getItem('solusi_cookie_consent') === 'accepted';
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  const consent = localStorage.getItem('solusi_cookie_consent');

  // UU PDP / Privacy compliance: Suppress tracking if user explicitly declined non-essential cookies
  if (consent === 'declined') {
    if (import.meta.env.DEV) {
      console.log(`[Analytics Suppressed - Hanya Esensial]: Event "${eventName}" not sent.`);
    }
    return;
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  // Google Tag Manager
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, params);
  }

  if (import.meta.env.DEV) {
    console.log(`[Analytics Event: ${eventName}]`, params);
  }
}

export function trackWhatsAppClick(pageUrl: string, placement: string) {
  trackEvent('whatsapp_click', {
    page_location: pageUrl,
    button_placement: placement,
  });
}

export function trackFormSubmission(formType: string, leadSource: string) {
  trackEvent('generate_lead', {
    form_type: formType,
    lead_source: leadSource,
  });
}
