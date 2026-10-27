import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('solusi_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const updateConsentMode = (status: 'accepted' | 'declined') => {
    localStorage.setItem('solusi_cookie_consent', status);

    // Google Tag / Consent Mode update
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: status === 'accepted' ? 'granted' : 'denied',
          ad_storage: status === 'accepted' ? 'granted' : 'denied',
        });
      }

      // Notify any other analytics listeners on page
      window.dispatchEvent(
        new CustomEvent('cookie_consent_update', {
          detail: { status },
        })
      );
    }

    setIsVisible(false);
  };

  const handleAccept = () => {
    updateConsentMode('accepted');
  };

  const handleDecline = () => {
    updateConsentMode('declined');
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Pemberitahuan Privasi dan Cookie"
      className="fixed bottom-3 sm:bottom-4 left-3 sm:left-4 z-50 w-[calc(100%-1.5rem)] sm:max-w-[310px] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-900 tracking-tight">Privasi &amp; Cookie</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60 font-mono">
            UU PDP
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-snug mb-3">
        Kami menggunakan cookie esensial dan analitik anonim untuk performa situs optimal sesuai kepatuhan UU PDP No. 27/2022.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDecline}
          type="button"
          className="flex-1 py-1.5 px-2 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-all duration-150 cursor-pointer text-center"
        >
          Hanya Esensial
        </button>
        <button
          onClick={handleAccept}
          type="button"
          className="flex-1 py-1.5 px-2 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-all duration-150 cursor-pointer text-center"
        >
          Setujui Semua
        </button>
      </div>
    </div>
  );
}
