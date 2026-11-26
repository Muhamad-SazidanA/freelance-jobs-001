import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
  UserCheck,
  UserPen,
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
  type SerializedPost,
} from './cmsClient';

interface ArticleEditorViewProps {
  user: AdminUserInfo;
  mode: 'create' | 'edit';
  initialPost?: SerializedPost | null;
  dbConfigured: boolean;
}

const DEFAULT_CATEGORIES = [
  'AI & Finance',
  'Enterprise RPA',
  'Tata Kelola Arsip',
  'Arsitektur Cloud',
  'ERP & Expense',
  'Technology',
  'News',
];

function CreditToggleField({
  title,
  icon: Icon,
  enabled,
  onToggle,
  name,
  onNameChange,
  badge,
  onBadgeChange,
  image,
  onImageChange,
  bio,
  onBioChange,
  namePlaceholder,
  badgePlaceholder,
}: {
  title: string;
  icon: typeof UserPen;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  name: string;
  onNameChange: (v: string) => void;
  badge: string;
  onBadgeChange: (v: string) => void;
  image: string;
  onImageChange: (v: string) => void;
  bio: string;
  onBioChange: (v: string) => void;
  namePlaceholder: string;
  badgePlaceholder: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#006cb7]" />
          <span className="text-xs font-bold text-slate-800">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
            enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {enabled ? 'Tampil: ON' : 'Sembunyi: OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={namePlaceholder}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006cb7]"
        />
        <input
          type="text"
          value={badge}
          onChange={(e) => onBadgeChange(e.target.value)}
          placeholder={badgePlaceholder}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006cb7]"
        />
      </div>

      <ImageUploadBox
        label="Foto Profil (Opsional)"
        value={image}
        onChange={onImageChange}
        compact={true}
        placeholder="URL atau unggah avatar..."
      />

      <textarea
        rows={2}
        value={bio}
        onChange={(e) => onBioChange(e.target.value)}
        placeholder="Bio singkat atau kredensial..."
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006cb7] resize-y"
      />
    </div>
  );
}

