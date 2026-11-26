import { useEffect, useState, type ComponentType } from 'react';
import { Code2, Eye, FileText } from 'lucide-react';
import type { BlockNoteEditorProps } from './BlockNoteEditor';

interface RichContentEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function RichContentEditor({
  label = 'Konten Utama',
  value,
  onChange,
  placeholder = 'Tulis kode HTML konten di sini...',
  required = false,
}: RichContentEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [visualKey, setVisualKey] = useState(0);
  const [EditorComponent, setEditorComponent] =
    useState<ComponentType<BlockNoteEditorProps> | null>(null);

  useEffect(() => {
    let mounted = true;
    import('./BlockNoteEditor')
      .then((mod) => {
        if (mounted) {
          setEditorComponent(() => mod.default);
        }
      })
      .catch((err) => {
        console.error('Failed loading visual editor:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const switchMode = (nextMode: 'visual' | 'html') => {
    if (nextMode === 'visual' && mode === 'html') {
      setVisualKey((k) => k + 1);
    }
    setMode(nextMode);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#006cb7]" />
          <label className="text-sm font-bold text-slate-800">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        </div>

        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => switchMode('visual')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'visual'
                ? 'bg-white text-[#006cb7] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Editor</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('html')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'html'
                ? 'bg-white text-[#006cb7] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mode HTML</span>
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        EditorComponent ? (
          <EditorComponent key={visualKey} initialHTML={value} onChange={onChange} />
        ) : (
          <div className="flex items-center justify-center p-10 border border-slate-200 rounded-xl bg-slate-50 min-h-[340px]">
            <span className="text-xs font-medium text-slate-500">Memuat BlockNote editor...</span>
          </div>
        )
      ) : (
        <textarea
          rows={15}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-slate-950 text-sky-100 font-mono text-xs leading-relaxed border border-slate-800 rounded-xl focus:outline-none focus:border-[#006cb7]"
        />
      )}

      <p className="text-[11px] text-slate-400">
        Gunakan slash command <code className="bg-slate-100 px-1 py-0.5 rounded">/</code> untuk
        menyisipkan heading, checklist, kutipan, gambar, atau beralih ke Mode HTML untuk kontrol tag penuh.
      </p>
    </div>
  );
}
