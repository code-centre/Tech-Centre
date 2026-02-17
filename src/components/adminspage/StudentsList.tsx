'use client';
import { useSupabaseClient } from '@/lib/supabase';
import { useState, useEffect } from 'react';

// Tipos
interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin' | 'lead'; // Tipado estricto para roles
  created_at: string;
  phone?: string;
  address?: string;
  professional_title?: string;
  id_number?: string;
  id_type?: string;
  linkedin_url?: string;
}

interface StudentsListProps {
  filters?: {
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
  };
  enrollments?: any[]; // Para aceptar enrollments directamente
  showCohortInfo?: boolean; // Para mostrar u ocultar info de cohorte
}

export function StudentsList({ filters = {}, enrollments, showCohortInfo = true }: StudentsListProps) {
  const supabase = useSupabaseClient();

  // Si se pasan enrollments, usarlos directamente, si no, buscar en profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // NUEVO: Estado para la tab activa
  const [activeTab, setActiveTab] = useState<string>('all');

  // Definición de las tabs disponibles
  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'student', label: 'Estudiantes' },
    { id: 'instructor', label: 'Instructores' },
    { id: 'lead', label: 'Leads' },
    { id: 'admin', label: 'Administradores' },
  ];

  useEffect(() => {
    if (enrollments) {
      // Si se pasan enrollments, extraer los perfiles de ahí
      console.log('Enrollments en StudentsList:', enrollments);
      const extractedProfiles = enrollments.map(enrollment => enrollment.profiles).filter(Boolean);
      console.log('Perfiles extraídos:', extractedProfiles);
      setProfiles(extractedProfiles);
      setIsLoading(false);
    } else {
      // Comportamiento original: buscar en profiles
      const fetchProfiles = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*');

          if (error) throw error;
          setProfiles((data as Profile[]) || []);
        } catch (error) {
          console.error('Error al obtener perfiles:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfiles();
    }
  }, [enrollments, supabase]);

  // Lógica de filtrado unificada (Filtros props + Tab activa)
  const filteredProfiles = profiles.filter(profile => {
    if (!profile) return false;
    
    // 1. Filtro por TABS (Rol)
    if (activeTab !== 'all' && profile.role !== activeTab) {
      return false;
    }

    // 2. Filtro búsqueda (SearchTerm)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
      if (!fullName.includes(term) && !profile.email?.toLowerCase().includes(term)) {
        return false;
      }
    }
    
    // 3. Filtro fechas
    if (filters.startDate && new Date(profile.created_at) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(profile.created_at) > new Date(filters.endDate)) return false;
    
    return true;
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: editingProfile.first_name,
          last_name: editingProfile.last_name,
          email: editingProfile.email,
          phone: editingProfile.phone,
          address: editingProfile.address,
          role: editingProfile.role,
          professional_title: editingProfile.professional_title,
          id_number: editingProfile.id_number,
          id_type: editingProfile.id_type,
          linkedin_url: editingProfile.linkedin_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', editingProfile.user_id)
        .select();

      if (error) throw error;

      setProfiles(profiles.map(p => p.user_id === editingProfile.user_id ? (data[0] as Profile) : p));
      setIsEditing(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Error update:', error);
      alert('Error al actualizar');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('¿Eliminar perfil irreversiblemente?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) throw error;
      setProfiles(profiles.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error delete:', error);
    }
  };

  // Estilos reutilizables dark mode
  const inputClassName = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500";
  const labelClassName = "block text-sm font-medium text-gray-300";

  return (
    <div className="flex flex-col gap-4">
      {/* --- ZONA DE TABS --- */}
      <div className="border-b border-gray-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            // Calculamos cuántos hay de cada rol para mostrar un contador (Opcional pero útil)
            const count = profiles.filter(p => tab.id === 'all' ? true : p.role === tab.id).length;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${isActive 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}
                `}
              >
                {tab.label}
                <span className={`
                  hidden md:inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold rounded-full
                  ${isActive ? 'bg-blue-900 text-blue-200' : 'bg-gray-800 text-gray-400'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* --- TABLA --- */}
      <div className="overflow-x-auto bg-black rounded-lg shadow border border-gray-800 mt-2">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 animate-pulse">Cargando datos...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                {['ID', 'Nombre', 'Email', 'Rol', 'Fecha', 'Título', 'LinkedIn', 'Acciones'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-800">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-900 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {profile.user_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {profile.first_name} {profile.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {profile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     {/* Badge de Rol con colores dinámicos */}
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                       ${profile.role === 'student' ? 'bg-green-900 text-green-200 border border-green-800' : 
                         profile.role === 'instructor' ? 'bg-yellow-900 text-yellow-200 border border-yellow-800' :
                         profile.role === 'admin' ? 'bg-purple-900 text-purple-200 border border-purple-800' : 
                         'bg-blue-900 text-blue-200 border border-blue-800'}`}>
                        {profile.role?.toUpperCase()}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {profile.professional_title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {profile.linkedin_url ? (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        Link
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProfile(profile); setIsEditing(true); }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!isLoading && filteredProfiles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hay usuarios en esta categoría.</p>
            {activeTab !== 'all' && (
               <p className="text-gray-600 text-sm mt-2">Intenta cambiar a la pestaña "Todos"</p>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL EDITAR (Igual que antes pero mantenido por consistencia) --- */}
      {isEditing && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl font-bold text-white">Editar: {editingProfile.first_name}</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClassName}>Nombre</label><input type="text" value={editingProfile.first_name} onChange={(e) => setEditingProfile({...editingProfile, first_name: e.target.value})} className={inputClassName} required /></div>
                <div><label className={labelClassName}>Apellido</label><input type="text" value={editingProfile.last_name} onChange={(e) => setEditingProfile({...editingProfile, last_name: e.target.value})} className={inputClassName} required /></div>
                <div className="md:col-span-2"><label className={labelClassName}>Email</label><input type="email" value={editingProfile.email} onChange={(e) => setEditingProfile({...editingProfile, email: e.target.value})} className={inputClassName} required /></div>
                <div>
                  <label className={labelClassName}>Rol</label>
                  <select value={editingProfile.role} onChange={(e) => setEditingProfile({...editingProfile, role: e.target.value as any})} className={inputClassName}>
                    <option value="student">Estudiante</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div><label className={labelClassName}>LinkedIn</label><input type="text" value={editingProfile.linkedin_url || ''} onChange={(e) => setEditingProfile({...editingProfile, linkedin_url: e.target.value})} className={inputClassName} /></div>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}