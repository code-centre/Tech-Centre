'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  X,
  BrainCircuit,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Pencil,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from 'lucide-react';
import Image from 'next/image';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import type { Career } from '@/types/careers';

const BUCKET = 'blog-images';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;

interface ProgramOption {
  id: number;
  name: string;
  code: string;
}

type LearningPoint = { title: string; url?: string };

const emptyForm = {
  name: '',
  slug: '',
  duration: '',
  level: 'Intermedio',
  modality: 'Presencial',
  description: '',
  long_description: '',
  image: '' as string | null,
  hero_image: '' as string | null,
  target_audience: '',
  next_start_date: '',
  learning_points: [] as LearningPoint[],
  graduate_profile: [] as string[],
  opportunities: [] as Array<{ title: string; salaryRange?: string }>,
  admission_process: [] as Array<{ step: string; title: string; description: string }>,
  metadata: { title: '', description: '', keywords: [] as string[] },
  is_visible: true,
};

type FormState = typeof emptyForm;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CarrerasAdmon() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [careers, setCareers] = useState<Career[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>({ ...emptyForm });

  const [careerToDelete, setCareerToDelete] = useState<Career | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [expandedForm, setExpandedForm] = useState(false);

  const [uploadingImage, setUploadingImage] = useState<'image' | 'hero_image' | null>(null);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('careers')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Error al cargar las carreras');
    } else {
      setCareers((data ?? []) as Career[]);
    }
    setLoading(false);
  }, [supabase]);

  const fetchPrograms = useCallback(async () => {
    const { data } = await supabase
      .from('programs')
      .select('id, name, code')
      .order('name', { ascending: true });

    if (data) {
      setPrograms(data as ProgramOption[]);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCareers();
    fetchPrograms();
  }, [fetchCareers, fetchPrograms]);

  const handleEdit = (career: Career) => {
    setEditingId(career.id);
    setIsAdding(false);
    setForm({
      name: career.name,
      slug: career.slug,
      duration: career.duration || '',
      level: career.level || 'Intermedio',
      modality: career.modality || 'Presencial',
      description: career.description || '',
      long_description: career.long_description || '',
      image: career.image,
      hero_image: career.hero_image,
      target_audience: career.target_audience || '',
      next_start_date: career.next_start_date || '',
      learning_points: career.learning_points || [],
      graduate_profile: career.graduate_profile || [],
      opportunities: career.opportunities || [],
      admission_process: career.admission_process || [],
      metadata: career.metadata || { title: '', description: '', keywords: [] },
      is_visible: career.is_visible,
    });
    setExpandedForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setSaving(false);
    setError(null);
    setForm({ ...emptyForm });
    setExpandedForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('El nombre de la carrera es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      duration: form.duration.trim() || null,
      level: form.level || null,
      modality: form.modality || null,
      description: form.description.trim() || null,
      long_description: form.long_description.trim() || null,
      image: form.image || null,
      hero_image: form.hero_image || null,
      target_audience: form.target_audience.trim() || null,
      next_start_date: form.next_start_date.trim() || null,
      learning_points: form.learning_points,
      graduate_profile: form.graduate_profile,
      opportunities: form.opportunities,
      admission_process: form.admission_process,
      metadata: form.metadata,
      is_visible: form.is_visible,
    };

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('careers')
          .update(payload)
          .eq('id', editingId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('careers')
          .insert([payload]);

        if (insertError) throw insertError;
      }

      await fetchCareers();
      handleCancel();
    } catch (err: any) {
      const msg = err?.message || 'Error al guardar la carrera';
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (career: Career) => {
    const { error: updateError } = await supabase
      .from('careers')
      .update({ is_visible: !career.is_visible })
      .eq('id', career.id);

    if (!updateError) {
      setCareers(
        careers.map((c) =>
          c.id === career.id ? { ...c, is_visible: !c.is_visible } : c,
        ),
      );
    }
  };

  const confirmDelete = async () => {
    if (!careerToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const { error: delError } = await supabase
        .from('careers')
        .delete()
        .eq('id', careerToDelete.id);

      if (delError) throw delError;

      setCareers(careers.filter((c) => c.id !== careerToDelete.id));
      setCareerToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'No se pudo eliminar la carrera');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image' | 'hero_image',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Formato no permitido. Use JPEG, PNG, GIF o WebP.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`La imagen no debe superar ${MAX_SIZE_MB}MB`);
      return;
    }

    setUploadingImage(field);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const slug = form.slug || slugify(form.name) || 'career';
      const path = `career-covers/${slug}/${field}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      setForm((prev) => ({ ...prev, [field]: publicUrl }));
    } catch (err: any) {
      alert(err?.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(null);
      e.target.value = '';
    }
  };

  // Learning points helpers
  const addLearningPoint = () => {
    setForm((prev) => ({
      ...prev,
      learning_points: [...prev.learning_points, { title: '', url: '' }],
    }));
  };

  const updateLearningPoint = (index: number, field: 'title' | 'url', value: string) => {
    setForm((prev) => ({
      ...prev,
      learning_points: prev.learning_points.map((lp, i) =>
        i === index ? { ...lp, [field]: value } : lp,
      ),
    }));
  };

  const removeLearningPoint = (index: number) => {
    setForm((prev) => ({
      ...prev,
      learning_points: prev.learning_points.filter((_, i) => i !== index),
    }));
  };

  // Graduate profile helpers
  const addGraduateSkill = () => {
    setForm((prev) => ({
      ...prev,
      graduate_profile: [...prev.graduate_profile, ''],
    }));
  };

  const updateGraduateSkill = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      graduate_profile: prev.graduate_profile.map((s, i) =>
        i === index ? value : s,
      ),
    }));
  };

  const removeGraduateSkill = (index: number) => {
    setForm((prev) => ({
      ...prev,
      graduate_profile: prev.graduate_profile.filter((_, i) => i !== index),
    }));
  };

  // Opportunities helpers
  const addOpportunity = () => {
    setForm((prev) => ({
      ...prev,
      opportunities: [...prev.opportunities, { title: '', salaryRange: '' }],
    }));
  };

  const updateOpportunity = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      opportunities: prev.opportunities.map((o, i) =>
        i === index ? { ...o, [field]: value } : o,
      ),
    }));
  };

  const removeOpportunity = (index: number) => {
    setForm((prev) => ({
      ...prev,
      opportunities: prev.opportunities.filter((_, i) => i !== index),
    }));
  };

  // Admission process helpers
  const addAdmissionStep = () => {
    setForm((prev) => ({
      ...prev,
      admission_process: [
        ...prev.admission_process,
        { step: String(prev.admission_process.length + 1), title: '', description: '' },
      ],
    }));
  };

  const updateAdmissionStep = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      admission_process: prev.admission_process.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const removeAdmissionStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      admission_process: prev.admission_process.filter((_, i) => i !== index),
    }));
  };

  // Keywords helper
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !form.metadata.keywords.includes(kw)) {
      setForm((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, keywords: [...prev.metadata.keywords, kw] },
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        keywords: prev.metadata.keywords.filter((_, i) => i !== index),
      },
    }));
  };

  const inputClass =
    'w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary';

  if (!user || user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-text-primary">
        No tienes permisos para ver esta sección
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <BrainCircuit className="text-secondary" size={28} />
            </div>
            Dashboard de Carreras
          </h1>
          <p className="text-text-muted mt-2">
            Gestiona las carreras tecnológicas, sus programas asociados y visibilidad
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => {
              setIsAdding(true);
              setForm({ ...emptyForm });
              setExpandedForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Carrera
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total Carreras</p>
              <p className="text-3xl font-bold text-text-primary">{careers.length}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <BrainCircuit className="text-secondary" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Visibles</p>
              <p className="text-3xl font-bold text-green-400">
                {careers.filter((c) => c.is_visible).length}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Eye className="text-green-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Ocultas</p>
              <p className="text-3xl font-bold text-text-muted">
                {careers.filter((c) => !c.is_visible).length}
              </p>
            </div>
            <div className="p-3 bg-text-muted/10 rounded-lg">
              <EyeOff className="text-text-muted" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary">
              {editingId ? 'Editar Carrera' : 'Nueva Carrera'}
            </h3>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              aria-label="Cancelar"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            {/* Basic info */}
            <fieldset>
              <legend className="text-lg font-semibold text-text-primary mb-4">
                Información básica
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name,
                        slug: prev.slug || slugify(name),
                      }));
                    }}
                    className={inputClass}
                    placeholder="IA Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="ia-engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="12 meses"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Nivel
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, level: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Intermedio-Avanzado">Intermedio-Avanzado</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Modalidad
                  </label>
                  <select
                    value={form.modality}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, modality: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Próximo inicio
                  </label>
                  <input
                    type="text"
                    value={form.next_start_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        next_start_date: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Enero 2026"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Público objetivo
                  </label>
                  <input
                    type="text"
                    value={form.target_audience}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        target_audience: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Para profesionales que quieren especializarse en..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descripción corta
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className={inputClass}
                    rows={2}
                    placeholder="Breve descripción de la carrera"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descripción larga
                  </label>
                  <textarea
                    value={form.long_description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        long_description: e.target.value,
                      }))
                    }
                    className={inputClass}
                    rows={3}
                    placeholder="Descripción completa para la página de detalle"
                  />
                </div>

                {/* Visibility toggle */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, is_visible: !prev.is_visible }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.is_visible ? 'bg-secondary' : 'bg-border-color'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.is_visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-text-primary font-medium">
                    {form.is_visible ? 'Visible en el sitio' : 'Oculta del sitio'}
                  </span>
                </div>
              </div>
            </fieldset>

            {/* Images */}
            <fieldset>
              <legend className="text-lg font-semibold text-text-primary mb-4">
                Imágenes
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover image */}
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">
                    Imagen de portada (card)
                  </p>
                  <div className="flex flex-col gap-3">
                    {form.image ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-bg-secondary border border-border-color">
                        <Image
                          src={form.image}
                          alt="Portada"
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-bg-secondary border border-dashed border-border-color flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-text-muted" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50 transition-colors cursor-pointer text-sm font-medium">
                        {uploadingImage === 'image' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                        <span>{form.image ? 'Cambiar' : 'Subir'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => handleImageUpload(e, 'image')}
                          disabled={!!uploadingImage}
                          className="sr-only"
                        />
                      </label>
                      {form.image && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, image: null }))
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero image */}
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">
                    Imagen hero (detalle)
                  </p>
                  <div className="flex flex-col gap-3">
                    {form.hero_image ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-bg-secondary border border-border-color">
                        <Image
                          src={form.hero_image}
                          alt="Hero"
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-bg-secondary border border-dashed border-border-color flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-text-muted" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50 transition-colors cursor-pointer text-sm font-medium">
                        {uploadingImage === 'hero_image' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                        <span>{form.hero_image ? 'Cambiar' : 'Subir'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => handleImageUpload(e, 'hero_image')}
                          disabled={!!uploadingImage}
                          className="sr-only"
                        />
                      </label>
                      {form.hero_image && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, hero_image: null }))
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Expandable advanced sections */}
            <div>
              <button
                type="button"
                onClick={() => setExpandedForm(!expandedForm)}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
              >
                {expandedForm ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {expandedForm ? 'Ocultar secciones avanzadas' : 'Mostrar secciones avanzadas'}
              </button>
            </div>

            {expandedForm && (
              <>
                {/* Learning Points / Program Association */}
                <fieldset>
                  <legend className="text-lg font-semibold text-text-primary mb-4">
                    Programas asociados (Learning Points)
                  </legend>
                  <div className="space-y-3">
                    {form.learning_points.map((lp, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg border border-border-color"
                      >
                        <input
                          type="text"
                          value={lp.title}
                          onChange={(e) =>
                            updateLearningPoint(index, 'title', e.target.value)
                          }
                          className="flex-1 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-secondary"
                          placeholder="Título del programa"
                        />
                        <select
                          value={lp.url || ''}
                          onChange={(e) =>
                            updateLearningPoint(index, 'url', e.target.value)
                          }
                          className="w-48 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                        >
                          <option value="">Sin programa</option>
                          {programs.map((prog) => (
                            <option key={prog.id} value={`/${prog.code}`}>
                              {prog.name} ({prog.code})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeLearningPoint(index)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addLearningPoint}
                      className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar programa
                    </button>
                  </div>
                </fieldset>

                {/* Graduate Profile */}
                <fieldset>
                  <legend className="text-lg font-semibold text-text-primary mb-4">
                    Perfil del egresado
                  </legend>
                  <div className="space-y-2">
                    {form.graduate_profile.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) =>
                            updateGraduateSkill(index, e.target.value)
                          }
                          className={`${inputClass} text-sm`}
                          placeholder="Habilidad o competencia"
                        />
                        <button
                          type="button"
                          onClick={() => removeGraduateSkill(index)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addGraduateSkill}
                      className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar habilidad
                    </button>
                  </div>
                </fieldset>

                {/* Opportunities */}
                <fieldset>
                  <legend className="text-lg font-semibold text-text-primary mb-4">
                    Oportunidades laborales
                  </legend>
                  <div className="space-y-3">
                    {form.opportunities.map((opp, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg border border-border-color"
                      >
                        <input
                          type="text"
                          value={opp.title}
                          onChange={(e) =>
                            updateOpportunity(index, 'title', e.target.value)
                          }
                          className="flex-1 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-secondary"
                          placeholder="Cargo"
                        />
                        <input
                          type="text"
                          value={opp.salaryRange || ''}
                          onChange={(e) =>
                            updateOpportunity(index, 'salaryRange', e.target.value)
                          }
                          className="w-48 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-secondary"
                          placeholder="Rango salarial"
                        />
                        <button
                          type="button"
                          onClick={() => removeOpportunity(index)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOpportunity}
                      className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar oportunidad
                    </button>
                  </div>
                </fieldset>

                {/* Admission Process */}
                <fieldset>
                  <legend className="text-lg font-semibold text-text-primary mb-4">
                    Proceso de admisión
                  </legend>
                  <div className="space-y-3">
                    {form.admission_process.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg border border-border-color"
                      >
                        <input
                          type="text"
                          value={step.step}
                          onChange={(e) =>
                            updateAdmissionStep(index, 'step', e.target.value)
                          }
                          className="w-16 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm text-center focus:outline-none focus:ring-1 focus:ring-secondary"
                          placeholder="#"
                        />
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) =>
                            updateAdmissionStep(index, 'title', e.target.value)
                          }
                          className="flex-1 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-secondary"
                          placeholder="Título"
                        />
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) =>
                            updateAdmissionStep(index, 'description', e.target.value)
                          }
                          className="flex-1 p-2 bg-[var(--card-background)] border border-border-color rounded text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-secondary"
                          placeholder="Descripción"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdmissionStep(index)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAdmissionStep}
                      className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar paso
                    </button>
                  </div>
                </fieldset>

                {/* SEO Metadata */}
                <fieldset>
                  <legend className="text-lg font-semibold text-text-primary mb-4">
                    Metadata SEO
                  </legend>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Título SEO
                      </label>
                      <input
                        type="text"
                        value={form.metadata.title}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            metadata: { ...prev.metadata, title: e.target.value },
                          }))
                        }
                        className={inputClass}
                        placeholder="Carrera IA Engineer - Tech Centre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Descripción SEO
                      </label>
                      <textarea
                        value={form.metadata.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              description: e.target.value,
                            },
                          }))
                        }
                        className={inputClass}
                        rows={2}
                        placeholder="Descripción para buscadores"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Keywords
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.metadata.keywords.map((kw, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/30"
                          >
                            {kw}
                            <button
                              type="button"
                              onClick={() => removeKeyword(index)}
                              className="hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                          className={`${inputClass} text-sm`}
                          placeholder="Agregar keyword y presionar Enter"
                        />
                        <button
                          type="button"
                          onClick={addKeyword}
                          className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg border border-secondary/30 hover:bg-secondary/20 transition-colors text-sm font-medium shrink-0"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-bg-secondary text-text-primary font-medium rounded-lg border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50 transition-all duration-200"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading && !isAdding && !editingId ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-secondary" />
            <p className="text-text-muted">Cargando carreras...</p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden">
          {careers.length === 0 ? (
            <div className="p-12 text-center">
              <BrainCircuit className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-lg">No hay carreras registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-bg-secondary/50 border-b border-border-color">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Carrera
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Duración
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Nivel
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Programas
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Visibilidad
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color bg-[var(--card-background)]">
                  {careers.map((career) => (
                    <tr
                      key={career.id}
                      className="hover:bg-bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary border border-border-color">
                            {career.image ? (
                              <Image
                                src={career.image}
                                alt={career.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">
                              {career.name}
                            </p>
                            <p className="text-sm text-text-muted">{career.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">
                        {career.duration || '—'}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">
                        {career.level || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30">
                          <BrainCircuit className="w-3.5 h-3.5" />
                          {career.learning_points?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleVisibility(career)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            career.is_visible
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                              : 'bg-text-muted/20 text-text-muted border border-border-color hover:bg-text-muted/30'
                          }`}
                          title={
                            career.is_visible
                              ? 'Clic para ocultar'
                              : 'Clic para mostrar'
                          }
                        >
                          {career.is_visible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Oculta
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(career)}
                            className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setCareerToDelete(career);
                            }}
                            className="p-2 bg-red-500/30 text-red-400 border border-red-500/50 hover:bg-red-500/40 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {careerToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-career-title"
        >
          <div className="bg-[var(--card-background)] rounded-xl shadow-xl w-full max-w-md border border-border-color">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    id="delete-career-title"
                    className="text-lg font-semibold text-text-primary"
                  >
                    Eliminar carrera
                  </h3>
                  <p className="mt-2 text-text-muted">
                    ¿Estás seguro de que deseas eliminar{' '}
                    <strong className="text-text-primary">
                      {careerToDelete.name}
                    </strong>
                    ? Esta acción no se puede deshacer.
                  </p>
                  {deleteError && (
                    <p className="mt-3 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                      {deleteError}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => {
                  if (!deleting) {
                    setCareerToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary font-medium text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
