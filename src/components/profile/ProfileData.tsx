'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { User, Mail, Phone, MapPin, Calendar, IdCard, Briefcase, FileText, Camera, Save, X, Linkedin, Twitter, Instagram, Github } from 'lucide-react'
import Image from 'next/image'
import ButtonToEdit from '../ButtonToEdit'
import ContainerButtonsEdit from '../ContainerButtonsEdit'

interface FormFieldProps {
  label: string
  value: string
  name: string
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea'
  options?: { value: string; label: string }[]
  icon?: React.ReactNode
}

function FormField({ label, value, name, isEditing, onChange, type = 'text', options, icon }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
        {icon}
        {label}
      </label>
      {isEditing ? (
        type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent resize-none"
          />
        ) : options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={`https://...`}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent"
          />
        )
      ) : (
        <p className="px-4 py-2 text-white bg-gray-800/30 rounded-lg border border-gray-700/50 min-h-[42px] flex items-center">
          {value || <span className="text-gray-500 italic">No especificado</span>}
        </p>
      )}
    </div>
  )
}

interface SocialFieldProps {
  label: string
  value: string
  name: string
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: React.ReactNode
  placeholder?: string
}

function SocialField({ label, value, name, isEditing, onChange, icon, placeholder }: SocialFieldProps) {
  const getDomain = (url: string) => {
    if (!url || url.trim() === '') return ''
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // Normalizar el valor para verificar si tiene contenido
  const hasValue = value && value.trim() !== ''

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
        {icon}
        {label}
      </label>
      {isEditing ? (
        <input
          type="url"
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || 'https://...'}
          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent"
        />
      ) : (
        hasValue ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-blueApp hover:text-blue-400 bg-gray-800/30 rounded-lg border border-gray-700/50 min-h-[42px] flex items-center gap-2 hover:border-blueApp/50 transition-colors"
          >
            {icon}
            <span className="truncate">{getDomain(value)}</span>
            <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <p className="px-4 py-2 text-white bg-gray-800/30 rounded-lg border border-gray-700/50 min-h-[42px] flex items-center">
            <span className="text-gray-500 italic">No especificado</span>
          </p>
        )
      )}
    </div>
  )
}