export default function ArticleEditorView({
  user,
  mode,
  initialPost = null,
  dbConfigured,
}: ArticleEditorViewProps) {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [slugManual, setSlugManual] = useState(Boolean(initialPost?.slug));
  const [subheading, setSubheading] = useState(initialPost?.subheading || '');
  const [category, setCategory] = useState(initialPost?.category || 'Technology');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState(initialPost?.imageUrl || '');
  const [content, setContent] = useState(initialPost?.content || '');

  const [author, setAuthor] = useState(initialPost?.author || 'Tim Redaksi SAI');
  const [authorImage, setAuthorImage] = useState(initialPost?.authorImage || '');
  const [authorBadge, setAuthorBadge] = useState(
    initialPost?.authorBadge || 'Enterprise Automation Writer'
  );
  const [authorBio, setAuthorBio] = useState(initialPost?.authorBio || '');
  const [showAuthor, setShowAuthor] = useState(initialPost?.showAuthor ?? true);

  const [reviewerName, setReviewerName] = useState(initialPost?.reviewerName || '');
  const [reviewerImage, setReviewerImage] = useState(initialPost?.reviewerImage || '');
  const [reviewerBadge, setReviewerBadge] = useState(initialPost?.reviewerBadge || '');
  const [reviewerBio, setReviewerBio] = useState(initialPost?.reviewerBio || '');
  const [showReviewer, setShowReviewer] = useState(initialPost?.showReviewer ?? false);

  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.metaDescription || '');
  const [metaKeywords, setMetaKeywords] = useState(initialPost?.metaKeywords || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status || 'draft');

  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const resolvedCategory =
    category === '__custom__' ? customCategory.trim() || 'Technology' : category;

  const isPresetCategory = DEFAULT_CATEGORIES.includes(category);
  const categoryOptions =
    !isPresetCategory && category && category !== '__custom__'
      ? [...DEFAULT_CATEGORIES, category]
      : DEFAULT_CATEGORIES;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual && mode === 'create') {
      setSlug(slugifyInput(val));
    }
  };

  const handleSubmit = async (targetStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Judul Wajib Diisi',
        message: 'Silakan masukkan judul artikel terlebih dahulu.',
        onConfirm: closeModal,
      });
      return;
    }

    if (!content.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Konten Kosong',
        message: 'Silakan tulis isi artikel sebelum menyimpan.',
        onConfirm: closeModal,
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: (slug.trim() || slugifyInput(title)) || undefined,
        subheading: subheading.trim() || null,
        category: resolvedCategory,
        imageUrl: imageUrl.trim() || null,
        content,
        author: author.trim() || 'Tim Redaksi SAI',
        authorImage: authorImage.trim() || null,
        authorBadge: authorBadge.trim() || null,
        authorBio: authorBio.trim() || null,
        showAuthor,
        reviewerName: reviewerName.trim() || null,
        reviewerImage: reviewerImage.trim() || null,
        reviewerBadge: reviewerBadge.trim() || null,
        reviewerBio: reviewerBio.trim() || null,
        showReviewer,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        metaKeywords: metaKeywords.trim() || null,
        status: targetStatus,
      };

      const endpoint =
        mode === 'edit' && initialPost ? `/api/posts/${initialPost.id}` : '/api/posts';
      const method = mode === 'edit' && initialPost ? 'PUT' : 'POST';

      const data = await requestJson<{ post: SerializedPost }>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setStatus(data.post.status);
      setModal({
        isOpen: true,
        type: 'success',
        title:
          targetStatus === 'published' ? 'Artikel Berhasil Diterbitkan!' : 'Draft Artikel Tersimpan',
        message:
          targetStatus === 'published'
            ? `Artikel "${data.post.title}" kini aktif di /articles/${data.post.slug}.`
            : `Draft "${data.post.title}" berhasil disimpan.`,
        confirmLabel: mode === 'create' ? 'Lanjut Edit' : 'OK',
        onConfirm: () => {
          closeModal();
          if (mode === 'create') {
            window.location.href = `/admin/blog/edit/${data.post.id}`;
          }
        },
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan Artikel',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.',
        onConfirm: closeModal,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialPost) return;
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Hapus Artikel Permanen?',
      message: `Yakin ingin menghapus "${initialPost.title}" secara permanen?`,
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        setSaving(true);
        try {
          await requestJson(`/api/posts/${initialPost.id}`, { method: 'DELETE' });
          window.location.href = '/admin/blog';
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

  const previewUrl =
    initialPost?.slug || slug
      ? status === 'published'
        ? `/articles/${initialPost?.slug || slug}`
        : `/articles/preview/${initialPost?.slug || slug}`
      : '';

  return (
    <AdminShell
      activeNav="blog"
      pageTitle={mode === 'edit' ? 'Edit Artikel Blog' : 'Buat Artikel Blog Baru'}
      pageSubtitle="Editor visual BlockNote, kontrol kredit penulis/reviewer E-E-A-T, & optimasi SEO"
      user={user}
      dbConfigured={dbConfigured}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#006cb7]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Artikel</span>
          </a>

          {mode === 'edit' && previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#006cb7] text-xs font-bold text-slate-700 hover:text-[#006cb7] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{status === 'published' ? 'Lihat Artikel Live' : 'Pratinjau Draft'}</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <ImageUploadBox
                label="Gambar Sampul (Featured Image 21:9)"
                value={imageUrl}
                onChange={setImageUrl}
                aspectClass="aspect-[21/9]"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Judul Artikel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: Panduan Lengkap Otomasi Invoice OCR untuk Enterprise"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">URL Slug</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-[#006cb7]">
                    <span className="pl-3 pr-1 text-xs text-slate-400 font-mono">/articles/</span>
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

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                  >
                    {categoryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                    <option value="__custom__">+ Kategori Kustom...</option>
                  </select>
                  {category === '__custom__' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Nama kategori baru..."
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006cb7]"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  Subjudul / Ringkasan Pendek (Excerpt)
                </label>
                <input
                  type="text"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  placeholder="Ringkasan singkat yang muncul di daftar kartu artikel..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
                />
              </div>
            </div>

            <RichContentEditor
              label="Isi Artikel"
              value={content}
              onChange={setContent}
              required={true}
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
                  <span>{mode === 'edit' && status === 'published' ? 'Perbarui & Terbitkan' : 'Terbitkan Artikel'}</span>
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

              {mode === 'edit' && initialPost && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={!dbConfigured || saving}
                    onClick={handleDelete}
                    className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Artikel Permanen</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                Kredit Penulis &amp; Reviewer (E-E-A-T)
              </h3>

              <CreditToggleField
                title="Penulis Artikel"
                icon={UserPen}
                enabled={showAuthor}
                onToggle={setShowAuthor}
                name={author}
                onNameChange={setAuthor}
                badge={authorBadge}
                onBadgeChange={setAuthorBadge}
                image={authorImage}
                onImageChange={setAuthorImage}
                bio={authorBio}
                onBioChange={setAuthorBio}
                namePlaceholder="Nama penulis"
                badgePlaceholder="Jabatan / Badge (cth: Cloud Architect)"
              />

              <CreditToggleField
                title="Technical Reviewer"
                icon={UserCheck}
                enabled={showReviewer}
                onToggle={setShowReviewer}
                name={reviewerName}
                onNameChange={setReviewerName}
                badge={reviewerBadge}
                onBadgeChange={setReviewerBadge}
                image={reviewerImage}
                onImageChange={setReviewerImage}
                bio={reviewerBio}
                onBioChange={setReviewerBio}
                namePlaceholder="Nama reviewer"
                badgePlaceholder="Jabatan / Badge reviewer"
              />
            </div>
          </div>
        </div>
      </div>

      <CustomModal {...modal} />
    </AdminShell>
  );
}
