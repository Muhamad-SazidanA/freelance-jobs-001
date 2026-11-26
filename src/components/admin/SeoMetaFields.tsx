import { useState, type KeyboardEvent } from 'react';
import { Hash, Sparkles, X } from 'lucide-react';

interface SeoMetaFieldsProps {
  metaTitle?: string;
  onMetaTitleChange?: (val: string) => void;
  showMetaTitle?: boolean;
  metaDescription: string;
  onMetaDescriptionChange: (val: string) => void;
  metaKeywords: string;
  onMetaKeywordsChange: (val: string) => void;
}

export default function SeoMetaFields({
  metaTitle = '',
  onMetaTitleChange,
  showMetaTitle = false,
  metaDescription,
  onMetaDescriptionChange,
  metaKeywords,
  onMetaKeywordsChange,
}: SeoMetaFieldsProps) {
  const [keywordInput, setKeywordInput] = useState('');

  const tags = metaKeywords
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const descLength = metaDescription.trim().length;
  const barPercent = Math.min(100, Math.round((descLength / 160) * 100));

  const descStatus =
    descLength === 0
      ? {
          color: 'text-slate-400',
          barColor: 'bg-slate-300',
          label: 'Belum diisi (rekomendasi 120-160 karakter)',
        }
      : descLength >= 120 && descLength <= 160
      ? {
          color: 'text-emerald-600',
          barColor: 'bg-emerald-500',
          label: `Optimal (${descLength}/160 karakter)`,
        }
      : descLength <= 180
      ? {
          color: 'text-amber-600',
          barColor: 'bg-amber-500',
          label:
            descLength < 120
              ? `Terlalu singkat (${descLength}/160 karakter)`
              : `Sedikit panjang (${descLength}/160 karakter)`,
        }
      : {
          color: 'text-rose-600',
          barColor: 'bg-rose-500',
          label: `Melebihi batas (${descLength}/160 karakter)`,
        };

  const commitTags = (raw: string) => {
    const incoming = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;

    const merged = Array.from(new Set([...tags, ...incoming]));
    onMetaKeywordsChange(merged.join(', '));
    setKeywordInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTags(keywordInput);
    } else if (e.key === 'Backspace' && !keywordInput && tags.length > 0) {
      onMetaKeywordsChange(tags.slice(0, -1).join(', '));
    }
  };

  const removeTag = (target: string) => {
    onMetaKeywordsChange(tags.filter((item) => item !== target).join(', '));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Sparkles className="w-4 h-4 text-[#006cb7]" />
        <h3 className="text-sm font-bold text-slate-800">Optimasi SEO &amp; Metadata</h3>
      </div>

      {showMetaTitle && onMetaTitleChange && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600">
            Meta Title (Opsional)
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Kosongkan untuk otomatis mengikuti judul utama..."
            maxLength={255}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-600">Meta Description</label>
          <span className={`text-[11px] font-semibold ${descStatus.color}`}>
            {descStatus.label}
          </span>
        </div>
        <textarea
          rows={3}
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="Ringkasan menarik untuk mesin pencari Google (ideal 120-160 karakter)..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7] resize-y"
        />
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${descStatus.barColor}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <span>Meta Keywords / Tags</span>
        </label>
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-[#006cb7]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#006cb7]/10 text-[#006cb7] text-xs font-semibold"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Hapus tag ${tag}`}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => commitTags(keywordInput)}
            placeholder={
              tags.length === 0 ? 'Ketik kata kunci lalu tekan Enter atau koma...' : 'Tambah tag...'
            }
            className="flex-1 min-w-[160px] bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1 px-1"
          />
        </div>
      </div>
    </div>
  );
}
