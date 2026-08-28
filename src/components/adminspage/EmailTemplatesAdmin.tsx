'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, RotateCcw, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import TiptapEditor from '@/components/TiptapEditor';
import {
  listEmailTemplates,
  restoreEmailTemplateDefault,
  updateEmailTemplate,
} from '@/app/admin/correos/actions';
import { previewEmailTemplate } from '@/lib/email/template-engine';
import type { EmailTemplateRow } from '@/lib/email/types';

function extractVariableKeys(subject: string, htmlBody: string, textBody: string): string[] {
  const combined = `${subject} ${htmlBody} ${textBody}`;
  const matches = combined.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))].sort();
}

interface EmailTemplateEditorPanelProps {
  template: EmailTemplateRow;
  onTemplatesChange: () => Promise<void>;
}

function EmailTemplateEditorPanel({ template, onTemplatesChange }: EmailTemplateEditorPanelProps) {
  const [subject, setSubject] = useState(template.subject);
  const [htmlBody, setHtmlBody] = useState(template.html_body);
  const [textBody, setTextBody] = useState(template.text_body ?? '');
  const [isActive, setIsActive] = useState(template.is_active);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    setSubject(template.subject);
    setHtmlBody(template.html_body);
    setTextBody(template.text_body ?? '');
    setIsActive(template.is_active);
  }, [
    template.slug,
    template.updated_at,
    template.subject,
    template.html_body,
    template.text_body,
    template.is_active,
  ]);

  const preview = useMemo(
    () =>
      previewEmailTemplate({
        subject,
        html_body: htmlBody,
        text_body: textBody || null,
        sample_variables: template.sample_variables,
      }),
    [template.sample_variables, subject, htmlBody, textBody],
  );

  const variableKeys = useMemo(
    () => extractVariableKeys(subject, htmlBody, textBody),
    [subject, htmlBody, textBody],
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await updateEmailTemplate(template.slug, {
      subject,
      html_body: htmlBody,
      text_body: textBody || null,
      is_active: isActive,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? 'No se pudo guardar');
      return;
    }

    toast.success('Plantilla guardada');
    await onTemplatesChange();
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await restoreEmailTemplateDefault(template.slug);
    setRestoring(false);

    if (!result.success) {
      toast.error(result.error ?? 'No se pudo restaurar');
      return;
    }

    toast.success('Plantilla restaurada');
    await onTemplatesChange();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border-color bg-[var(--card-background)] p-6 shadow-lg">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{template.name}</h2>
          {template.description && (
            <p className="mt-1 text-sm text-text-muted">{template.description}</p>
          )}
        </header>

        <label className="mb-4 flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-border-color text-secondary focus:ring-secondary"
          />
          Plantilla activa (enviar correos)
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-primary">Asunto</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </label>

        <div className="mt-5">
          <span className="text-sm font-medium text-text-primary">Cuerpo HTML</span>
          <div className="mt-2 min-h-[220px]">
            <TiptapEditor
              key={template.slug}
              value={htmlBody}
              onChange={setHtmlBody}
              onSave={handleSave}
              onCancel={() => setHtmlBody(template.html_body)}
              variant="full"
              showActions={false}
              placeholder="Contenido del correo…"
            />
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-text-primary">Texto plano (opcional)</span>
          <textarea
            rows={5}
            value={textBody}
            onChange={(e) => setTextBody(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </label>

        {variableKeys.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-medium text-text-primary">Variables disponibles</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {variableKeys.map((key) => (
                <li
                  key={key}
                  className="rounded-md bg-bg-secondary px-2 py-1 font-mono text-xs text-text-muted"
                >
                  {`{{${key}}}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={handleRestore}
            disabled={restoring}
            className="inline-flex items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-primary disabled:opacity-60"
          >
            {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Restaurar default
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)] shadow-lg">
        <header className="border-b border-border-color px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Vista previa
          </h2>
          <p className="mt-1 text-sm text-text-primary">
            Asunto: <span className="font-medium">{preview.subject}</span>
          </p>
        </header>
        <iframe
          title={`Preview ${template.slug}`}
          srcDoc={preview.html}
          className="h-[520px] w-full border-0 bg-white"
          sandbox=""
        />
      </section>
    </div>
  );
}

export default function EmailTemplatesAdmin() {
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selected = useMemo(
    () => templates.find((t) => t.slug === selectedSlug) ?? null,
    [templates, selectedSlug],
  );

  const refreshTemplates = useCallback(async () => {
    const rows = await listEmailTemplates();
    setTemplates(rows);
    setSelectedSlug((current) => {
      if (current && rows.some((row) => row.slug === current)) return current;
      return rows[0]?.slug ?? null;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const rows = await listEmailTemplates();
      if (cancelled) return;
      setTemplates(rows);
      setSelectedSlug(rows[0]?.slug ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <AdminPageSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Mail}
        title="Correos"
        subtitle={`${templates.length} plantillas transaccionales · Resend`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav
          className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)] shadow-lg"
          aria-label="Plantillas de correo"
        >
          <ul className="divide-y divide-border-color/60">
            {templates.map((template) => {
              const isSelected = template.slug === selectedSlug;
              return (
                <li key={template.slug}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(template.slug)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`w-full px-4 py-3.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-secondary/10 text-text-secondary'
                        : 'hover:bg-bg-secondary/40 text-text-primary'
                    }`}
                  >
                    <span className="block text-sm font-medium">{template.name}</span>
                    <span className="mt-0.5 block text-xs text-text-muted">{template.slug}</span>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        template.is_active
                          ? 'bg-green-500/15 text-green-500'
                          : 'bg-text-muted/15 text-text-muted'
                      }`}
                    >
                      {template.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-h-[720px] lg:min-h-[840px]">
          {selected ? (
            <EmailTemplateEditorPanel
              key={selected.slug}
              template={selected}
              onTemplatesChange={refreshTemplates}
            />
          ) : (
            <p className="rounded-xl border border-border-color bg-[var(--card-background)] p-6 text-sm text-text-muted shadow-lg">
              Selecciona una plantilla para editarla.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
