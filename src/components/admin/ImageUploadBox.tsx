import { useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { uploadMediaAsset } from './cmsClient';

interface ImageUploadBoxProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectClass?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function ImageUploadBox({
  label,
  value,
  onChange,
  aspectClass = 'aspect-[21/9]',
  placeholder = 'https://... atau unggah gambar (<2MB)',
  compact = false,
}: ImageUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadMediaAsset(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (compact) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-600">{label}</label>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-11 h-11 rounded-full border border-dashed border-slate-300 bg-slate-50 hover:border-[#006cb7] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#006cb7]" />
            ) : value ? (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006cb7]"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Hapus foto"
              className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Gambar</span>
          </button>
        )}
      </div>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative w-full ${aspectClass} max-h-52 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#006cb7] bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer transition-colors group`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3.5 py-2 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-sm">
                Ganti Gambar
              </span>
            </div>
          </>
        ) : (
          <div className="text-center px-4 py-6 space-y-2">
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-[#006cb7] mx-auto" />
            ) : (
              <ImagePlus className="w-7 h-7 text-slate-400 mx-auto group-hover:text-[#006cb7] transition-colors" />
            )}
            <p className="text-xs font-semibold text-slate-600">
              {uploading ? 'Mengunggah gambar...' : 'Klik untuk unggah gambar (Maks. 2MB)'}
            </p>
            <p className="text-[11px] text-slate-400">PNG, JPG, WEBP &bull; Rasio lebar optimal</p>
          </div>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#006cb7]"
      />

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
