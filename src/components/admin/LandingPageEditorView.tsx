import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Loader2,
  Plus,
  Save,
  Sliders,
  Trash2,
} from 'lucide-react';
import AdminShell from './AdminShell';
import CustomModal, { type ModalConfig } from './CustomModal';
import ImageUploadBox from './ImageUploadBox';
import RichContentEditor from './RichContentEditor';
import SeoMetaFields from './SeoMetaFields';
import {
  requestJson,
  slugifyInput,
  type AdminUserInfo,
  type SerializedLandingPage,
} from './cmsClient';
import type { LandingFeatureItem } from '@/lib/cms';

interface LandingPageEditorViewProps {
  user: AdminUserInfo;
  mode: 'create' | 'edit';
  initialPage?: SerializedLandingPage | null;
  dbConfigured: boolean;
}

const LEAD_PRODUCTS = [
  { value: '', label: 'Default / Bebas Pilih' },
  { value: 'nanonets', label: 'Nanonets AI OCR' },
  { value: 'cyclone', label: 'Cyclone RPA' },
  { value: 'docuflo', label: 'Docuflo DMS' },
  { value: 'syclus', label: 'Syclus Procurement' },
  { value: 'spensify', label: 'Spensify Expense' },
  { value: 'multi', label: 'Solusi Multi-Produk' },
];

