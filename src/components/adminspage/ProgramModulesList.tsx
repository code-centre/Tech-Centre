'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, BookOpen, Loader2 } from 'lucide-react';
import type { ProgramModule } from '@/types/supabase';
import type { SyllabusData } from '@/types/programs';

interface ProgramModulesListProps {
  programId: string;
  modules: ProgramModule[];
  syllabus?: SyllabusData | null;
}

export default function ProgramModulesList({
  programId,
  modules: initialModules,
  syllabus,
}: ProgramModulesListProps) {
  const [modules, setModules] = useState<ProgramModule[]>(initialModules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ProgramModule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hours: '',
    order_index: '',
    topics: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const supabase = createClient();

  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);

  async function syncSyllabusFromModules(modulesList: ProgramModule[]) {
    const syllabusPayload = {
      modules: modulesList
        .sort((a, b) => a.order_index - b.order_index)
        .map((m) => ({
          id: m.id,
          title: m.name,
          topics: (m.content as { topics?: string[] })?.topics ?? [],
        })),
    };
    await supabase
      .from('programs')
      .update({
        syllabus: syllabusPayload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId);
  }

  const openModal = (module: ProgramModule | null = null) => {
    if (module) {
      setEditingModule(module);
      const topics = (module.content as { topics?: string[] })?.topics ?? [];
      setFormData({
        name: module.name,
        hours: module.hours != null ? String(module.hours) : '',
        order_index: String(module.order_index),
        topics: topics.join('\n'),
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        hours: '',
        order_index: String(modules.length),
        topics: '',
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModule(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    const topicsList = formData.topics
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    const content = topicsList.length > 0 ? { topics: topicsList } : null;

    const payload = {
      program_id: parseInt(programId, 10),
      name: formData.name.trim(),
      hours: formData.hours ? parseInt(formData.hours, 10) : null,
      order_index: parseInt(formData.order_index, 10) || 0,
      content,
    };

    try {
      if (editingModule) {
        const { data, error } = await supabase
          .from('program_modules')
          .update(payload)
          .eq('id', editingModule.id)
          .select('*')
          .single();

        if (error) throw error;
        const updated = modules.map((m) =>
          m.id === editingModule.id ? data : m
        ) as ProgramModule[];
        setModules(updated);
        await syncSyllabusFromModules(updated);
      } else {
        const { data, error } = await supabase
          .from('program_modules')
          .insert([payload])
          .select('*')
          .single();

        if (error) throw error;
        const updated = [...modules, data] as ProgramModule[];
        setModules(updated);
        await syncSyllabusFromModules(updated);
      }
      closeModal();
      router.refresh();
    } catch (err) {
      console.error('Error al guardar el módulo:', err);
      setErrors({
        submit: 'Ocurrió un error al guardar. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (module: ProgramModule) => {
    if (!confirm(`¿Eliminar el módulo "${module.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('program_modules')
        .delete()
        .eq('id', module.id);

      if (error) throw error;
      const updated = modules.filter((m) => m.id !== module.id);
      setModules(updated);
      await syncSyllabusFromModules(updated);
      router.refresh();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('No se pudo eliminar el módulo.');
    }
  };

  const handleImportFromSyllabus = async () => {
    if (!syllabus?.modules?.length) return;
    const maxOrder =
      modules.length > 0 ? Math.max(...modules.map((m) => m.order_index)) + 1 : 0;

    setIsImporting(true);
    try {
      const inserts = syllabus.modules.map((m, i) => ({
        program_id: parseInt(programId, 10),
        name: m.title,
        order_index: maxOrder + i,
        hours: null,
        content: m.topics?.length ? { topics: m.topics } : null,
      }));

      const { data, error } = await supabase
        .from('program_modules')
        .insert(inserts)
        .select('*');

      if (error) throw error;
      const newModules = (data ?? []) as ProgramModule[];
      const updated = [...modules, ...newModules];
      setModules(updated);
      await syncSyllabusFromModules(updated);
      router.refresh();
    } catch (err) {
      console.error('Error al importar:', err);
      alert('No se pudo importar desde el temario.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="modules-heading"
    >
      <div className="p-4 border-b border-border-color flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 id="modules-heading" className="text-xl font-semibold text-text-primary">
          Módulos del programa
        </h2>
        <div className="flex items-center gap-2">
          {syllabus?.modules?.length ? (
            <button
              type="button"
              onClick={handleImportFromSyllabus}
              disabled={isImporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50 hover:bg-bg-primary transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              Importar desde temario
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => openModal()}
            className="btn-primary inline-flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agregar módulo
          </button>
        </div>
      </div>

      <div className="p-4">
        {sortedModules.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-color rounded-lg bg-bg-secondary/50">
            <p className="text-text-muted mb-4">
              No hay módulos. Agrega uno o importa desde el temario.
            </p>
            <button
              type="button"
              onClick={() => openModal()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar módulo
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedModules.map((module) => {
              const topics = (module.content as { topics?: string[] })?.topics ?? [];
              return (
                <li
                  key={module.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border-color bg-bg-secondary/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">{module.name}</h3>
                      {module.hours != null && (
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
                          {module.hours} h
                        </span>
                      )}
                      <span className="text-sm text-text-muted">
                        Orden: {module.order_index}
                      </span>
                    </div>
                    {topics.length > 0 && (
                      <ul className="text-sm text-text-muted list-disc pl-5 mt-1 space-y-0.5">
                        {topics.slice(0, 3).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                        {topics.length > 3 && (
                          <li className="text-text-muted/80">
                            +{topics.length - 3} más
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openModal(module)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50 text-sm font-medium"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(module)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="module-modal-title"
        >
          <div className="bg-[var(--card-background)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border-color">
            <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-[var(--card-background)]">
              <h3 id="module-modal-title" className="text-lg font-semibold text-text-primary">
                {editingModule ? 'Editar módulo' : 'Nuevo módulo'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                  {errors.submit}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nombre (requerido)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Horas (opcional)
                  </label>
                  <input
                    type="number"
                    name="hours"
                    min="0"
                    value={formData.hours}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Orden (opcional)
                  </label>
                  <input
                    type="number"
                    name="order_index"
                    min="0"
                    value={formData.order_index}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Temas (opcional, uno por línea)
                </label>
                <textarea
                  name="topics"
                  value={formData.topics}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tema 1&#10;Tema 2&#10;Tema 3"
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingModule ? 'Guardar' : 'Crear módulo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
