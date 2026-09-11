'use client';

import {
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from 'lucide-react';
import { toast } from 'sonner';
import BlogMarkdown from '@/components/blog/BlogMarkdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  convertedFromHtml?: boolean;
}

type EditorTab = 'write' | 'preview';

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="p-2 rounded-md text-text-primary hover:bg-bg-primary hover:text-secondary transition-colors"
    >
      {children}
    </button>
  );
}

export default function MarkdownEditor({
  value,
  onChange,
  convertedFromHtml = false,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [tab, setTab] = useState<EditorTab>('write');
  const [uploading, setUploading] = useState(false);

  const setValue = useCallback(
    (next: string, selection?: { start: number; end: number }) => {
      valueRef.current = next;
      onChange(next);
      const ta = textareaRef.current;
      if (!ta || !selection) return;
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(selection.start, selection.end);
      });
    },
    [onChange]
  );

  const applyWrap = useCallback(
    (before: string, after: string = before, placeholder = 'texto') => {
      const current = valueRef.current;
      const ta = textareaRef.current;
      if (!ta) {
        setValue(`${current}${before}${placeholder}${after}`);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = current.slice(start, end) || placeholder;
      const next = current.slice(0, start) + before + selected + after + current.slice(end);
      setValue(next, {
        start: start + before.length,
        end: start + before.length + selected.length,
      });
    },
    [setValue]
  );

  const applyLinePrefix = useCallback(
    (prefix: string) => {
      const current = valueRef.current;
      const ta = textareaRef.current;
      if (!ta) {
        setValue(`${prefix}${current}`);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const lineStart = current.lastIndexOf('\n', start - 1) + 1;
      const lineEndIndex = current.indexOf('\n', end);
      const actualEnd = lineEndIndex === -1 ? current.length : lineEndIndex;
      const block = current.slice(lineStart, actualEnd);
      const prefixed = block
        .split('\n')
        .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
        .join('\n');
      const next = current.slice(0, lineStart) + prefixed + current.slice(actualEnd);
      const delta = prefixed.length - block.length;
      setValue(next, {
        start: start + (start === lineStart ? prefix.length : 0),
        end: end + delta,
      });
    },
    [setValue]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const current = valueRef.current;
      const ta = textareaRef.current;
      if (!ta) {
        setValue(current ? `${current}\n\n${text}` : text);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = current.slice(0, start) + text + current.slice(end);
      setValue(next, { start: start + text.length, end: start + text.length });
    },
    [setValue]
  );

  const insertLink = useCallback(() => {
    const ta = textareaRef.current;
    const current = valueRef.current;
    const selected = ta ? current.slice(ta.selectionStart, ta.selectionEnd) : '';
    const url = window.prompt('URL del enlace:', 'https://');
    if (!url) return;
    applyWrap('[', `](${url})`, selected || 'texto del enlace');
  }, [applyWrap]);

  const uploadImages = useCallback(
    async (files: File[]) => {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const valid = files.filter((file) => {
        if (!allowed.includes(file.type)) {
          toast.error(`${file.name}: formato no permitido. Use JPEG, PNG, GIF o WebP`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: la imagen no debe superar 5MB`);
          return false;
        }
        return true;
      });
      if (!valid.length) return;

      setUploading(true);
      try {
        for (const file of valid) {
          const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
          const token = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const placeholder = `![Subiendo ${alt}…](${token})`;
          insertAtCursor(`\n${placeholder}\n`);

          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/blog/upload-image', {
            method: 'POST',
            body: formData,
          });
          const data = (await res.json()) as { url?: string; files?: string[]; error?: string };
          if (!res.ok || !(data.url || data.files?.[0])) {
            throw new Error(data.error || 'Error al subir la imagen');
          }
          const url = data.url || data.files?.[0] || '';
          setValue(valueRef.current.replace(placeholder, `![${alt}](${url})`));
        }
        toast.success(valid.length === 1 ? 'Imagen subida' : 'Imágenes subidas');
      } catch (err) {
        console.error(err);
        toast.error('Error al subir la imagen');
      } finally {
        setUploading(false);
      }
    },
    [insertAtCursor, setValue]
  );

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (!files.length) return;
    e.preventDefault();
    void uploadImages(files);
  };

  const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (!files.length) return;
    e.preventDefault();
    void uploadImages(files);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      applyWrap('**');
    } else if (key === 'i') {
      e.preventDefault();
      applyWrap('*');
    } else if (key === 'k') {
      e.preventDefault();
      insertLink();
    } else if (key === 'e') {
      e.preventDefault();
      applyWrap('`', '`', 'código');
    }
  };

  return (
    <section className="rounded-lg border border-border-color bg-bg-primary overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border-color bg-bg-secondary px-2">
        <div
          role="tablist"
          aria-label="Modo del editor"
          className="flex items-center"
        >
          <button
            type="button"
            role="tab"
            id="blog-md-tab-write"
            aria-controls="blog-md-write"
            aria-selected={tab === 'write'}
            onClick={() => setTab('write')}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'write'
                ? 'border-secondary text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Escribir
          </button>
          <button
            type="button"
            role="tab"
            id="blog-md-tab-preview"
            aria-controls="blog-md-preview"
            aria-selected={tab === 'preview'}
            onClick={() => setTab('preview')}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'preview'
                ? 'border-secondary text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Vista previa
          </button>
        </div>

        {tab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 py-1" role="toolbar" aria-label="Formato Markdown">
            <ToolbarButton onClick={() => applyLinePrefix('## ')} title="Título 2">
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyLinePrefix('### ')} title="Título 3">
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-border-color" aria-hidden="true" />
            <ToolbarButton onClick={() => applyWrap('**')} title="Negrita (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyWrap('*')} title="Cursiva (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyWrap('~~')} title="Tachado">
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyWrap('`', '`', 'código')} title="Código (Ctrl+E)">
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-border-color" aria-hidden="true" />
            <ToolbarButton onClick={() => applyLinePrefix('- ')} title="Lista con viñetas">
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyLinePrefix('1. ')} title="Lista numerada">
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyLinePrefix('> ')} title="Cita">
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertLink} title="Enlace (Ctrl+K)">
              <Link2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              title="Insertar imagen"
            >
              <ImagePlus className="w-4 h-4" />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = '';
                if (files.length) void uploadImages(files);
              }}
            />
          </div>
        )}
      </header>

      {tab === 'write' ? (
        <div role="tabpanel" id="blog-md-write" aria-labelledby="blog-md-tab-write">
          <label htmlFor="blog-content-markdown" className="sr-only">
            Contenido del artículo en Markdown
          </label>
          <textarea
            ref={textareaRef}
            id="blog-content-markdown"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => {
              if (Array.from(e.dataTransfer.types).includes('Files')) {
                e.preventDefault();
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={'Escribe en Markdown.\n\n## Un título\n\nPárrafo con **negrita**, *cursiva* y `código`.\n\n- Lista\n- De ideas\n\n```ts\nconst listo = true;\n```'}
            spellCheck
            disabled={uploading}
            className="w-full min-h-[420px] resize-y px-4 py-3 bg-bg-primary text-text-primary placeholder:text-text-muted font-mono text-sm leading-relaxed focus:outline-none"
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="blog-md-preview"
          aria-labelledby="blog-md-tab-preview"
          className="min-h-[420px] px-5 py-4"
        >
          {value.trim() ? (
            <div className="blog-prose blog-content overflow-x-hidden">
              <BlogMarkdown content={value} />
            </div>
          ) : (
            <p className="text-text-muted">Nada que previsualizar todavía.</p>
          )}
        </div>
      )}

      <footer className="border-t border-border-color bg-bg-secondary px-4 py-3">
        {convertedFromHtml && (
          <p className="text-xs text-text-muted mb-2">
            Convertimos el HTML anterior a Markdown. Revisa la vista previa antes de guardar.
          </p>
        )}
        {uploading && (
          <p className="text-xs text-text-muted mb-2" aria-live="polite">
            Subiendo imagen…
          </p>
        )}
        <details className="text-xs text-text-muted">
          <summary className="cursor-pointer select-none hover:text-text-primary">
            Guía rápida de Markdown
          </summary>
          <dl className="mt-2 grid gap-1 sm:grid-cols-2">
            <div>
              <dt className="inline font-mono text-text-primary">**negrita**</dt>
              <dd className="inline"> · *cursiva* · ~~tachado~~</dd>
            </div>
            <div>
              <dt className="inline font-mono text-text-primary">## Título</dt>
              <dd className="inline"> · ### Subtítulo</dd>
            </div>
            <div>
              <dt className="inline font-mono text-text-primary">- lista</dt>
              <dd className="inline"> · 1. numerada · - [ ] tarea</dd>
            </div>
            <div>
              <dt className="inline font-mono text-text-primary">[texto](url)</dt>
              <dd className="inline"> · ![alt](imagen)</dd>
            </div>
            <div>
              <dt className="inline font-mono text-text-primary">`código`</dt>
              <dd className="inline"> · ```bloque```</dd>
            </div>
            <div>
              <dt className="inline font-mono text-text-primary">&gt; cita</dt>
              <dd className="inline"> · --- separador · tablas GFM</dd>
            </div>
          </dl>
        </details>
      </footer>
    </section>
  );
}
