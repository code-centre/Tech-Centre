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

function extractVariableKeys(template: EmailTemplateRow): string[] {
  const combined = `${template.subject} ${template.html_body} ${template.text_body ?? ''}`;
  const matches = combined.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))].sort();
}

export default function EmailTemplatesAdmin() {
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const selected = useMemo(
    () => templates.find((t) => t.slug === selectedSlug) ?? null,
    [templates, selectedSlug],
  );

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const rows = await listEmailTemplates();
    setTemplates(rows);
    if (rows.length && !selectedSlug) {
      setSelectedSlug(rows[0].slug);
    }
    setLoading(false);
  }, [selectedSlug]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!selected) return;
    setSubject(selected.subject);
    setHtmlBody(selected.html_body);
    setTextBody(selected.text_body ?? '');
    setIsActive(selected.is_active);
  }, [selected]);

  const preview = useMemo(() => {
    if (!selected) return null;
    return previewEmailTemplate({
      subject,
      html_body: htmlBody,
      text_body: textBody || null,
      sample_variables: selected.sample_variables,
    });
  }, [selected, subject, htmlBody, textBody]);

  const variableKeys = selected ? extractVariableKeys(selected) : [];

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await updateEmailTemplate(selected.slug, {
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
    await loadTemplates();
  };

  const handleRestore = async () => {
    if (!selected) return;
    setRestoring(true);
    const result = await restoreEmailTemplateDefault(selected.slug);
    setRestoring(false);

    if (!result.success) {
      toast.error(result.error ?? 'No se pudo restaurar');
      return;
    }

    toast.success('Plantilla restaurada');
    await loadTemplates();
  };

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

        {selected && (
          <div className="space-y-6">
            <section className="rounded-xl border border-border-color bg-[var(--card-background)] p-6 shadow-lg">
              <header className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary">{selected.name}</h2>
                {selected.description && (
                  <p className="mt-1 text-sm text-text-muted">{selected.description}</p>
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
                <div className="mt-2">
                  <TiptapEditor
                    value={htmlBody}
                    onChange={setHtmlBody}
                    onSave={handleSave}
                    onCancel={() => {
                      setHtmlBody(selected.html_body);
                    }}
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

            <section className="rounded-xl border border-border-color bg-[var(--card-background)] shadow-lg overflow-hidden">
              <header className="border-b border-border-color px-6 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Vista previa
                </h2>
                {preview && (
                  <p className="mt-1 text-sm text-text-primary">
                    Asunto: <span className="font-medium">{preview.subject}</span>
                  </p>
                )}
              </header>
              {preview && (
                <iframe
                  title={`Preview ${selected.slug}`}
                  srcDoc={preview.html}
                  className="h-[520px] w-full border-0 bg-white"
                  sandbox=""
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
