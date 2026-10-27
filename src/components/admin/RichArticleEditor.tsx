import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Code2,
  Eye,
} from 'lucide-react';

interface RichArticleEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string) => void;
  editorMode: 'visual' | 'html';
  onModeChange: (mode: 'visual' | 'html') => void;
}

export default function RichArticleEditor({
  initialContent = '',
  onChange,
  editorMode,
  onModeChange,
}: RichArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlCode, setHtmlCode] = useState(initialContent);
  const isUpdatingFromInternal = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingFromInternal.current) {
      if (editorRef.current.innerHTML !== initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
    }
    setHtmlCode(initialContent);
  }, [initialContent]);

  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorMode !== 'visual') return;
    document.execCommand(command, false, value);
    handleVisualInput();
  };

  const handleVisualInput = () => {
    if (!editorRef.current) return;
    isUpdatingFromInternal.current = true;
    const currentHTML = editorRef.current.innerHTML;
    setHtmlCode(currentHTML);
    onChange(currentHTML);
    setTimeout(() => {
      isUpdatingFromInternal.current = false;
    }, 50);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlCode(newHtml);
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  const insertLink = () => {
    const url = prompt('Masukkan tautan URL (contoh: https://solusiaplikasi.id):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Masukkan URL gambar (contoh: https://...):');
    if (url) {
      execCmd('insertImage', url);
    }
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-shadow">
      {/* Editor Header Bar & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 gap-2">
        {/* Formatting Toolbar (Only in Visual Mode) */}
        {editorMode === 'visual' ? (
          <div className="flex flex-wrap items-center gap-1 text-slate-700">
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<h1>')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors font-bold text-xs"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<h2>')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors font-bold text-xs"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<h3>')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors font-bold text-xs"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => execCmd('bold')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<blockquote>')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<pre>')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertHorizontalRule')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Divider Line"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertImage}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Code2 className="w-4 h-4 text-sky-600" />
            <span>Mode HTML Mentah (Source Code)</span>
          </div>
        )}

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => onModeChange('visual')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              editorMode === 'visual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('html')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              editorMode === 'html'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {editorMode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleVisualInput}
          className="min-h-[360px] max-h-[600px] overflow-y-auto p-5 text-slate-800 text-sm leading-relaxed outline-hidden focus:outline-hidden prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:pl-4 prose-blockquote:italic"
          data-placeholder="Mulai menulis isi artikel di sini..."
        />
      ) : (
        <textarea
          rows={16}
          value={htmlCode}
          onChange={handleHtmlChange}
          placeholder="<p>Tulis atau tempel kode HTML artikel di sini...</p>"
          className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-slate-50/50 outline-hidden focus:outline-hidden border-0 resize-y"
        />
      )}
    </div>
  );
}
