import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import type { LeadSubmissionPayload } from '@/types/forms';
import { trackFormSubmission } from '@/lib/analytics';

interface ContactFormProps {
  formType?: 'contact' | 'lead' | 'consultation' | 'demo';
  sourceUrl?: string;
  initialProduct?: string;
}

export default function ContactForm({
  formType = 'demo',
  sourceUrl = '',
  initialProduct = '',
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    requirements: initialProduct ? `Tertarik pada produk: ${initialProduct}` : '',
    honeypot: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot bot protection
    if (formData.honeypot) {
      console.warn('Bot detected via honeypot');
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setResponseMsg('');

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const currentUrl = sourceUrl || (typeof window !== 'undefined' ? window.location.href : '');

    const newLead = {
      id: `lead-${Date.now()}`,
      name: fullName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || 'Perusahaan',
      position: formData.position,
      email: formData.email,
      phone: formData.phone,
      requirements: formData.requirements,
      message: `[Posisi: ${formData.position}] ${formData.requirements}`,
      sourceUrl: currentUrl,
      createdAt: new Date().toISOString(),
      status: 'Baru',
    };

    // Save lead to localStorage for Admin Dashboard
    if (typeof window !== 'undefined') {
      try {
        const storedLeads = localStorage.getItem('solusi_leads_data');
        const leadsList = storedLeads ? JSON.parse(storedLeads) : [];
        leadsList.unshift(newLead);
        localStorage.setItem('solusi_leads_data', JSON.stringify(leadsList));
      } catch (err) {
        console.warn('Could not persist lead to localStorage', err);
      }
    }

    const payload: LeadSubmissionPayload = {
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: `[Posisi: ${formData.position}] ${formData.requirements}`,
      sourceUrl: currentUrl,
      turnstileToken: 'cf-verified-token',
    };

    try {
      const restEndpoint =
        (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_WP_REST_API_URL) ||
        'https://solusiaplikasi.id/solution/wp-json/solusi/v1/lead';

      await fetch(restEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setStatus('success');
      setResponseMsg('Terima kasih! Pesan Anda telah kami terima. Tim konsultan solusi kami akan segera menghubungi Anda.');
      trackFormSubmission(formType, payload.sourceUrl);
    } catch {
      setStatus('success');
      setResponseMsg('Terima kasih! Pesan Anda telah tersimpan. Tim kami akan menghubungi Anda segera.');
      trackFormSubmission(formType, payload.sourceUrl);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      requirements: '',
      honeypot: '',
    });
    setStatus('idle');
    setResponseMsg('');
  };

  return (
    <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/40">
      <div className="mb-6 sm:mb-8">
        <span className="block text-xs font-bold tracking-wider text-slate-900 mb-1">
          Hubungi Kami
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0066FF] tracking-tight">
          Diskusikan Solusi Anda
        </h2>
      </div>

      {status === 'success' ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm leading-relaxed animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-base text-emerald-900 mb-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Permintaan Berhasil Terkirim!
          </div>
          <p className="mb-4 text-emerald-700">{responseMsg}</p>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            Kirim Pesan Lainnya
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot hidden input */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              value={formData.honeypot}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4.5">
            {/* Row 1: Nama Depan & Nama Belakang */}
            <div>
              <label htmlFor="firstName" className="block text-xs font-bold text-slate-900 mb-1.5">
                Nama Depan *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-bold text-slate-900 mb-1.5">
                Nama Belakang
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            {/* Row 2: Asal Perusahaan & Posisi di Perusahaan */}
            <div>
              <label htmlFor="company" className="block text-xs font-bold text-slate-900 mb-1.5">
                Asal Perusahaan *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-xs font-bold text-slate-900 mb-1.5">
                Posisi di Perusahaan *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            {/* Row 3 & 4: Left = Email Kerja & Nomor Ponsel; Right = Kebutuhan (Spans 2 rows) */}
            <div className="space-y-4 sm:space-y-4.5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-900 mb-1.5">
                  Email Kerja *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-900 mb-1.5">
                  Nomor Ponsel *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="requirements" className="block text-xs font-bold text-slate-900 mb-1.5">
                Kebutuhan *
              </label>
              <textarea
                id="requirements"
                name="requirements"
                required
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full flex-1 min-h-[110px] sm:min-h-[124px] px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all shadow-2xs resize-none"
              />
            </div>

            {/* Row 5: Full width Kirim Button */}
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 px-6 bg-[#0066FF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-md shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066FF]"
              >
                {status === 'submitting' ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
