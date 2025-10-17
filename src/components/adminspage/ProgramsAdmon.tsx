'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/supabase';

type Program = {
  id: number;
  name: string;
  syllabus: any; // jsonb
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  kind: string;
  total_hours: number;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function ProgramsAdmon() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentProgram, setCurrentProgram] = useState<Omit<Program, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    syllabus: {},
    kind: 'diplomado',
    code: '',
    difficulty: 'beginner',
    total_hours: 0,
    default_price: 0,
    is_active: true,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [viewingSyllabus, setViewingSyllabus] = useState<{isOpen: boolean, content: any}>({isOpen: false, content: null});

  // Función para abrir el modal con el contenido del syllabus
  const openSyllabusModal = (syllabus: any) => {
    setViewingSyllabus({
      isOpen: true,
      content: syllabus
    });
  };

  // Función para cerrar el modal
  const closeSyllabusModal = () => {
    setViewingSyllabus({isOpen: false, content: null});
  };

  // Función para cargar los programas desde Supabase
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Programas cargados:', data);
      setPrograms(data || []);
    } catch (err) {
      console.error('Error al cargar los programas:', err);
      setError('Error al cargar los programas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar programas al montar el componente
  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleEdit = (program: Program) => {
    setEditingId(program.id.toString());
    const { id, created_at, updated_at, ...rest } = program;
    setCurrentProgram(rest);
  };

  const handleSave = async () => {
    if (currentProgram.name.trim() === '') {
      alert('El nombre del programa es requerido');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Actualizar programa existente en Supabase
        const { data: updatedProgram, error } = await supabase
          .from('programs')
          .update({
            ...currentProgram,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        
        // Actualizar estado local
        setPrograms(programs.map(p => 
          p.id === updatedProgram.id ? updatedProgram : p
        ));
        
        setEditingId(null);
        alert('Programa actualizado exitosamente');
      } else {
        // Crear nuevo programa en Supabase
        const { data: newProgram, error } = await supabase
          .from('programs')
          .insert([
            {
              ...currentProgram,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (error) throw error;
        
        // Actualizar estado local con el nuevo programa
        setPrograms([newProgram, ...programs]);
        setIsAdding(false);
        alert('Programa creado exitosamente');
      }
      
      // Resetear formulario
      setCurrentProgram({
        name: '',
        syllabus: {},
        kind: 'diplomado',
        code: '',
        difficulty: 'beginner',
        total_hours: 0,
        default_price: 0,
        is_active: true,
      });
      
    } catch (err) {
      console.error('Error al guardar el programa:', err);
      alert('Ocurrió un error al guardar el programa. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este programa?')) {
      setPrograms(programs.filter(program => program.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setCurrentProgram({
      name: '',
      syllabus: {},
      kind: 'diplomado',
      code: '',
      difficulty: 'beginner',
      total_hours: 0,
      default_price: 0,
      is_active: true,
    });
  };

  const { user } = useUser();

  if (!user || (user?.role !== 'admin' && user?.role !== 'instructor')) {
    return <div className="p-8 text-center">No tienes permisos para ver esta sección</div>;
  }

  return (
    <div className="bg-bgCard rounded-lg shadow p-6 mb-8 border-2 border-blueApp">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-blueApp font-semibold">Programas Académicos</h2>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 cursor-pointer"
          >
            <Plus size={18} />
            Nuevo Programa
          </button>
        )}
      </div>

      {/* Formulario para agregar/editar */}
      {(isAdding || editingId) && (
        <>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">
                    {editingId ? 'Editar Programa' : 'Nuevo Programa'}
                </h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                        type="text"
                        value={currentProgram.name}
                        onChange={(e) => setCurrentProgram({...currentProgram, name: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="Nombre del programa"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input
                        type="text"
                        value={currentProgram.code}
                        onChange={(e) => setCurrentProgram({...currentProgram, code: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="Código del programa"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                    <select
                        value={currentProgram.difficulty}
                        onChange={(e) => setCurrentProgram({...currentProgram, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                        })}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <input
                        type="text"
                        value={currentProgram.kind}
                        onChange={(e) => setCurrentProgram({...currentProgram, kind: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="Tipo de programa"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
                    <input
                        type="number"
                        value={currentProgram.total_hours}
                        onChange={(e) => setCurrentProgram({...currentProgram, total_hours: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                        placeholder="Duración del programa en horas"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio por defecto</label>
                    <input
                        type="number"
                        value={currentProgram.default_price}
                        onChange={(e) => setCurrentProgram({...currentProgram, default_price: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                        placeholder="Precio por defecto del programa"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                        value={currentProgram.is_active.toString()}
                        onChange={(e) => setCurrentProgram({...currentProgram, is_active: e.target.value === 'true'})}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                    </div>
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus (JSON)</label>
                    <textarea
                        value={JSON.stringify(currentProgram.syllabus, null, 2)}
                        onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            setCurrentProgram({...currentProgram, syllabus: parsed});
                        } catch (err) {
                            console.error('Error al analizar el JSON del syllabus:', err);
                        }
                        }}
                        className="w-full p-2 border rounded-md font-mono text-sm"
                        rows={5}
                        placeholder="Syllabus del programa en formato JSON"
                    />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </>
      )}

      {/* Lista de programas */}
      {loading ? (
        <div className="text-center py-8">Cargando programas...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg">
            <thead className="bg-gray-50 rounded-lg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificultad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Syllabus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No hay programas registrados
                  </td>
                </tr>
              ) : (
                programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50 rounded-lg">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{program.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{program.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{program.difficulty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{program.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => openSyllabusModal(program.syllabus)}
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        ver
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-xs">{program.kind}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {program.total_hours} horas
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        ${program.default_price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {program.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {program.created_at ? new Date(program.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(program)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={!!editingId}
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(program.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={!!editingId}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal para ver el syllabus */}
      {viewingSyllabus.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Contenido del Syllabus</h3>
              <button
                onClick={closeSyllabusModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-grow">
              <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-[60vh]">
                {JSON.stringify(viewingSyllabus.content, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg">
              <button
                type="button"
                onClick={closeSyllabusModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}