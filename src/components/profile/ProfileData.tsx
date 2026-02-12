'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@/lib/supabase'
import { 
  User, Mail, Phone, MapPin, Calendar, IdCard, Briefcase, FileText, 
  Camera, Linkedin, Twitter, Instagram, Github, Droplets, AlertCircle 
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import ProfileHeader from './ProfileHeader'
import EditableField from './EditableField'
import ProfileAccordion from './ProfileAccordion'
import IDCardUpload from './IDCardUpload'

// Campos para cálculo de completitud
const PROFILE_FIELDS = {
  required: ['first_name', 'last_name', 'phone'], // 60% del peso
  optional: ['id_type', 'id_number', 'address', 'birthdate', 'blood_type', 'emergency_contact_name', 'emergency_contact_phone', 'professional_title', 'bio', 'linkedin_url', 'github_url', 'id_card_front_url', 'id_card_back_url']
}

export default function ProfileData() {
  const { user, loading } = useUser()
  const router = useRouter()
  const supabase = useSupabaseClient()
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
    github_url: '',
    id_card_front_url: '',
    id_card_back_url: '',
    blood_type: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
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
        github_url: user.github_url || '',
        id_card_front_url: user.id_card_front_url || '',
        id_card_back_url: user.id_card_back_url || '',
        blood_type: user.blood_type || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || ''
      })
    }
  }, [user])

  // Calcular completitud del perfil
  const completionPercentage = useMemo(() => {
    const requiredFilled = PROFILE_FIELDS.required.filter(f => formData[f as keyof typeof formData]?.trim()).length
    const optionalFilled = PROFILE_FIELDS.optional.filter(f => formData[f as keyof typeof formData]?.trim()).length
    return Math.round((requiredFilled / 3) * 60 + (optionalFilled / 13) * 40)
  }, [formData])

  // Extraer ciudad de la dirección (si existe)
  const city = useMemo(() => {
    if (!formData.address) return null
    // Intentar extraer ciudad (última parte después de la última coma, o todo si no hay comas)
    const parts = formData.address.split(',')
    return parts.length > 1 ? parts[parts.length - 1].trim() : null
  }, [formData.address])

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null

    try {
      const userId = user?.user_id || user?.id
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      let filePath = `profiles/${userId}/profile_image/${fileName}`
      
      // Intentar primero con el bucket 'image', si falla probar con 'activities' como fallback
      let uploadResult = await supabase.storage
        .from('image')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      let bucketUsed = 'image'
      
      // Si falla con RLS en 'image', intentar con 'activities' como fallback
      if (uploadResult.error && (
        uploadResult.error.message?.toLowerCase().includes('row-level security') ||
        uploadResult.error.message?.toLowerCase().includes('security policy') ||
        uploadResult.error.message?.toLowerCase().includes('403') ||
        uploadResult.error.message?.toLowerCase().includes('forbidden')
      )) {
        // Usar bucket 'activities' con el formato que funciona (assessments/)
        const altFilePath = `assessments/profile_${userId}_${fileName}`
        uploadResult = await supabase.storage
          .from('activities')
          .upload(altFilePath, file, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (!uploadResult.error) {
          bucketUsed = 'activities'
          filePath = altFilePath
        }
      }
      
      if (uploadResult.error) {
        throw uploadResult.error
      }

      // Obtener URL pública del bucket que funcionó
      const finalPath = uploadResult.data?.path || filePath
      const { data: { publicUrl } } = supabase.storage
        .from(bucketUsed)
        .getPublicUrl(finalPath)

      return publicUrl
    } catch (error: any) {
      throw error
    }
  }

  const uploadIDCardImage = async (file: File, side: 'front' | 'back'): Promise<string | null> => {
    if (!file) return null

    try {
      const userId = user?.user_id || user?.id
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${side}_${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      let filePath = `profiles/${userId}/id_cards/${fileName}`
      
      // Intentar primero con el bucket 'image', si falla probar con 'activities' como fallback
      let uploadResult = await supabase.storage
        .from('image')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      let bucketUsed = 'image'
      
      // Si falla con RLS en 'image', intentar con 'activities' como fallback
      if (uploadResult.error && (
        uploadResult.error.message?.toLowerCase().includes('row-level security') ||
        uploadResult.error.message?.toLowerCase().includes('security policy') ||
        uploadResult.error.message?.toLowerCase().includes('403') ||
        uploadResult.error.message?.toLowerCase().includes('forbidden')
      )) {
        // Usar bucket 'activities' con el formato que funciona
        const altFilePath = `cedula/id_card_${userId}_${side}_${fileName}`
        uploadResult = await supabase.storage
          .from('activities')
          .upload(altFilePath, file, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (!uploadResult.error) {
          bucketUsed = 'activities'
          filePath = altFilePath
        }
      }
      
      if (uploadResult.error) {
        throw uploadResult.error
      }

      // Obtener URL pública del bucket que funcionó
      const finalPath = uploadResult.data?.path || filePath
      const { data: { publicUrl } } = supabase.storage
        .from(bucketUsed)
        .getPublicUrl(finalPath)

      return publicUrl
    } catch (error: any) {
      throw error
    }
  }

  const handleIDCardUpload = async (side: 'front' | 'back', tempUrl: string) => {
    const response = await fetch(tempUrl)
    const blob = await response.blob()
    const ext = blob.type === 'application/pdf' ? 'pdf' : 'jpg'
    const file = new File([blob], `id_card_${side}.${ext}`, { type: blob.type })
    
    try {
      const publicUrl = await uploadIDCardImage(file, side)
      if (publicUrl) {
        await handleFieldSave(`id_card_${side}_url`, publicUrl)
      }
    } catch (error: unknown) {
      toast.error('Error al subir el archivo. Por favor, inténtalo de nuevo.')
    }
  }

  const handleIDCardDelete = async (side: 'front' | 'back') => {
    try {
      await handleFieldSave(`id_card_${side}_url`, '')
      toast.success('Imagen eliminada correctamente')
    } catch (error: any) {
      toast.error('Error al eliminar la imagen. Por favor, inténtalo de nuevo.')
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const publicUrl = await uploadImage(file)
      if (publicUrl) {
        await handleFieldSave('profile_image', publicUrl)
      }
    } catch (error: any) {
      toast.error('Error al subir la imagen. Por favor, inténtalo de nuevo.')
    }
  }

  // Guardar un campo individual
  const handleFieldSave = async (name: string, value: string) => {
    const userId = user?.user_id || user?.id
    
    if (!userId) {
      toast.error('No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.')
      return
    }

    try {
      const updateData: any = {
        [name]: value?.trim() || null,
        updated_at: new Date().toISOString()
      }

      const { error: updateError, data } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()

      if (updateError) {
        console.error('Error updating profile:', updateError)
        throw new Error(updateError.message || 'Error al guardar')
      }

      if (data && data[0]) {
        // Actualizar formData local
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
        
        // Refrescar datos del usuario
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error in handleFieldSave:', error)
      throw error
    }
  }

  // Validaciones
  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'El nombre es requerido'
    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
    return null
  }

  const validatePhone = (value: string): string | null => {
    if (!value.trim()) return 'El WhatsApp es requerido'
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      return 'Ingresa un número de WhatsApp válido (10 dígitos)'
    }
    return null
  }

  // Guardar teléfono limpiado (solo números)
  const handlePhoneSave = async (name: string, value: string) => {
    const cleaned = value.replace(/\D/g, '')
    await handleFieldSave(name, cleaned)
  }

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted dark:text-gray-400 text-sm">Cargando información del perfil...</p>
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
      {/* Header con progreso */}
      <ProfileHeader completionPercentage={completionPercentage} />

      {/* Profile Card */}
      <div className="bg-bg-card dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-xl border border-border-color dark:border-zinc-700/50 shadow-xl overflow-hidden">
        {/* Profile Image Section */}
        <div className="bg-gradient-to-r from-secondary/20 via-bg-secondary to-bg-secondary dark:via-zinc-800 dark:to-zinc-800 px-6 pt-8 pb-6 border-b border-border-color dark:border-transparent">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-border-color dark:border-white/10 shadow-xl ring-4 ring-secondary/20">
                <Image
                  width={160}
                  height={160}
                  src={formData.profile_image || '/man-avatar.png'}
                  alt={`${formData.first_name} ${formData.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-secondary hover:bg-blue-600 rounded-full shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-white mb-2">
                {formData.first_name && formData.last_name 
                  ? `${formData.first_name} ${formData.last_name}`
                  : 'Tu nombre'
                }
              </h3>
              {formData.professional_title && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-secondary">
                  <Briefcase className="w-5 h-5" />
                  <p className="text-lg font-medium">{formData.professional_title}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="p-6 space-y-6">
          {/* Sección Contacto - Siempre visible */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-secondary" />
              Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onSave={handleFieldSave}
                icon={<User className="w-4 h-4" />}
                placeholder="Ingresa tu nombre"
                validate={validateName}
              />
              <EditableField
                label="Apellidos"
                name="last_name"
                value={formData.last_name}
                onSave={handleFieldSave}
                icon={<User className="w-4 h-4" />}
                placeholder="Ingresa tus apellidos"
                validate={validateName}
              />
              <EditableField
                label="WhatsApp"
                name="phone"
                value={formData.phone}
                onSave={handlePhoneSave}
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                placeholder="Ej: 3001234567"
                validate={validatePhone}
              />
              <EditableField
                label="Email"
                name="email"
                value={formData.email}
                onSave={handleFieldSave}
                type="email"
                readonly
                icon={<Mail className="w-4 h-4" />}
              />
              <EditableField
                label="Tipo de sangre"
                name="blood_type"
                value={formData.blood_type}
                onSave={handleFieldSave}
                type="select"
                options={[
                  { value: '', label: 'Seleccionar...' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' }
                ]}
                icon={<Droplets className="w-4 h-4" />}
              />
              <EditableField
                label="Contacto de emergencia (nombre)"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onSave={handleFieldSave}
                icon={<AlertCircle className="w-4 h-4" />}
                placeholder="Nombre del contacto de emergencia"
              />
              <EditableField
                label="Contacto de emergencia (teléfono)"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onSave={handlePhoneSave}
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                placeholder="Ej: 3001234567"
              />
              {city && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    Ciudad
                  </label>
                  <div className="px-4 py-2 text-text-primary dark:text-white bg-bg-secondary dark:bg-gray-800/30 rounded-lg border border-border-color dark:border-gray-700/50 min-h-[42px] flex items-center">
                    {city}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accordion: Facturación y certificado */}
          <ProfileAccordion
            title="Facturación y certificado (opcional)"
            defaultOpen={false}
            icon={<IdCard className="w-5 h-5" />}
          >
            <div className="space-y-6 pt-2">
              {/* ID Card Upload */}
              <div className="space-y-4">
                <h4 className="text-text-primary dark:text-white font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-secondary" />
                  Fotos de identificación
                </h4>
                <p className="text-text-muted dark:text-gray-400 text-sm">
                  Sube las fotos del frente y reverso de tu documento de identificación para verificar tu cuenta.
                </p>
                <IDCardUpload
                  frontUrl={formData.id_card_front_url}
                  backUrl={formData.id_card_back_url}
                  onUpload={handleIDCardUpload}
                  onDelete={handleIDCardDelete}
                />
              </div>

              {/* Traditional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Tipo de documento"
                  name="id_type"
                  value={formData.id_type}
                  onSave={handleFieldSave}
                  type="select"
                  options={[
                    { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
                    { value: 'CE', label: 'Cédula de Extranjería (CE)' },
                    { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
                    { value: 'PASAPORTE', label: 'Pasaporte' }
                  ]}
                  icon={<IdCard className="w-4 h-4" />}
                />
                <EditableField
                  label="Número de documento"
                  name="id_number"
                  value={formData.id_number}
                  onSave={handleFieldSave}
                  icon={<IdCard className="w-4 h-4" />}
                  placeholder="Ej: 1234567890"
                />
                <EditableField
                  label="Dirección completa"
                  name="address"
                  value={formData.address}
                  onSave={handleFieldSave}
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="Ej: Calle 123 #45-67, Barranquilla"
                />
                <EditableField
                  label="Fecha de nacimiento"
                  name="birthdate"
                  value={formData.birthdate}
                  onSave={handleFieldSave}
                  type="date"
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          </ProfileAccordion>

          {/* Accordion: Perfil profesional */}
          <ProfileAccordion
            title="Perfil profesional (opcional)"
            defaultOpen={false}
            icon={<Briefcase className="w-5 h-5" />}
          >
            <div className="space-y-4 pt-2">
              <EditableField
                label="Título profesional"
                name="professional_title"
                value={formData.professional_title}
                onSave={handleFieldSave}
                icon={<Briefcase className="w-4 h-4" />}
                placeholder="Ej: Desarrollador Full Stack"
              />
              <EditableField
                label="Biografía"
                name="bio"
                value={formData.bio}
                onSave={handleFieldSave}
                type="textarea"
                icon={<FileText className="w-4 h-4" />}
                placeholder="Cuéntanos sobre ti, tu experiencia y tus intereses..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="LinkedIn"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onSave={handleFieldSave}
                  icon={<Linkedin className="w-4 h-4 text-blue-500" />}
                  placeholder="https://linkedin.com/in/tu-perfil"
                />
                <EditableField
                  label="GitHub"
                  name="github_url"
                  value={formData.github_url}
                  onSave={handleFieldSave}
                  icon={<Github className="w-4 h-4 text-gray-300" />}
                  placeholder="https://github.com/tu-usuario"
                />
                <EditableField
                  label="Twitter / X"
                  name="twitter_url"
                  value={formData.twitter_url}
                  onSave={handleFieldSave}
                  icon={<Twitter className="w-4 h-4 text-blue-400" />}
                  placeholder="https://twitter.com/tu-usuario"
                />
                <EditableField
                  label="Instagram"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onSave={handleFieldSave}
                  icon={<Instagram className="w-4 h-4 text-pink-500" />}
                  placeholder="https://instagram.com/tu-usuario"
                />
              </div>
            </div>
          </ProfileAccordion>
        </div>
      </div>
    </section>
  )
}
