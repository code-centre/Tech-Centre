'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  professional_title?: string;
  linkedin_url?: string;
}

interface StudentProfileEditorProps {
  profile: Profile;
}

export default function StudentProfileEditor({ profile: initialProfile }: StudentProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: initialProfile.first_name,
    last_name: initialProfile.last_name,
    email: initialProfile.email,
    phone: initialProfile.phone || '',
    role: initialProfile.role,
    professional_title: initialProfile.professional_title || '',
    linkedin_url: initialProfile.linkedin_url || '',
  });

  const supabase = createClient();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          professional_title: formData.professional_title || null,
          linkedin_url: formData.linkedin_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', initialProfile.user_id);

      if (updateError) throw updateError;
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: initialProfile.first_name,
      last_name: initialProfile.last_name,
      email: initialProfile.email,
      phone: initialProfile.phone || '',
      role: initialProfile.role,
      professional_title: initialProfile.professional_title || '',
      linkedin_url: initialProfile.linkedin_url || '',
    });
    setError('');
    setIsEditing(false);
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="profile-editor-heading"
    >
      <div className="p-4 border-b border-border-color flex items-center justify-between">
        <h2 id="profile-editor-heading" className="text-xl font-semibold text-text-primary">
          Datos del perfil
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50 hover:bg-bg-primary transition-colors text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <p className="mb-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>
        )}

        {isEditing ? (
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Apellido</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                >
                  <option value="student">Estudiante</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Título profesional
                </label>
                <input
                  type="text"
                  name="professional_title"
                  value={formData.professional_title}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Nombre</p>
              <p className="text-text-primary font-medium mt-0.5">
                {initialProfile.first_name} {initialProfile.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Email</p>
              <p className="text-text-primary mt-0.5">{initialProfile.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Teléfono</p>
              <p className="text-text-primary mt-0.5">{initialProfile.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Rol</p>
              <p className="text-text-primary mt-0.5 capitalize">{initialProfile.role}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Título profesional
              </p>
              <p className="text-text-primary mt-0.5">
                {initialProfile.professional_title || '—'}
              </p>
            </div>
            {initialProfile.linkedin_url && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  LinkedIn
                </p>
                <a
                  href={initialProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline mt-0.5 inline-block"
                >
                  {initialProfile.linkedin_url}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