export default function LandingPageEditorView({
  user,
  mode,
  initialPage = null,
  dbConfigured,
}: LandingPageEditorViewProps) {
  const [title, setTitle] = useState(initialPage?.title || '');
  const [slug, setSlug] = useState(initialPage?.slug || '');
  const [slugManual, setSlugManual] = useState(Boolean(initialPage?.slug));
  const [template, setTemplate] = useState<'hero' | 'minimal'>(initialPage?.template || 'hero');

  const [badgeText, setBadgeText] = useState(initialPage?.badgeText || '');
  const [heroTitle, setHeroTitle] = useState(initialPage?.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(initialPage?.heroSubtitle || '');
  const [heroImage, setHeroImage] = useState(initialPage?.heroImage || '');
  const [ctaLabel, setCtaLabel] = useState(initialPage?.ctaLabel || 'Request Demo');
  const [ctaUrl, setCtaUrl] = useState(initialPage?.ctaUrl || '#form-konsultasi');
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(
    initialPage?.ctaSecondaryLabel || ''
  );
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(initialPage?.ctaSecondaryUrl || '');

  const [features, setFeatures] = useState<LandingFeatureItem[]>(initialPage?.features || []);
  const [content, setContent] = useState(initialPage?.content || '');

  const [showHeader, setShowHeader] = useState(initialPage?.showHeader ?? false);
  const [showFooter, setShowFooter] = useState(initialPage?.showFooter ?? false);
  const [showTrustBar, setShowTrustBar] = useState(initialPage?.showTrustBar ?? true);
  const [showLeadForm, setShowLeadForm] = useState(initialPage?.showLeadForm ?? true);
  const [leadDefaultProduct, setLeadDefaultProduct] = useState(
    initialPage?.leadDefaultProduct || ''
  );

  const [metaTitle, setMetaTitle] = useState(initialPage?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialPage?.metaDescription || '');
  const [metaKeywords, setMetaKeywords] = useState(initialPage?.metaKeywords || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialPage?.status || 'draft');

  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual && mode === 'create') {
      setSlug(slugifyInput(val));
    }
  };

  const addFeatureCard = () => {
    setFeatures((prev) => [...prev, { badge: '', title: '', description: '' }]);
  };

  const updateFeatureCard = (
    idx: number,
    patch: Partial<LandingFeatureItem>
  ) => {
    setFeatures((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const removeFeatureCard = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (targetStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Judul Halaman Wajib Diisi',
        message: 'Masukkan judul utama untuk landing page terlebih dahulu.',
        onConfirm: closeModal,
      });
      return;
    }

    const validFeatures = features
      .filter((f) => f.title.trim())
      .map((f) => ({
        badge: f.badge?.trim() || undefined,
        title: f.title.trim(),
        description: f.description.trim(),
      }));

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: (slug.trim() || slugifyInput(title)) || undefined,
        template,
        badgeText: badgeText.trim() || null,
        heroTitle: heroTitle.trim() || null,
        heroSubtitle: heroSubtitle.trim() || null,
        heroImage: heroImage.trim() || null,
        ctaLabel: ctaLabel.trim() || 'Request Demo',
        ctaUrl: ctaUrl.trim() || '#form-konsultasi',
        ctaSecondaryLabel: ctaSecondaryLabel.trim() || null,
        ctaSecondaryUrl: ctaSecondaryUrl.trim() || null,
        showTrustBar,
        features: validFeatures,
        content,
        showHeader,
        showFooter,
        showLeadForm,
        leadDefaultProduct: leadDefaultProduct || null,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        metaKeywords: metaKeywords.trim() || null,
        status: targetStatus,
      };

      const endpoint =
        mode === 'edit' && initialPage
          ? `/api/landing-pages/${initialPage.id}`
          : '/api/landing-pages';
      const method = mode === 'edit' && initialPage ? 'PUT' : 'POST';

      const data = await requestJson<{ page: SerializedLandingPage }>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setStatus(data.page.status);
      setModal({
        isOpen: true,
        type: 'success',
        title:
          targetStatus === 'published'
            ? 'Landing Page Berhasil Dirilis!'
            : 'Draft Landing Page Tersimpan',
        message:
          targetStatus === 'published'
            ? `Halaman "${data.page.title}" aktif di /lp/${data.page.slug}.`
            : `Draft "${data.page.title}" berhasil disimpan.`,
        confirmLabel: mode === 'create' ? 'Lanjut Edit' : 'OK',
        onConfirm: () => {
          closeModal();
          if (mode === 'create') {
            window.location.href = `/admin/landing-pages/edit/${data.page.id}`;
          }
        },
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan Landing Page',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.',
        onConfirm: closeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialPage) return;
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Hapus Landing Page?',
      message: `Yakin ingin menghapus "${initialPage.title}" secara permanen?`,
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        setSaving(true);
        try {
          await requestJson(`/api/landing-pages/${initialPage.id}`, { method: 'DELETE' });
          window.location.href = '/admin/landing-pages';
        } catch (err) {
          setSaving(false);
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Gagal Menghapus',
            message: err instanceof Error ? err.message : 'Terjadi kesalahan.',
            onConfirm: closeModal,
          });
        }
      },
    });
  };

  const previewHref =
    initialPage?.slug || slug
      ? status === 'published'
        ? `/lp/${initialPage?.slug || slug}`
        : `/lp/preview/${initialPage?.slug || slug}`
      : '';

  return (
    <AdminShell
      activeNav="landing-pages"
      pageTitle={
        mode === 'edit' ? 'Edit Stand-Alone Landing Page' : 'Buat Stand-Alone Landing Page'
      }
      pageSubtitle="Builder terstruktur (Hero/Minimal, Kartu Keunggulan, Blok Konten Visual, & Lead Form)"
      user={user}
      dbConfigured={dbConfigured}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/admin/landing-pages"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#006cb7]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Landing Pages</span>
          </a>

          {mode === 'edit' && previewHref && (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#006cb7] text-xs font-bold text-slate-700 hover:text-[#006cb7]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{status === 'published' ? 'Buka Halaman Live' : 'Pratinjau Draft'}</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Konfigurasi Hero &amp; Identitas</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nama Halaman / Kampanye <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Promo Otomasi Invoice Finance 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">URL Slug</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-[#006cb7]">
                    <span className="pl-3 pr-1 text-xs text-slate-400 font-mono">/lp/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlugManual(true);
                        setSlug(e.target.value);
                      }}
                      placeholder="otomatis-dari-judul"
                      className="flex-1 py-2.5 pr-3 bg-transparent text-xs font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Badge / Eyebrow (Opsional)
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Contoh: ENTERPRISE AI AUTOMATION"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Hero Headline (Opsional, default ke Nama Halaman)
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Headline utama besar di atas lipatan..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Subjudul penjelas value proposition utama untuk pengunjung..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                />
              </div>

              <ImageUploadBox
                label="Gambar Hero / Banner (Opsional)"
                value={heroImage}
                onChange={setHeroImage}
                aspectClass="aspect-[16/9]"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Label Tombol CTA Utama
                  </label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Request Demo"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Link / Anchor CTA Utama
                  </label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="#form-konsultasi atau /request-demo"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Label CTA Sekunder (Opsional)
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryLabel}
                    onChange={(e) => setCtaSecondaryLabel(e.target.value)}
                    placeholder="Pelajari Studi Kasus"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Link CTA Sekunder (Opsional)
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryUrl}
                    onChange={(e) => setCtaSecondaryUrl(e.target.value)}
                    placeholder="#detail-solusi"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#006cb7]" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Kartu Keunggulan / Highlights ({features.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addFeatureCard}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-[#006cb7] hover:bg-sky-100 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kartu</span>
                </button>
              </div>

              {features.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">
                  Opsional: Tambahkan 3-6 kartu fitur atau metrik ROI yang tampil di bawah Hero /
                  Trust Bar.
                </p>
              ) : (
                <div className="space-y-3">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          Kartu #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFeatureCard(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          aria-label="Hapus kartu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          value={feat.badge || ''}
                          onChange={(e) => updateFeatureCard(idx, { badge: e.target.value })}
                          placeholder="Badge (cth: +90% Cepat)"
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006cb7]"
                        />
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => updateFeatureCard(idx, { title: e.target.value })}
                          placeholder="Judul fitur / nilai jual"
                          className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#006cb7]"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={feat.description}
                        onChange={(e) => updateFeatureCard(idx, { description: e.target.value })}
                        placeholder="Deskripsi singkat manfaat fitur ini..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006cb7]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <RichContentEditor
              label="Blok Konten Detail (Opsional)"
              value={content}
              onChange={setContent}
              placeholder="Tulis detail program, FAQ, atau studi kasus dalam HTML / Visual BlockNote..."
            />

            <SeoMetaFields
              showMetaTitle={true}
              metaTitle={metaTitle}
              onMetaTitleChange={setMetaTitle}
              metaDescription={metaDescription}
              onMetaDescriptionChange={setMetaDescription}
              metaKeywords={metaKeywords}
              onMetaKeywordsChange={setMetaKeywords}
            />
          </div>

          <div className="space-y-6 lg:sticky lg:top-20">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Status Publikasi</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {status === 'published' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>{status === 'published' ? 'Terbit' : 'Draft'}</span>
                </span>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={!dbConfigured || saving}
                  onClick={() => handleSubmit('published')}
                  className="w-full py-3 px-4 rounded-xl bg-[#006cb7] hover:bg-[#005ba1] text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{mode === 'edit' && status === 'published' ? 'Perbarui Landing Page' : 'Terbitkan Landing Page'}</span>
                </button>
                <button
                  type="button"
                  disabled={!dbConfigured || saving}
                  onClick={() => handleSubmit('draft')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Simpan sebagai Draft
                </button>
              </div>

              {mode === 'edit' && initialPage && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={!dbConfigured || saving}
                    onClick={handleDelete}
                    className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Landing Page</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-4 h-4 text-[#006cb7]" />
                <h3 className="text-sm font-bold text-slate-800">Template &amp; Modul</h3>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">Gaya Template</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTemplate('hero')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      template === 'hero'
                        ? 'border-[#006cb7] bg-sky-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800">Hero Gradient</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Gelap elegan bergradasi</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplate('minimal')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      template === 'minimal'
                        ? 'border-[#006cb7] bg-sky-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800">Minimal Bersih</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Putih fokus konversi</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {[
                  {
                    label: 'Tampilkan Header Website',
                    checked: showHeader,
                    onChange: setShowHeader,
                  },
                  {
                    label: 'Tampilkan Footer Website',
                    checked: showFooter,
                    onChange: setShowFooter,
                  },
                  {
                    label: 'Tampilkan Client Trust Bar',
                    checked: showTrustBar,
                    onChange: setShowTrustBar,
                  },
                  {
                    label: 'Tampilkan Form Konsultasi CTA',
                    checked: showLeadForm,
                    onChange: setShowLeadForm,
                  },
                ].map((toggle) => (
                  <label
                    key={toggle.label}
                    className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <span>{toggle.label}</span>
                    <input
                      type="checkbox"
                      checked={toggle.checked}
                      onChange={(e) => toggle.onChange(e.target.checked)}
                      className="w-4 h-4 accent-[#006cb7] rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {showLeadForm && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-600">
                    Produk Default Form Konsultasi
                  </label>
                  <select
                    value={leadDefaultProduct}
                    onChange={(e) => setLeadDefaultProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#006cb7]"
                  >
                    {LEAD_PRODUCTS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomModal {...modal} />
    </AdminShell>
  );
}
