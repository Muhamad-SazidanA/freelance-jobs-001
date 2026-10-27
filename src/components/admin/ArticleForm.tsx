import { useState, type KeyboardEvent, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Eye,
  Pin,
  Calendar,
  Trash2,
  ChevronUp,
} from 'lucide-react';
import RichArticleEditor from './RichArticleEditor';
import CustomModal from './CustomModal';
import type { Post } from '@/types/content';

export interface ArticleFormData {
  id?: string;
  title: string;
  subheading: string;
  slug: string;
  category: string;
  author: string;
  authorImage: string | null;
  authorBadge: string;
  authorBio: string;
  showAuthor: boolean;
  reviewerName: string;
  reviewerImage: string | null;
  reviewerBadge: string;
  reviewerBio: string;
  showReviewer: boolean;
  content: string;
  imageFile: string | null;
  metaDescription: string;
  keywords: string[];
  status: 'draft' | 'published';
}

interface ArticleFormProps {
  initialData?: Post | null;
  onSave: (articleData: ArticleFormData) => void;
  onCancel: () => void;
}

export default function ArticleForm({ initialData, onSave, onCancel }: ArticleFormProps) {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'success' | 'error' | 'warning' | 'confirm';
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [title, setTitle] = useState(initialData?.title || '');
  const [subheading, setSubheading] = useState(
    // @ts-expect-error optional extended property
    initialData?.subheading || initialData?.quickAnswerSummary || ''
  );
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(
    initialData?.categories?.[0]?.name || 'Technology'
  );

  const [author, setAuthor] = useState(initialData?.author?.name || 'Tim SolusiAplikasi.id');
  const [authorImage, setAuthorImage] = useState<string | null>(
    initialData?.author?.avatarUrl || null
  );
  // @ts-expect-error optional extended property
  const [authorBadge, setAuthorBadge] = useState(initialData?.authorBadge || 'Penulis');
  const [authorBio, setAuthorBio] = useState(
    initialData?.author?.bio || 'Tim editorial & konsultan teknologi enterprise SolusiAplikasi.id.'
  );
  // @ts-expect-error optional extended property
  const [showAuthor, setShowAuthor] = useState(initialData?.showAuthor !== false);

  // @ts-expect-error optional extended property
  const [reviewerName, setReviewerName] = useState(initialData?.reviewerName || '');
  // @ts-expect-error optional extended property
  const [reviewerImage, setReviewerImage] = useState<string | null>(initialData?.reviewerImage || null);
  // @ts-expect-error optional extended property
  const [reviewerBadge, setReviewerBadge] = useState(initialData?.reviewerBadge || 'Expert Reviewer');
  // @ts-expect-error optional extended property
  const [reviewerBio, setReviewerBio] = useState(initialData?.reviewerBio || '');
  // @ts-expect-error optional extended property
  const [showReviewer, setShowReviewer] = useState(Boolean(initialData?.showReviewer));

  const [content, setContent] = useState(initialData?.content || '');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [imageFile, setImageFile] = useState<string | null>(initialData?.featuredImage?.url || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAuthorImage, setIsUploadingAuthorImage] = useState(false);
  const [isUploadingReviewerImage, setIsUploadingReviewerImage] = useState(false);

  const [metaDescription, setMetaDescription] = useState(initialData?.seo?.description || '');
  const [keywords, setKeywords] = useState<string[]>(
    initialData?.tags?.map((t) => t.name) || ['Enterprise', 'Teknologi']
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper read file as Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Featured Image Upload
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageFile(dataUrl);
    } catch {
      setError('Gagal memuat gambar.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAuthorImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAuthorImage(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAuthorImage(dataUrl);
    } catch {
      setError('Gagal memuat foto penulis.');
    } finally {
      setIsUploadingAuthorImage(false);
    }
  };

  const handleReviewerImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReviewerImage(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReviewerImage(dataUrl);
    } catch {
      setError('Gagal memuat foto reviewer.');
    } finally {
      setIsUploadingReviewerImage(false);
    }
  };

  // Keywords handling
  const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  };

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(',')) {
      const keyword = value.slice(0, -1).trim();
      if (keyword && !keywords.includes(keyword)) {
        setKeywords([...keywords, keyword]);
      }
      setKeywordInput('');
    } else {
      setKeywordInput(value);
    }
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    setKeywords(keywords.filter((_, index) => index !== indexToRemove));
  };

  // SEO Description helper status
  const getMetaDescriptionStatus = () => {
    const len = metaDescription.length;
    if (len === 0)
      return {
        text: 'Kosong - otomatis menggunakan ringkasan artikel',
        color: 'text-slate-400',
        progressColor: 'bg-slate-300',
        percent: 0,
      };
    if (len < 120)
      return {
        text: `Terlalu pendek (${len}/120-160 karakter direkomendasikan)`,
        color: 'text-amber-500',
        progressColor: 'bg-amber-500',
        percent: (len / 180) * 100,
      };
    if (len <= 160)
      return {
        text: `Panjang ideal SEO! (${len}/160 karakter)`,
        color: 'text-emerald-500',
        progressColor: 'bg-emerald-500',
        percent: (len / 180) * 100,
      };
    if (len <= 180)
      return {
        text: `Sedikit panjang (${len}/180 maks)`,
        color: 'text-amber-500',
        progressColor: 'bg-amber-500',
        percent: (len / 180) * 100,
      };
    return {
      text: `Terlalu panjang (${len}/180 maks, akan terpotong)`,
      color: 'text-rose-500',
      progressColor: 'bg-rose-500',
      percent: 100,
    };
  };

  const descStatus = getMetaDescriptionStatus();

  const handleSubmit = (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('Mohon masukkan judul artikel.');
      return;
    }
    if (!content.trim()) {
      setError('Mohon isi konten artikel sebelum menyimpan.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const formData: ArticleFormData = {
      id: initialData?.id,
      title: title.trim(),
      subheading: subheading.trim(),
      slug: generatedSlug,
      category,
      author: author.trim(),
      authorImage,
      authorBadge,
      authorBio: authorBio.trim(),
      showAuthor,
      reviewerName: reviewerName.trim(),
      reviewerImage,
      reviewerBadge,
      reviewerBio: reviewerBio.trim(),
      showReviewer,
      content,
      imageFile,
      metaDescription: metaDescription.trim() || subheading.trim(),
      keywords,
      status,
    };

    onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <button
              onClick={onCancel}
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Articles</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">
              {initialData ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {initialData ? 'Edit Artikel' : 'Tulis Artikel Baru'}
          </h1>
        </div>

        {/* Action Button: Preview Changes */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModalConfig({
                isOpen: true,
                type: 'info',
                title: 'Pratinjau Artikel',
                message:
                  'Artikel dapat langsung dilihat di halaman web setelah disimpan atau dipublikasikan.',
                confirmLabel: 'Mengerti',
                onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
              });
            }}
            className="px-4 py-2 border border-slate-700 bg-slate-900 text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 font-semibold text-xs shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Preview Artikel</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Article Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Foto Utama (Featured Image) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Foto Utama Artikel (Featured Image)
              </label>

              {imageFile ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 group aspect-16/9 bg-slate-950 flex items-center justify-center">
                  <img
                    src={imageFile}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/80 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <ImageIcon className="w-6 h-6 text-sky-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mb-1">
                    Upload foto utama beresolusi tajam (Landscape 16:9 disarankan)
                  </p>
                  <p className="text-[11px] text-slate-500 mb-4">PNG, JPG, atau WEBP hingga 5MB</p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <label
                      className={`cursor-pointer px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all ${
                        isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto dari Komputer</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </>
                      )}
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt(
                          'Masukkan URL gambar online (contoh: https://images.unsplash.com/...):'
                        );
                        if (url) setImageFile(url);
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-700/80"
                    >
                      Input URL Gambar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Judul Artikel */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Judul Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Mengoptimalkan Efisiensi Keuangan Korporasi dengan AI OCR"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Subheading */}
            <div className="space-y-1.5">
              <label htmlFor="subheading" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Subheading / Ringkasan Tajuk
              </label>
              <input
                id="subheading"
                type="text"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                placeholder="Ringkasan singkat 1-2 kalimat pengantar di bawah judul..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Kategori & Slug URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Kategori Artikel
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="Technology">Technology</option>
                  <option value="AI & Automation">AI & Automation</option>
                  <option value="Enterprise IT">Enterprise IT</option>
                  <option value="Fintech and Economy">Fintech and Economy</option>
                  <option value="Document Management">Document Management</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Tips & Tricks">Tips & Tricks</option>
                  <option value="Company News">Company News</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Kustom Slug URL (Opsional)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="otomatis-dibuat-dari-judul"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Informasi Kredit Penulis & Reviewer */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-6">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
                <span>Informasi Kredit Penulis & Reviewer</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Ditampilkan di halaman artikel
                </span>
              </h3>

              {/* SECTION 1: Ditulis Oleh */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Ditulis Oleh (Author)
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-400">
                      {showAuthor ? 'Aktif (ON)' : 'Sembunyikan (OFF)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={showAuthor}
                      onChange={(e) => setShowAuthor(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </label>
                </div>

                {showAuthor && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nama Penulis
                        </label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Contoh: Rian Pratama, S.Kom"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Foto Profil Penulis
                        </label>
                        <div className="flex items-center gap-3">
                          {authorImage ? (
                            <div className="relative">
                              <img
                                src={authorImage}
                                alt="Author"
                                className="w-10 h-10 rounded-full object-cover border border-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => setAuthorImage(null)}
                                className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700">
                              Foto
                            </div>
                          )}
                          <label
                            className={`cursor-pointer px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 ${
                              isUploadingAuthorImage ? 'opacity-60 pointer-events-none' : ''
                            }`}
                          >
                            {isUploadingAuthorImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                                <span>Memproses...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 text-sky-400" />
                                <span>Pilih Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAuthorImageChange}
                                  className="hidden"
                                />
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Bio Penulis (Profil Singkat)
                      </label>
                      <textarea
                        rows={2}
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        placeholder="Contoh: Solutions Architect spesialis otomatisasi alur kerja enterprise..."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Direview Oleh */}
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Direview Oleh (Expert Reviewer)
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-400">
                      {showReviewer ? 'Aktif (ON)' : 'Sembunyikan (OFF)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={showReviewer}
                      onChange={(e) => setShowReviewer(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </label>
                </div>

                {showReviewer && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nama Reviewer
                        </label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Foto Reviewer
                        </label>
                        <div className="flex items-center gap-3">
                          {reviewerImage ? (
                            <div className="relative">
                              <img
                                src={reviewerImage}
                                alt="Reviewer"
                                className="w-10 h-10 rounded-full object-cover border border-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => setReviewerImage(null)}
                                className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700">
                              Foto
                            </div>
                          )}
                          <label
                            className={`cursor-pointer px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 ${
                              isUploadingReviewerImage ? 'opacity-60 pointer-events-none' : ''
                            }`}
                          >
                            {isUploadingReviewerImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                                <span>Memproses...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 text-emerald-400" />
                                <span>Pilih Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleReviewerImageChange}
                                  className="hidden"
                                />
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Bio / Kualifikasi Reviewer
                      </label>
                      <textarea
                        rows={2}
                        value={reviewerBio}
                        onChange={(e) => setReviewerBio(e.target.value)}
                        placeholder="Contoh: Praktisi audit keamanan dan compliance sistem perbankan..."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Konten Artikel (WYSIWYG Visual & HTML Editor) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Isi Konten Artikel <span className="text-rose-500">*</span>
              </label>
              <RichArticleEditor
                initialContent={content}
                onChange={(html) => setContent(html)}
                editorMode={editorMode}
                onModeChange={setEditorMode}
              />
            </div>

            {/* Meta Deskripsi (SEO) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="metaDescription"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Meta Deskripsi (SEO)
                </label>
                <span className={`text-xs font-medium ${descStatus.color}`}>
                  {descStatus.text}
                </span>
              </div>
              <textarea
                id="metaDescription"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Deskripsi ringkas yang tampil di hasil pencarian Google..."
                maxLength={250}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-none"
              />
              {metaDescription.length > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${descStatus.progressColor}`}
                    style={{ width: `${Math.min(descStatus.percent, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Meta Keywords / Tags */}
            <div className="space-y-2">
              <label htmlFor="keywordInput" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Kata Kunci (Meta Keywords & Tags)
              </label>
              <p className="text-[11px] text-slate-400">
                Ketik kata kunci lalu tekan <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-[10px] text-slate-300">Enter</kbd> atau tanda koma <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-[10px] text-slate-300">,</kbd> untuk menambahkan tag baru.
              </p>

              <div className="flex flex-wrap items-center gap-2 p-2.5 border border-slate-700 rounded-xl min-h-[46px] bg-slate-800 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-sky-300 bg-sky-950/80 border border-sky-800/80 rounded-full"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(idx)}
                      className="text-sky-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                <input
                  id="keywordInput"
                  type="text"
                  value={keywordInput}
                  onChange={handleKeywordChange}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder={keywords.length === 0 ? 'Contoh: AI, IDP, OCR, Enterprise...' : ''}
                  className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Publish Box & Actions Sidebar) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between font-bold text-sm text-white">
              <span>Publikasi Artikel</span>
              <ChevronUp className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-slate-400" />
                  <span>Status:</span>
                </div>
                <span className="font-bold text-sky-400">
                  {initialData?.seo?.title ? 'Tersimpan' : 'Baru'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Visibilitas:</span>
                </div>
                <span className="font-semibold text-emerald-400">Publik (Umum)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Jadwal Tayang:</span>
                </div>
                <span className="font-semibold text-sky-400">Langsung Terbit</span>
              </div>

              <hr className="border-slate-800" />

              {/* Action Buttons: Save Draft & Publish */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting || isUploadingImage}
                  className="flex-1 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer text-center disabled:opacity-50"
                >
                  Simpan Draf
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('published')}
                  disabled={isSubmitting || isUploadingImage}
                  className="flex-1 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-md shadow-sky-600/30 text-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Publish Artikel</span>
                  )}
                </button>
              </div>

              <hr className="border-slate-800" />

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setModalConfig({
                      isOpen: true,
                      type: 'confirm',
                      title: 'Batal Pembuatan Artikel',
                      message:
                        'Apakah Anda yakin ingin membatalkan pembuatan artikel ini? Perubahan yang belum disimpan akan hilang.',
                      confirmLabel: 'Ya, Batalkan',
                      cancelLabel: 'Lanjut Menulis',
                      onConfirm: () => {
                        setModalConfig((prev) => ({ ...prev, isOpen: false }));
                        onCancel();
                      },
                      onCancel: () => {
                        setModalConfig((prev) => ({ ...prev, isOpen: false }));
                      },
                    });
                  }}
                  className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Batalkan / Buang Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </div>
  );
}
