// src/components/empresas/SolicitarTrabajo.tsx
'use client';

import { useState } from 'react';
// import { PaperClipIcon } from '@heroicons/react/24/outline';

interface SolicitarTrabajoProps {
    hayOfertas: boolean;
  }
export default function SolicitarTrabajo({ hayOfertas }: SolicitarTrabajoProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    puesto: '',
    experiencia: '',
    institucion: 'null',
    mensaje: '',
    archivo: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Datos del formulario:', formData);
    alert('¡Gracias por tu solicitud! Nos pondremos en contacto contigo pronto.');
  };

  if (!hayOfertas) {
    return (
        <div className="min-h-screen mt-32 bg-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-bgCard rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-800/30 group  sm:rounded-lg p-8">
              <h2 className="text-2xl font-bold text-zuccini mb-4">¡Gracias por tu interés!</h2>
              <p className="text-white">
                Actualmente no tenemos vacantes disponibles, pero puedes dejarnos tus datos y te contactaremos cuando tengamos nuevas oportunidades.
              </p>
              
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">¿Quieres que te contactemos?</h3>
                <p className="text-black mb-4">
                  Déjanos tu correo electrónico y te notificaremos cuando tengamos nuevas ofertas disponibles.
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="flex flex-col justify-center items-center gap-2">
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm"
                    />
                    <button
                      type="button"
                      className="mt-6 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-zuccini to-blue-600 hover:from-blue-600 hover:to-zuccini shadow-lg shadow-zuccini/20 hover:shadow-zuccini/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" 
                    >
                      Notificarme
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
    <div className="min-h-screen mt-32 bg-background py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zuccini">Solicitar Trabajo</h1>
        <p className="mt-2 text-lg text-white">
            Completa el formulario para postularte a nuestras ofertas de empleo
        </p>
        </div>
        
        <div className="bg-bgCard rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-800/30 group  sm:rounded-lg p-8">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-zuccini">
                Nombre completo *
                </label>
                <input
                type="text"
                name="nombre"
                id="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 bg-white block w-full rounded-md border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border-2"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-zuccini">
                Correo electrónico *
                </label>
                <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 bg-white block w-full rounded-md border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border-2"
                />
            </div>

            <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-zuccini">
                Teléfono *
                </label>
                <input
                type="tel"
                name="telefono"
                id="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="mt-1 bg-white block w-full rounded-md border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border-2"
                />
            </div>

            <div>
                <label htmlFor="puesto" className="block text-sm font-medium text-zuccini">
                Puesto al que aplicas *
                </label>
                <select
                id="puesto"
                name="puesto"
                required
                value={formData.puesto}
                onChange={handleChange}
                className="mt-1 bg-white block w-full rounded-md border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border-2"
                >
                <option value="">Selecciona un puesto</option>
                <option value="desarrollador-frontend">Desarrollador Frontend</option>
                <option value="desarrollador-backend">Desarrollador Backend</option>
                <option value="disenador-ux-ui">Diseñador UX/UI</option>
                <option value="otro">Otro</option>
                </select>
            </div>
            </div>

            <div>
            <label htmlFor="experiencia" className="block text-sm font-medium text-zuccini">
                Años de experiencia *
            </label>
            <select
                id="experiencia"
                name="experiencia"
                required
                value={formData.experiencia}
                onChange={handleChange}
                className="mt-1 bg-white block w-full rounded-md border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border-2"
            >
                <option value="">Selecciona años de experiencia</option>
                <option value="0-1">0-1 años</option>
                <option value="1-3">1-3 años</option>
                <option value="3-5">3-5 años</option>
                <option value="5+">Más de 5 años</option>
            </select>
            </div>

            <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-zuccini">
                Mensaje de presentación *
            </label>
            <div className="mt-1">
                <textarea
                id="mensaje"
                name="mensaje"
                rows={4}
                required
                value={formData.mensaje}
                onChange={handleChange}
                className="mt-1 bg-white block w-full rounded-md border-zuccini shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border-2"
                placeholder="Cuéntanos por qué eres el candidato ideal para este puesto..."
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-zuccini">Hoja de vida (PDF) *</label>
            <div className="mt-2 flex items-center">
                <label
                htmlFor="archivo"
                className="mt-1  bg-zuccini block cursor-pointer rounded-md border-white shadow-sm focus:border-zuccini focus:ring-zuccini sm:text-sm p-2 border"
                >
                <span>Subir archivo</span>
                <input
                    id="archivo"
                    name="archivo"
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleChange}
                    className="sr-only"
                />
                </label>
                <p className="pl-2 text-sm text-white">
                {formData.archivo ? formData.archivo.name : 'No se ha seleccionado ningún archivo'}
                </p>
            </div>
            <p className="mt-1 text-xs text-zuccini">
                Sube tu hoja de vida en formato PDF (máx. 5MB)
            </p>
            <p className="mt-1 text-xs text-zuccini">
                (*) Campo obligatorio.
            </p>
            </div>

            <div className="pt-4">
            <button
                type="button"
                className="mt-6 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-zuccini to-blue-600 hover:from-blue-600 hover:to-zuccini shadow-lg shadow-zuccini/20 hover:shadow-zuccini/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" 
            >
                Enviar solicitud
            </button>
            </div>
        </form>
        </div>
    </div>
    </div>
  );
}