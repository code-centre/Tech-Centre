'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  getAudienceFit,
  getFinalProject,
  getIncludes,
  getPrerequisites,
  getStack,
} from '@/lib/programLanding';
import type { FinalProjectItem, Prerequisite, Program } from '@/types/programs';

interface Props {
  program: Program;
}

/** Una entrada por línea; se ignoran las vacías. */
function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** `Nombre | detalle` por línea. El detalle es opcional. */
interface Pair {
  left: string;
  right?: string;
}

function parsePairs(value: string): Pair[] {
  const pairs: Pair[] = [];
  for (const line of parseLines(value)) {
    const [head, ...rest] = line.split('|');
    const left = head.trim();
    if (!left) continue;
    const right = rest.join('|').trim();
    pairs.push(right ? { left, right } : { left });
  }
  return pairs;
}

function stringifyPairs(items: Pair[]): string {
  return items.map((item) => (item.right ? `${item.left} | ${item.right}` : item.left)).join('\n');
}

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm text-text-primary bg-bg-secondary border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

export default function ProgramLandingEditor({ program }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const buildForm = () => {
    const fit = getAudienceFit(program);
    const project = getFinalProject(program);
    return {
      video: program.video || '',
      audience: program.audience || '',
      stack: getStack(program).join('\n'),
      includes: getIncludes(program).join('\n'),
      fitYes: (fit?.yes ?? []).join('\n'),
      fitNotYet: (fit?.not_yet ?? []).join('\n'),
      prerequisites: stringifyPairs(
        getPrerequisites(program).map((item) => ({ left: item.name, right: item.detail }))
      ),
      projectTitle: project?.title ?? '',
      projectSummary: project?.summary ?? '',
      projectRequirements: stringifyPairs(
        (project?.requirements ?? []).map((item) => ({ left: item.title, right: item.description }))
      ),
      projectExamples: stringifyPairs(
        (project?.examples ?? []).map((item) => ({ left: item.title, right: item.description }))
      ),
    };
  };

  const [form, setForm] = useState(buildForm);

  const handleChange = (field: keyof ReturnType<typeof buildForm>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const prerequisites: Prerequisite[] = parsePairs(form.prerequisites).map((item) => ({
        name: item.left,
        ...(item.right ? { detail: item.right } : {}),
      }));

      const toItems = (value: string): FinalProjectItem[] =>
        parsePairs(value).map((item) => ({
          title: item.left,
          ...(item.right ? { description: item.right } : {}),
        }));

      const { error: updateError } = await supabase
        .from('programs')
        .update({
          video: form.video.trim() || null,
          audience: form.audience.trim() || null,
          stack: parseLines(form.stack),
          includes: parseLines(form.includes),
          audience_fit: {
            yes: parseLines(form.fitYes),
            not_yet: parseLines(form.fitNotYet),
          },
          prerequisites,
          final_project: {
            title: form.projectTitle.trim(),
            summary: form.projectSummary.trim(),
            requirements: toItems(form.projectRequirements),
            examples: toItems(form.projectExamples),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id);

      if (updateError) throw updateError;
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Error al guardar el contenido de la página:', err);
      // El mensaje de Postgres dice exactamente qué falló (una columna que no
      // existe, por ejemplo). Esconderlo alarga el diagnóstico.
      const detalle = (err as { message?: string } | null)?.message;
      setError(detalle || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(buildForm());
    setError('');
    setIsEditing(false);
  };

  const stack = getStack(program);
  const includes = getIncludes(program);
  const fit = getAudienceFit(program);
  const prerequisites = getPrerequisites(program);
  const project = getFinalProject(program);

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="program-landing-heading"
    >
      <div className="p-4 border-b border-border-color flex items-center justify-between gap-4">
        <div>
          <h2 id="program-landing-heading" className="text-xl font-semibold text-text-primary">
            Contenido de la página pública
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Cada bloque se oculta en la página cuando lo dejas vacío.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            type="button"
            className="shrink-0 px-3 py-2 text-sm font-medium text-text-primary bg-bg-secondary border border-border-color rounded-md hover:border-secondary/50 transition-all flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="shrink-0 flex gap-2">
            <button
              onClick={handleSave}
              type="button"
              disabled={isSaving}
              className="px-3 py-2 text-sm font-medium rounded-md bg-secondary text-[#0E1116] hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="px-3 py-2 text-sm font-medium text-text-primary bg-bg-secondary border border-border-color rounded-md hover:border-secondary/50 transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="p-4 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Video de presentación</span>
              <span className="text-xs text-text-muted">URL de YouTube o Vimeo. Vacío = la sección de video no aparece.</span>
              <input
                type="url"
                value={form.video}
                onChange={(e) => handleChange('video', e.target.value)}
                className={FIELD_CLASS}
                placeholder="https://youtu.be/…"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Público objetivo</span>
              <span className="text-xs text-text-muted">Una línea. Sale bajo el subtítulo, en el encabezado.</span>
              <input
                type="text"
                value={form.audience}
                onChange={(e) => handleChange('audience', e.target.value)}
                className={FIELD_CLASS}
                placeholder="Para quién es este programa"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Stack de tecnologías</span>
              <span className="text-xs text-text-muted">Una por línea. Salen como etiquetas en el encabezado.</span>
              <textarea
                rows={6}
                value={form.stack}
                onChange={(e) => handleChange('stack', e.target.value)}
                className={FIELD_CLASS}
                placeholder={'Google ADK\nFastAPI\nDocker'}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Qué incluye la inversión</span>
              <span className="text-xs text-text-muted">Una por línea. Sale junto al precio.</span>
              <textarea
                rows={6}
                value={form.includes}
                onChange={(e) => handleChange('includes', e.target.value)}
                className={FIELD_CLASS}
                placeholder={'32 horas presenciales\nCertificado Tech Centre'}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">¿Es para ti? — Entra si…</span>
              <span className="text-xs text-text-muted">Una razón por línea.</span>
              <textarea
                rows={5}
                value={form.fitYes}
                onChange={(e) => handleChange('fitYes', e.target.value)}
                className={FIELD_CLASS}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">¿Es para ti? — Todavía no, si…</span>
              <span className="text-xs text-text-muted">Una razón por línea. Descartar bien también vende.</span>
              <textarea
                rows={5}
                value={form.fitNotYet}
                onChange={(e) => handleChange('fitNotYet', e.target.value)}
                className={FIELD_CLASS}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">Prerrequisitos</span>
            <span className="text-xs text-text-muted">
              Una por línea, con el formato <code>Nombre | detalle</code>. El detalle es opcional.
            </span>
            <textarea
              rows={4}
              value={form.prerequisites}
              onChange={(e) => handleChange('prerequisites', e.target.value)}
              className={FIELD_CLASS}
              placeholder={'Python 3.10+ | asincronía, decoradores y tipado\nDocker | contenedores y volúmenes'}
            />
          </label>

          <fieldset className="flex flex-col gap-4 p-4 rounded-lg border border-border-color">
            <legend className="px-2 text-sm font-semibold text-text-primary">Proyecto final</legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">Nombre del proyecto</span>
                <input
                  type="text"
                  value={form.projectTitle}
                  onChange={(e) => handleChange('projectTitle', e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="The Operations Agent"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">Resumen</span>
                <input
                  type="text"
                  value={form.projectSummary}
                  onChange={(e) => handleChange('projectSummary', e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Una línea sobre qué construye el estudiante."
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Criterios de entrega</span>
              <span className="text-xs text-text-muted">
                Uno por línea: <code>Criterio | explicación</code>.
              </span>
              <textarea
                rows={4}
                value={form.projectRequirements}
                onChange={(e) => handleChange('projectRequirements', e.target.value)}
                className={FIELD_CLASS}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">Ejemplos de proyecto</span>
              <span className="text-xs text-text-muted">
                Uno por línea: <code>Nombre | qué hace</code>.
              </span>
              <textarea
                rows={4}
                value={form.projectExamples}
                onChange={(e) => handleChange('projectExamples', e.target.value)}
                className={FIELD_CLASS}
              />
            </label>
          </fieldset>
        </div>
      ) : (
        <dl className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Video</dt>
            <dd className="text-sm text-text-primary mt-1 truncate">{program.video || 'Sin llenar'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Stack</dt>
            <dd className="text-sm text-text-primary mt-1">
              {stack.length > 0 ? `${stack.length} tecnologías` : 'Sin llenar'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Qué incluye</dt>
            <dd className="text-sm text-text-primary mt-1">
              {includes.length > 0 ? `${includes.length} ítems` : 'Sin llenar'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">¿Es para ti?</dt>
            <dd className="text-sm text-text-primary mt-1">
              {fit ? `${fit.yes.length} sí · ${fit.not_yet.length} todavía no` : 'Sin llenar'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Prerrequisitos</dt>
            <dd className="text-sm text-text-primary mt-1">
              {prerequisites.length > 0 ? `${prerequisites.length} requisitos` : 'Sin llenar'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Proyecto final</dt>
            <dd className="text-sm text-text-primary mt-1">{project?.title || (project ? 'Sin nombre' : 'Sin llenar')}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
