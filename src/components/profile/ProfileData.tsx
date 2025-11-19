import React from 'react';
import { db } from '../../../firebase'
import useUserStore from '../../../store/useUserStore'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { MailIcon, PhoneIcon, SaveIcon, UserIcon, IdCardIcon, MapPinIcon, BriefcaseIcon, CalendarIcon } from 'lucide-react'

import { useState, useEffect } from 'react'
import { cn } from '../../../utils/cn'
import { useUser } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import Image from 'next/image'

export default function ProfileData() {
  const { user } = useUser()
  console.log('Usuario actual:', user)
  const [isEditing, setIsEditing] = useState(false)
  const [gender, setGender] = useState(user?.gender)
  const [phone, setPhone] = useState(user?.phone)
  const [occupation, setOccupation] = useState(user?.occupation)
  const [typeID, setTypeID] = useState<string>(user?.typeID ? user?.typeID : 'Sin asignar')
  const [iDNumber, setIDNumber] = useState<string | number>(user?.idNumber ? user?.idNumber : 'Sin asignar')
  const [city, setCity] = useState<string>(user?.city ? user?.city : 'Sin asignar')
  const [address, setAddress] = useState<string>(user?.address ? user?.address : 'Sin asignar')
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    id_type: user?.id_type || 'CC',
    id_number: user?.id_number || '',
    birthdate: user?.birthdate || '',
    address: user?.address || '',
    role: user?.role || '',
    profile_image: user?.profile_image || '',
    professional_title: user?.professional_title || '',
    bio: user?.bio || ''
  })

  // Agrega esto después de la declaración de los estados
useEffect(() => {
  console.log('Datos del usuario:', user);
  console.log('Estado actual del formData:', formData);
  
  // Actualizar formData cuando user cambie
  if (user) {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      id_type: user.id_type || 'CC',
      id_number: user.id_number || '',
      birthdate: user.birthdate || '',
      address: user.address || '',
      role: user.role || '',
      profile_image: user.profile_image || '',
      professional_title: user.professional_title || '',
      bio: user.bio || ''
    });
  }
}, [user]);  // Este efecto se ejecutará cuando el usuario cambie  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state if needed
      if (data) {
        useUserStore.getState().setUser({
          ...user,
          ...data
        });
      }
      
      setIsEditing(false);
      console.log('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil. Por favor, inténtalo de nuevo.');
    }
}

  function calcularEdad(fechaNacimiento: string) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    // Si el mes actual es menor al de nacimiento o está en el mismo mes pero el día es menor, restamos un año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }


  const uploadImage = async (file: File) => {
  console.log('Iniciando uploadImage con archivo:', file.name);
  if (!file) {
    console.log('No se seleccionó ningún archivo');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `profiles/profile_image/${fileName}`;
    
    console.log('Subiendo a Supabase...', { filePath });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('image')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error en upload:', uploadError);
      throw uploadError;
    }

    console.log('Upload exitoso, obteniendo URL pública...');
    const { data: { publicUrl } } = supabase.storage
      .from('image')
      .getPublicUrl(filePath);

    console.log('URL pública generada:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Error en uploadImage:', error);
    throw error;
  }
};
  useEffect(() => {
    console.log('formData actualizado:', formData.profile_image);
  }, [formData.profile_image]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-bgCard rounded-xl shadow-md overflow-hidden backdrop-blur-sm">
        {/* foto, bio y titulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Bio
            </label>
            {isEditing ? (
              <input
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.bio}
              </p>
            )}
            <label className="block text-sm font-medium text-blueApp mb-1">
              Titulo profesional
            </label>
            {isEditing ? (
              <input
                type="text"
                name="professional_title"
                value={formData.professional_title}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.professional_title}
              </p>
            )}
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm flex flex-col items-center">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Foto
            </label>
            {isEditing ? (
              <div className="w-full">
                <input
                  type="file"
                  id="profile-image-upload"
                  name="photo"
                  accept="image/*"
                  className="hidden" // Ocultamos el input original
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    console.log('Archivo seleccionado:', file?.name);
                    if (!file) return;

                    try {
                      console.log('Iniciando carga de imagen...');
                      const publicUrl = await uploadImage(file);
                      console.log('URL de la imagen subida:', publicUrl);
                      
                      if (publicUrl) {
                        console.log('Actualizando estado con nueva imagen...');
                        setFormData(prev => {
                          console.log('Estado anterior:', prev.profile_image);
                          const newState = {
                            ...prev,
                            profile_image: publicUrl
                          };
                          console.log('Nuevo estado:', newState.profile_image);
                          return newState;
                        });
                      }
                    } catch (error) {
                      console.error('Error en onChange:', error);
                      alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
                    }
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  {/* Botón personalizado para abrir el selector de archivos */}
                  <label 
                    htmlFor="profile-image-upload"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center cursor-pointer"
                  >
                    Seleccionar imagen
                  </label>
                  
                  {/* Vista previa de la imagen */}
                  {formData.profile_image && (
                    <div className="mt-2 flex flex-col items-center">
                      <img 
                        src={formData.profile_image} 
                        alt="Vista previa" 
                        className="h-32 w-32 object-cover rounded-md border-2 border-white/20"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Haz clic en la imagen para cambiarla
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('profiles')
                              .update({ profile_image: formData.profile_image })
                              .eq('user_id', user?.id);
                            
                            if (error) throw error;
                            
                            alert('Imagen de perfil actualizada correctamente');
                          } catch (error) {
                            console.error('Error al guardar la imagen de perfil:', error);
                            alert('Error al guardar la imagen de perfil');
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Guardar imagen de perfil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Image
                src={formData.profile_image || '/3.webp'}
                alt="Foto de perfil"
                width={200}
                height={200}
                className="w-50 h-50 rounded-lg border-2 border-blueApp"
              />
            )}
          </div>
        </div>
        {/* nombre y apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Nombre
            </label>
            {isEditing ? (
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.first_name}
              </p>
            )}
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Apellidos
            </label>
            {isEditing ? (
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.last_name}
              </p>
            )}
          </div>
        </div>
        {/* identificacion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Tipo de documento
            </label>
            {isEditing ? (
              <select
                name="id_type"
                value={formData.id_type}
                onChange={handleInputChange}
                className="w-full bg-gray-900/50 border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">Seleccionar tipo de documento</option>
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="NIT">NIT</option>
                <option value="PEP">PEP</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.id_type}
              </p>
            )}
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Número de documento
            </label>
            {isEditing ? (
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.id_number}
              </p>
            )}
          </div>
        </div>
        {/* email y celular*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Email
            </label>
            {isEditing ? (
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.email}
              </p>
            )}
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Celular
            </label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.phone}
              </p>
            )}
          </div>
        </div>
        {/*nacimiento y direccion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Nacimiento
            </label>
            {isEditing ? (
              <input
                type="text"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.birthdate}
              </p>
            )}
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <label className="block text-sm font-medium text-blueApp mb-1">
              Dirección
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-700/50 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            ) : (
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>
                {formData.address}
              </p>
            )}
          </div>
        </div>
        {/* botones */}
        <div className="px-6 py-5 bg-gray-900/50 border-t border-gray-700/30 flex justify-end gap-3">
          {isEditing ? (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar cambios
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Editar perfil
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