export default function ProfileData() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_type: 'CC',
    id_number: '',
    birthdate: '',
    address: '',
    profile_image: '',
    professional_title: '',
    bio: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    github_url: ''
  })

  useEffect(() => {
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
        profile_image: user.profile_image || '',
        professional_title: user.professional_title || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        twitter_url: user.twitter_url || '',
        instagram_url: user.instagram_url || '',
        github_url: user.github_url || ''
      })
    }
  }, [user])  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `profiles/profile_image/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('image')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('image')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      throw error
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const publicUrl = await uploadImage(file)
      if (publicUrl) {
        setFormData(prev => ({ ...prev, profile_image: publicUrl }))
      }
    } catch (error) {
      setError('Error al subir la imagen. Por favor, inténtalo de nuevo.')
    }
  }

  const handleSubmit = async () => {
    if (!user?.id) return

    setIsSaving(true)
    setError('')

    try {
      // Preparar datos básicos que siempre existen
      const updateData: any = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        id_type: formData.id_type || null,
        id_number: formData.id_number || null,
        birthdate: formData.birthdate || null,
        address: formData.address || null,
        profile_image: formData.profile_image || null,
        professional_title: formData.professional_title || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString()
      }

      // Agregar campos de redes sociales (incluyendo valores vacíos para poder limpiarlos)
      updateData.linkedin_url = formData.linkedin_url?.trim() || null
      updateData.twitter_url = formData.twitter_url?.trim() || null
      updateData.instagram_url = formData.instagram_url?.trim() || null
      updateData.github_url = formData.github_url?.trim() || null

      const { error: updateError, data } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()

      if (updateError) {
        // Si el error es porque falta una columna, mostrar mensaje más claro
        if (updateError.code === 'PGRST204') {
          setError('Las columnas de redes sociales no existen en la base de datos. Por favor, agrégalas primero en Supabase.')
        } else {
          throw updateError
        }
        return
      }

      // Actualizar el estado ANTES de refrescar para evitar que se quede en estado de guardado
      setIsSaving(false)
      setIsEditing(false)
      setError('')
      
      // Actualizar formData con los datos guardados si están disponibles
      if (data && data[0]) {
        setFormData({
          first_name: data[0].first_name || '',
          last_name: data[0].last_name || '',
          email: data[0].email || '',
          phone: data[0].phone || '',
          id_type: data[0].id_type || 'CC',
          id_number: data[0].id_number || '',
          birthdate: data[0].birthdate || '',
          address: data[0].address || '',
          profile_image: data[0].profile_image || '',
          professional_title: data[0].professional_title || '',
          bio: data[0].bio || '',
          linkedin_url: data[0].linkedin_url || '',
          twitter_url: data[0].twitter_url || '',
          instagram_url: data[0].instagram_url || '',
          github_url: data[0].github_url || ''
        })
      }
      
      // Refrescar los datos sin recargar la página completa
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.'
      setError(errorMessage)
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
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
        profile_image: user.profile_image || '',
        professional_title: user.professional_title || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        twitter_url: user.twitter_url || '',
        instagram_url: user.instagram_url || '',
        github_url: user.github_url || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blueApp border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Cargando información del perfil...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario después de cargar, no mostrar nada
  if (!user) {
    return null
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-blueApp/10 rounded-lg">
            <User className="text-blueApp" size={24} />
          </div>
          Información Personal
        </h2>
        {!isEditing && (
          <ButtonToEdit startEditing={() => setIsEditing(true)} />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 shadow-xl overflow-hidden">
        {/* Profile Image Section */}
        <div className="bg-gradient-to-r from-blueApp/20 via-zinc-800 to-zinc-800 px-6 pt-8 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-xl ring-4 ring-blueApp/20">
                <Image
                  width={160}
                  height={160}
                  src={formData.profile_image || '/man-avatar.png'}
                  alt={`${formData.first_name} ${formData.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 p-2 bg-blueApp hover:bg-blue-600 rounded-full shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  </label>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {formData.first_name} {formData.last_name}
              </h3>
              {formData.professional_title && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-blueApp">
                  <Briefcase className="w-5 h-5" />
                  <p className="text-lg font-medium">{formData.professional_title}</p>
                    </div>
                  )}
                </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blueApp" />
              Información Personal
            </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<User className="w-4 h-4" />}
              />
              <FormField
                label="Apellidos"
                name="last_name"
                value={formData.last_name}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<User className="w-4 h-4" />}
              />
              <FormField
                label="Email"
                name="email"
                value={formData.email}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="email"
                icon={<Mail className="w-4 h-4" />}
              />
              <FormField
                label="Teléfono"
                name="phone"
                value={formData.phone}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="tel"
                icon={<Phone className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Identification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <IdCard className="w-5 h-5 text-blueApp" />
              Identificación
            </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tipo de documento"
                name="id_type"
                value={formData.id_type}
                isEditing={isEditing}
                onChange={handleInputChange}
                options={[
                  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
                  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
                  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
                  { value: 'PASSPORT', label: 'Pasaporte' }
                ]}
                icon={<IdCard className="w-4 h-4" />}
              />
              <FormField
                label="Número de documento"
                name="id_number"
                value={formData.id_number}
                isEditing={isEditing}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Location & Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blueApp" />
              Ubicación y Fecha
            </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Fecha de nacimiento"
                name="birthdate"
                value={formData.birthdate}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="date"
                icon={<Calendar className="w-4 h-4" />}
              />
              <FormField
                label="Dirección"
                name="address"
                value={formData.address}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blueApp" />
              Información Profesional
            </h3>
            <div className="space-y-4">
              <FormField
                label="Título profesional"
                name="professional_title"
                value={formData.professional_title}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<Briefcase className="w-4 h-4" />}
              />
              <FormField
                label="Biografía"
                name="bio"
                value={formData.bio}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="textarea"
                icon={<FileText className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blueApp" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.305-2.185 4.344-.977.784-2.148 1.176-3.383 1.176-.896 0-1.747-.184-2.424-.52v-.136c0-1.011-.02-2.04-.06-3.08-.04-1.12-.08-2.24-.12-3.36-.04-1.04-.08-2.08-.12-3.12 0-.184.08-.36.24-.488.16-.12.36-.2.568-.2h2.488c.416 0 .736.32.736.736v.304c.896-.6 1.936-.904 3.12-.904 1.36 0 2.488.488 3.384 1.464.896.976 1.344 2.24 1.344 3.792v.304zm-5.568 7.68c1.36 0 2.488-.488 3.384-1.464.896-.976 1.344-2.24 1.344-3.792v-.304c-.896.6-1.936.904-3.12.904-1.36 0-2.488-.488-3.384-1.464-.896-.976-1.344-2.24-1.344-3.792v-.304c-.896-.6-1.936-.904-3.12-.904-1.36 0-2.488.488-3.384 1.464-.896.976-1.344 2.24-1.344 3.792 0 1.552.448 2.816 1.344 3.792.896.976 2.024 1.464 3.384 1.464z"/>
              </svg>
              Redes Sociales
            </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SocialField
                label="LinkedIn"
                name="linkedin_url"
                value={formData.linkedin_url}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<Linkedin className="w-4 h-4 text-blue-500" />}
                placeholder="https://linkedin.com/in/tu-perfil"
              />
              <SocialField
                label="Twitter / X"
                name="twitter_url"
                value={formData.twitter_url}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<Twitter className="w-4 h-4 text-blue-400" />}
                placeholder="https://twitter.com/tu-usuario"
              />
              <SocialField
                label="Instagram"
                name="instagram_url"
                value={formData.instagram_url}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<Instagram className="w-4 h-4 text-pink-500" />}
                placeholder="https://instagram.com/tu-usuario"
              />
              <SocialField
                label="GitHub"
                name="github_url"
                value={formData.github_url}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={<Github className="w-4 h-4 text-gray-300" />}
                placeholder="https://github.com/tu-usuario"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="pt-6 border-t border-zinc-700/50">
              <ContainerButtonsEdit
                setFinishEdit={handleCancel}
                onSave={handleSubmit}
              />
              {isSaving && (
                <span className="ml-4 text-gray-400 text-sm">Guardando...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
