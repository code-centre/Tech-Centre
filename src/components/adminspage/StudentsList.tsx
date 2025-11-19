'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  date: string;
  course: string;
  courseId: string;
}

interface StudentsListProps {
  filters?: {
    searchTerm?: string;
    status?: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
    courseId?: string;
  };
}

export function StudentsList({ filters = {} }: StudentsListProps) {
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Efecto para obtener los perfiles de usuarios al cargar el componente
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          console.error('Error al obtener los perfiles:', error);
          return;
        }

        console.log('Perfiles obtenidos:', data);
        setProfiles(data || []);
      } catch (error) {
        console.error('Error inesperado al obtener perfiles:', error);
      }
    };

    fetchProfiles();
  }, []);

  // Aplicar filtros a los perfiles
  const filteredProfiles = profiles.filter(profile => {
    if (!profile) return false;
    
    // Filtrar por término de búsqueda (nombre, email)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
      if (!fullName.includes(searchTerm) && !profile.email.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    
    // Filtrar por rol (si es necesario)
    if (filters.status && profile.role !== filters.status) {
      return false;
    }
    
    // Filtrar por fecha de creación
    if (filters.startDate && new Date(profile.created_at) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate && new Date(profile.created_at) > new Date(filters.endDate)) {
      return false;
    }
    
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
          linkedin_url: editingProfile.linkedin_url, // Añadido
          updated_at: new Date().toISOString()
        })
        .eq('user_id', editingProfile.user_id)
        .select();

      if (error) throw error;

      // Actualizar la lista de perfiles
      setProfiles(profiles.map(p => p.user_id === editingProfile.user_id ? data[0] : p));
      setIsEditing(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  return (
    <div className="overflow-x-auto bg-bgCard rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="text-blueApp">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Nombre y apellido
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Fecha de inscripción (created_at)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Professional title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              LinkedIn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              ID number
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProfiles.map((profile) => (
            <tr key={profile.user_id} className="hover:bg-gray-50">
              <td className="px-2 py-4">
                <div className="w-32 overflow-x-auto whitespace-nowrap text-sm text-gray-500 no-scrollbar">
                  {profile.user_id}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {profile.first_name} {profile.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="w-32 overflow-x-auto whitespace-nowrap text-sm text-gray-500 no-scrollbar">
                  {profile.email}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(profile.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.professional_title || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.linkedin_url ? (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Ver perfil
                  </a>
                ) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.phone || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.address || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.id_number} ({profile.id_type})
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => {
                    setEditingProfile(profile);
                    setIsEditing(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Editar
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm('¿Estás seguro de que deseas eliminar este perfil?')) {
                      try {
                        const { error } = await supabase
                          .from('profiles')
                          .delete()
                          .eq('id', profile.id);
                        
                        if (error) throw error;
                        
                        // Actualizar la lista de perfiles
                        setProfiles(profiles.filter(p => p.id !== profile.id));
                      } catch (error) {
                        console.error('Error al eliminar el perfil:', error);
                        alert('Error al eliminar el perfil');
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredProfiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron estudiantes que coincidan con los filtros.
        </div>
      )}
      {isEditing && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Perfil</h2>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditingProfile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editingProfile.first_name || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, first_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    type="text"
                    value={editingProfile.last_name || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, last_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingProfile.email || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={editingProfile.phone || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={editingProfile.role || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, role: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="student">Estudiante</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrador</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={editingProfile.address || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, address: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título Profesional</label>
                  <input
                    type="text"
                    value={editingProfile.professional_title || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, professional_title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                  <select
                    value={editingProfile.id_type || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, id_type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="PEP">PEP</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                  <input
                    type="text"
                    value={editingProfile.id_number || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, id_number: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                  <input
                    type="text"
                    value={editingProfile.linkedin_url || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, linkedin_url: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProfile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}