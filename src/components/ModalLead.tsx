'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/supabase';
import { X, User, Mail, Phone, MessageSquare, GraduationCap, BookOpen, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ModalLeadProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGE_OPTIONS = [
  { value: 'bachiller', label: 'Bachillerato' },
  { value: 'tecnico', label: 'Técnico/Tecnólogo' },
  { value: 'pregrado', label: 'Pregrado' },
  { value: 'posgrado', label: 'Posgrado/Especialización' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' },
  { value: 'profesional', label: 'Profesional con experiencia' },
  { value: 'otro', label: 'Otro' }
];

const SOURCE_OPTIONS = [
  { value: 'Redes Sociales', label: 'Redes Sociales' },
  { value: 'Google', label: 'Google/Búsqueda web' },
  { value: 'Recomendación', label: 'Recomendación de amigo/colega' },
  { value: 'Publicidad', label: 'Publicidad online' },
  { value: 'Evento', label: 'Evento o feria' },
  { value: 'Email', label: 'Email marketing' },
  { value: 'Web', label: 'Página web Tech Centre' },
  { value: 'Otro', label: 'Otro' }
];

export default function ModalLead({ isOpen, onClose }: ModalLeadProps) {
  const { user } = useUser();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
    source: '',
    stage: '',
    interested_program_id: ''
  });
  
  const [programs, setPrograms] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Cargar programas disponibles
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setPrograms(data || []);
      } catch (error) {
        console.error('Error cargando programas:', error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    if (isOpen) {
      fetchPrograms();
    }
  }, [isOpen, supabase]);

  // Si el usuario está logueado, no mostrar el modal
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  if (!isOpen || user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Convertir interested_program_id a número o null
      const submitData = {
        ...formData,
        interested_program_id: formData.interested_program_id ? parseInt(formData.interested_program_id) : null
      };

      // Debug: Mostrar qué se está enviando
      console.log('FormData original:', formData);
      console.log('SubmitData:', submitData);
      console.log('Programs cargados:', programs);

      const { error } = await supabase
        .from('leads')
        .insert([submitData]);

      if (error) {
        throw error;
      }

      setMessage('¡Información enviada con éxito! Nos pondremos en contacto pronto.');
      setMessageType('success');
      
      // Limpiar formulario
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        notes: '',
        source: '',
        stage: '',
        interested_program_id: ''
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error al enviar lead:', error);
      setMessage('Error al enviar la información. Por favor intenta nuevamente.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Solicita más información
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+57 300 000 0000"
                />
              </div>
            </div>

            {/* ¿Cómo nos conociste? */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cómo nos conociste? *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Selecciona una opción</option>
                  {SOURCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Nivel de formación */}
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de formación *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Selecciona tu nivel</option>
                  {STAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Programa de interés */}
            <div>
              <label htmlFor="interested_program_id" className="block text-sm font-medium text-gray-700 mb-1">
                Programa de interés
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  id="interested_program_id"
                  name="interested_program_id"
                  value={formData.interested_program_id}
                  onChange={handleChange}
                  disabled={loadingPrograms}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:opacity-50"
                >
                  <option value="">Selecciona un programa (opcional)</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              {loadingPrograms && (
                <p className="text-xs text-gray-500 mt-1">Cargando programas...</p>
              )}
            </div>
          </div>

          {/* Notas adicionales */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios adicionales
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Cuéntanos qué te interesa o alguna pregunta específica..."
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}