'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { normalizeFaqs, type NormalizedFaq } from '@/lib/programFaqs';
import type { Program } from '@/types/programs';

interface Props {
  program: Program;
}

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

/** La respuesta vieja trae HTML de Tiptap: se muestra como texto para editarla. */
function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export default function ProgramFaqsEditor({ program }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const build = () =>
    normalizeFaqs(program.faqs).map((faq) => ({
      question: faq.question,
      answer: stripHtml(faq.answer),
    }));

  const [faqs, setFaqs] = useState<NormalizedFaq[]>(build);
  const [open, setOpen] = useState<number | null>(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (index: number, field: keyof NormalizedFaq, value: string) => {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)));
    setDirty(true);
  };

  const add = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
    setOpen(faqs.length);
    setDirty(true);
  };

  const remove = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
    setOpen(null);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const cleaned = faqs
        .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
        .filter((faq) => faq.question.length > 0);

      const { error: updateError } = await supabase
        .from('programs')
        .update({ faqs: cleaned, updated_at: new Date().toISOString() })
        .eq('id', program.id);

      if (updateError) throw updateError;
      setFaqs(cleaned);
      setDirty(false);
      router.refresh();
    } catch (err) {
      console.error('Error al guardar las preguntas frecuentes:', err);
      const detalle = (err as { message?: string } | null)?.message;
      setError(detalle || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 p-5 sm:p-6 rounded-xl bg-[var(--card-background)] border border-border-color">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-text-primary">Preguntas frecuentes</h2>
          <p className="text-xs text-text-muted">
            {faqs.length === 0
              ? 'Sin preguntas todavía. Salen al final de la página pública.'
              : `${faqs.length} ${faqs.length === 1 ? 'pregunta' : 'preguntas'} · salen al final de la página pública.`}
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-2 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {faqs.length > 0 && (
        <ul className="flex flex-col gap-2">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <li
                key={index}
                className={`rounded-xl bg-bg-secondary border transition-colors ${
                  isOpen ? 'border-secondary/40' : 'border-border-color'
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex items-center gap-3 grow min-w-0 text-left cursor-pointer"
                  >
                    <span className="shrink-0 w-8 py-1 rounded-md bg-[var(--card-background)] text-center text-xs font-bold text-text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`grow truncate text-sm ${
                        faq.question ? 'text-text-primary font-medium' : 'text-text-muted italic'
                      }`}
                    >
                      {faq.question || 'Pregunta sin escribir'}
                    </span>
                    <ChevronDown
                      className={`shrink-0 w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="shrink-0 p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label={`Eliminar pregunta ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isOpen && (
                  <div className="flex flex-col gap-3 px-4 pb-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-medium text-text-primary">Pregunta</span>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => update(index, 'question', e.target.value)}
                        placeholder="¿Necesito saber programar?"
                        className={FIELD}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-medium text-text-primary">Respuesta</span>
                      <textarea
                        rows={4}
                        value={faq.answer}
                        onChange={(e) => update(index, 'answer', e.target.value)}
                        placeholder="Contesta de frente. Si la respuesta es no, dilo."
                        className={`${FIELD} resize-y`}
                      />
                    </label>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {dirty && (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setFaqs(build());
              setDirty(false);
              setError('');
            }}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-border-color text-[13.5px] font-medium text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-bold disabled:opacity-60 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando…' : 'Guardar preguntas'}
          </button>
        </div>
      )}
    </section>
  );
}
