'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
} from 'lucide-react';

export interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  /** 'full' for description (headings, etc), 'simple' for FAQ answers (bold, italic, lists, links only) */
  variant?: 'full' | 'simple';
  /** When false, hide Save/Cancel buttons (e.g. when used inline with parent form actions) */
  showActions?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md border border-border-color transition-colors ${
        active
          ? 'bg-secondary/20 text-secondary'
          : 'text-text-primary hover:bg-bg-secondary hover:text-secondary'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = 'Escribe aquí...',
  variant = 'full',
  showActions = true,
}: TiptapEditorProps) {
  const lastEmittedHtmlRef = useRef(value);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const emitChangeRef = useRef<(html: string) => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        blockquote: variant === 'full' ? {} : false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-secondary underline hover:text-secondary/80' },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose-content min-h-[120px] px-4 py-3 focus:outline-none text-[var(--card-text-primary)]',
      },
      handleDOMEvents: {
        blur: () => {
          const ed = editorRef.current;
          if (ed) emitChangeRef.current(ed.getHTML() || '');
        },
      },
    },
    onUpdate: ({ editor: ed }) => {
      emitChangeRef.current(ed.getHTML());
    },
  }, [variant]);

  editorRef.current = editor;

  useEffect(() => {
    emitChangeRef.current = (html: string) => {
      lastEmittedHtmlRef.current = html;
      onChange(html);
    };
  }, [onChange]);

  useEffect(() => {
    if (!editor) return;
    // Don't overwrite while user is actively editing (prevents content loss on bullets/save)
    if (editor.isFocused) return;
    // Only sync when value changed from outside (e.g. switching FAQ, loading from server)
    if (value === lastEmittedHtmlRef.current) return;
    const currentHtml = editor.getHTML();
    if (value === currentHtml) return;
    lastEmittedHtmlRef.current = value;
    editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace:', previousUrl || 'https://');
    if (url !== null) {
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor-wrapper flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg border border-border-color bg-bg-secondary">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          title="Subrayado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        {variant === 'full' && (
          <>
            <div className="w-px h-6 bg-border-color mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Título 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Título 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}

        <div className="w-px h-6 bg-border-color mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista con viñetas"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Enlace"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>

        {variant === 'full' && (
          <>
            <div className="w-px h-6 bg-border-color mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="Alinear izquierda"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="Centrar"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="Alinear derecha"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}

        <div className="w-px h-6 bg-border-color mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Deshacer"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Rehacer"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="rounded-lg border border-border-color bg-bg-secondary overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {showActions && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSave}
            className="btn-primary px-4 py-2 text-sm font-medium"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-muted bg-bg-secondary border border-border-color rounded-lg hover:bg-bg-primary hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
