'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Send, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/supabase'

interface UploadResponse {
  data: any;  // O un tipo más específico si lo tienes
  error: Error | null;
}

type UploadError = {
  message: string;
  statusCode?: number;
  // Add other expected properties of the error object here
};

export default function InstructorPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { user } = useUser()
  const [assessment, setAssessment] = useState({
    name: '',
    description: '',
    max_value: '',
    due_at: '',
    weight: '',
    resource: null as File | null,
    module_id: '1',  // Valor por defecto
    cohort_id: '1'   // Valor por defecto
  });



  const toggleForm = () => {
    setShowForm(!showForm)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAssessment(prev => ({ ...prev, resource: e.target.files![0] }));
    }
  }

  // Función para manejar cambios en los inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssessment(prev => ({ ...prev, [name]: value }));
    };

  // Modificar el handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Verificando conexión con Supabase...');
  const { data, error: connError } = await supabase
    .from('assessments')
    .select('*')
    .limit(1);
  console.log('Conexión a Supabase:', connError ? 'Error' : 'Exitosa', connError);
  
  if (!user) {
    console.error('No hay usuario autenticado')
    alert('Por favor inicia sesión para continuar')
    return
  }
  
  if (!assessment.name || !assessment.description || !assessment.max_value || !assessment.due_at) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  console.log('Iniciando envío del formulario...');
  
  try {
    let resourcePath = null;
    
    if (assessment.resource) {
      console.log('1. Preparando archivo para subir...', {
        name: assessment.resource.name,
        type: assessment.resource.type,
        size: assessment.resource.size
      });

      const fileExt = assessment.resource.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `assessments/${fileName}`;

      console.log('2. Iniciando carga del archivo al storage...', { filePath });
      
      try {
        // Crear una promesa con timeout
        const uploadPromise = supabase.storage
          .from('activities')
          .upload(filePath, assessment.resource, {
            cacheControl: '3600',
            upsert: false
          });

        // Timeout de 30 segundos
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Tiempo de espera agotado al subir el archivo')), 30000)
        );

        console.log('3. Esperando respuesta del servidor...');
        const { data: uploadData, error: uploadError } = await Promise.race([
          uploadPromise,
          timeoutPromise
        ]) as UploadResponse;

        if (uploadError) {
          const error = uploadError as Error & { statusCode?: number };
          console.error('4. Error al subir el archivo:', {
            error: error,
            message: error.message,
            status: error.statusCode
          });
          throw new Error('No se pudo subir el archivo. Inténtalo de nuevo sin archivo adjunto o inténtalo más tarde.');
        }

        console.log('4. ✅ Archivo cargado exitosamente al storage:', filePath);

        // Obtener URL pública
        console.log('5. Obteniendo URL pública...');
        const { data: { publicUrl } } = supabase.storage
          .from('activities')
          .getPublicUrl(filePath);

        resourcePath = publicUrl;
        console.log('6. URL pública generada:', resourcePath);

      } catch (uploadError) {
        console.error('Error en la carga del archivo:', {
          error: uploadError,
          // message: uploadError.message,
          // name: uploadError.name
        });
        // Continuar sin archivo adjunto
        alert('El archivo no pudo ser subido. Continuando sin archivo adjunto.');
      }
    }

    // Continuar con el resto del proceso de guardado
    console.log('7. Preparando datos para insertar en la base de datos...');
  
    // Crear el registro en la tabla assessments
    console.log('Iniciando inserción en la tabla assessments...');
    const { data: insertedData, error } = await (supabase as any)
        .from('assessments')
        .insert([{
        name: assessment.name,
        description: assessment.description,
        max_value: parseFloat(assessment.max_value),
        due_at: assessment.due_at,
        weight: assessment.weight ? parseFloat(assessment.weight) : null,
        resource_path: resourcePath,
        module_id: parseInt(assessment.module_id, 10),
        cohort_id: parseInt(assessment.cohort_id, 10)
      }])
        .select();

    if (error) {
        console.error('Error al insertar en la base de datos:', error);
        throw error;
    }

    console.log(' Registro insertado exitosamente en assessments:', insertedData);
    alert('Evaluación creada exitosamente');
    // Resetear el formulario
    setAssessment({
        name: '',
        description: '',
        max_value: '',
        due_at: '',
        weight: '',
        resource: null,
        module_id: '',
        cohort_id: ''
    });
    setShowForm(false);

     } catch (error) {
    console.error('Error en el proceso completo:', {
      error,
      // message: error.message,
      // name: error.name
    });
    // alert(`Error al crear la evaluación: ${error.message}`);
  }
};

  return (
    <div className="bg-bgCard rounded-l shadow-md overflow-hidden backdrop-blur-sm p-4">
      <div className='flex flex-col items-center gap-8'>
        <button 
          onClick={toggleForm}
          className="flex items-center gap-2 text-lg font-medium hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
        >
          <FileText className="w-5 h-5" />
          Subir Nueva Tarea
          {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showForm && (
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                <div className="space-y-2 bg-white p-4 rounded-xl">
                <label className="block text-sm font-medium text-zuccini">Nombre de la evaluación*</label>
                <input
                    type="text"
                    name="name"
                    value={assessment.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                />
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl">
                <label className="block text-sm font-medium text-zuccini">Descripción*</label>
                <textarea
                    name="description"
                    value={assessment.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    required
                />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zuccini">Valor máximo*</label>
                    <input
                    type="number"
                    name="max_value"
                    value={assessment.max_value}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    step="0.01"
                    min="0"
                    required
                    />
                </div>

                <div className="space-y-2 bg-white">
                    <label className="block text-sm font-medium text-zuccini">Peso (opcional)</label>
                    <input
                    type="number"
                    name="weight"
                    value={assessment.weight}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    step="0.01"
                    min="0"
                    max="1"
                    />
                </div>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl">
                <label className="block text-sm font-medium text-zuccini">Fecha de entrega*</label>
                <input
                    type="datetime-local"
                    name="due_at"
                    value={assessment.due_at}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-white p-4 rounded-xl">
                    <label className="block text-sm font-medium text-zuccini">Módulo ID</label>
                    <input
                      type="number"
                      name="module_id"
                      value={assessment.module_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2 bg-white p-4 rounded-xl">
                    <label className="block text-sm font-medium text-zuccini">Cohorte ID</label>
                    <input
                      type="number"
                      name="cohort_id"
                      value={assessment.cohort_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl">
                <label className="block text-sm font-medium text-zuccini">Archivo adjunto (opcional)</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-md"
                />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Crear Evaluación
                </button>
                </div>
            </form>
            )}

        <Link 
          href='/instructor' 
          className="text-blue-500 hover:underline flex items-center gap-1"
        >
          Ver cohortes
        </Link>
      </div>
    </div>
  )
}