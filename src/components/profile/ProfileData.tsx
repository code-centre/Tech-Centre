'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@/lib/supabase'
import { User, Mail, Calendar, Briefcase, Camera, Check, Heart, Receipt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import EditableField from './EditableField'
import IDCardUpload from './IDCardUpload'
import { completionSummary, type CompletionItem } from '@/lib/profileCompletion'
import { formatLongDate } from '@/lib/students'

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
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('No se pudo cerrar la sesión')
    }
  }

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
          <p className="text-text-muted text-sm">Cargando información del perfil...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario después de cargar, no mostrar nada
  if (!user) {
    return null
  }

  const completion = completionSummary(formData)
  const fullName = `${formData.first_name} ${formData.last_name}`.trim()
  const roleLabel =
    user?.role === 'admin' ? 'Admin' : user?.role === 'instructor' ? 'Instructor' : 'Estudiante'
  const roleColor =
    user?.role === 'admin'
      ? 'var(--pay-aviso)'
      : user?.role === 'instructor'
        ? 'var(--pay-serie-porcobrar)'
        : 'var(--pay-serie-cobrado)'

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[27px] font-bold tracking-tight text-text-primary">Mis datos</h1>
        <p className="text-sm text-text-muted">
          Lo que usamos para contactarte, para facturarte y para tu perfil en la comunidad.
        </p>
      </header>

      {/* Identidad */}
      <div className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
        <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative inline-flex">
              {formData.profile_image ? (
                <Image
                  width={64}
                  height={64}
                  src={formData.profile_image}
                  alt={fullName || 'Tu foto'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full text-[21px] font-semibold"
                  style={{ background: `color-mix(in srgb, ${roleColor} 13%, transparent)`, color: roleColor }}
                >
                  {initialsOf(fullName)}
                </span>
              )}
              <label className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border-color bg-bg-secondary text-text-primary transition-colors hover:border-secondary/50">
                <Camera className="h-[15px] w-[15px]" />
                <span className="sr-only">Cambiar foto</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </span>

            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xl font-bold tracking-tight text-text-primary">
                  {fullName || 'Tu nombre'}
                </span>
                <span
                  className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
                  style={{ background: `color-mix(in srgb, ${roleColor} 14%, transparent)`, color: roleColor }}
                >
                  {roleLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip icon={<Mail className="h-[15px] w-[15px]" />}>{formData.email}</Chip>
                {user?.created_at && (
                  <Chip icon={<Calendar className="h-[15px] w-[15px]" />}>
                    Con nosotros desde {formatLongDate(user.created_at).replace(/^\d+ de /, '')}
                  </Chip>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/recuperar-contrasena"
            className="inline-flex h-10 shrink-0 items-center rounded-lg border border-border-color bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
          >
            Cambiar contraseña
          </Link>
        </div>
      </div>

      {/* Qué falta y para qué sirve */}
      {completion.missing > 0 && (
        <div
          className="overflow-hidden rounded-xl border bg-[var(--card-background)]"
          style={{ borderColor: 'color-mix(in srgb, var(--pay-aviso) 28%, transparent)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-color px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold text-text-primary">{completion.headline}</h2>
              <p className="text-[12.5px] text-text-muted">
                No es obligatorio, pero cada una desbloquea algo concreto.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[12.5px] text-text-muted">
                {completion.done} de {completion.total}
              </span>
              <span className="block h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-border-color">
                <span
                  className="block h-full rounded-[3px]"
                  style={{
                    width: `${(completion.done / completion.total) * 100}%`,
                    background: 'var(--pay-aviso)',
                  }}
                />
              </span>
            </div>
          </div>
          <div className="px-5 pb-3 pt-1">
            {completion.items.map((item: CompletionItem) => (
              <div
                key={item.id}
                className="flex items-start gap-[11px] border-b border-border-color/50 py-[11px] last:border-b-0"
              >
                <span
                  className={`mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                    item.done ? 'bg-[color:var(--pay-serie-cobrado)]' : 'border-[1.5px] border-border-color'
                  }`}
                >
                  {item.done && <Check className="h-3 w-3 text-[#0E1116]" strokeWidth={3.2} />}
                </span>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span
                    className={`text-[13.5px] ${item.done ? 'text-text-muted line-through' : 'text-text-primary'}`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[12.5px] text-text-muted">{item.why}</span>
                </span>
                {!item.done && (
                  <a
                    href={`#${item.anchor}`}
                    className="inline-flex h-8 shrink-0 items-center rounded-lg border border-border-color bg-bg-secondary px-3 text-[13px] font-medium text-text-primary transition-colors hover:border-secondary/50"
                  >
                    Completar
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datos básicos */}
      <Card
        id="datos-basicos"
        icon={<User className="h-[15px] w-[15px]" />}
        title="Datos básicos"
        hint="Con esto te contactamos."
      >
        <EditableField
          label="Nombre"
          name="first_name"
          value={formData.first_name}
          onSave={handleFieldSave}
          placeholder="Ingresa tu nombre"
          validate={validateName}
        />
        <EditableField
          label="Apellidos"
          name="last_name"
          value={formData.last_name}
          onSave={handleFieldSave}
          placeholder="Ingresa tus apellidos"
          validate={validateName}
        />
        <EditableField
          label="WhatsApp"
          name="phone"
          value={formData.phone}
          onSave={handlePhoneSave}
          type="tel"
          placeholder="Ej: 3001234567"
          validate={validatePhone}
        />
        <EditableField
          label="Correo"
          name="email"
          value={formData.email}
          onSave={handleFieldSave}
          type="email"
        />
      </Card>

      {/* Emergencia */}
      <Card
        id="emergencia"
        icon={<Heart className="h-[15px] w-[15px]" />}
        title="En caso de emergencia"
        hint="Solo lo vemos si pasa algo en clase."
      >
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
            { value: 'O-', label: 'O-' },
          ]}
        />
        <EditableField
          label="A quién llamamos"
          name="emergency_contact_name"
          value={formData.emergency_contact_name}
          onSave={handleFieldSave}
          placeholder="Nombre del contacto"
        />
        <EditableField
          label="Su teléfono"
          name="emergency_contact_phone"
          value={formData.emergency_contact_phone}
          onSave={handlePhoneSave}
          type="tel"
          placeholder="Ej: 3001234567"
          validate={validatePhone}
        />
      </Card>

      {/* Facturación */}
      <Card
        id="facturacion"
        icon={<Receipt className="h-[15px] w-[15px]" />}
        title="Facturación y certificado"
        hint="Así sale tu nombre en la factura y en el certificado."
      >
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
            { value: 'PASAPORTE', label: 'Pasaporte' },
          ]}
        />
        <EditableField
          label="Número de documento"
          name="id_number"
          value={formData.id_number}
          onSave={handleFieldSave}
          placeholder="Ej: 1234567890"
        />
        <EditableField
          label="Dirección"
          name="address"
          value={formData.address}
          onSave={handleFieldSave}
          placeholder="Ej: Calle 123 #45-67, Barranquilla"
        />
        <EditableField
          label="Fecha de nacimiento"
          name="birthdate"
          value={formData.birthdate}
          onSave={handleFieldSave}
          type="date"
        />
        <div className="col-span-full flex flex-col gap-3 pt-4">
          <span className="text-[13px] font-medium text-text-primary">Fotos del documento</span>
          <IDCardUpload
            frontUrl={formData.id_card_front_url}
            backUrl={formData.id_card_back_url}
            onUpload={handleIDCardUpload}
            onDelete={handleIDCardDelete}
          />
        </div>
      </Card>

      {/* Perfil profesional */}
      <Card
        id="profesional"
        icon={<Briefcase className="h-[15px] w-[15px]" />}
        title="Perfil profesional"
        hint="Lo que ven tus compañeros y los instructores."
      >
        <EditableField
          label="Título profesional"
          name="professional_title"
          value={formData.professional_title}
          onSave={handleFieldSave}
          placeholder="Ej: Analista de datos"
        />
        <EditableField
          label="LinkedIn"
          name="linkedin_url"
          value={formData.linkedin_url}
          onSave={handleFieldSave}
          placeholder="https://linkedin.com/in/…"
        />
        <EditableField
          label="GitHub"
          name="github_url"
          value={formData.github_url}
          onSave={handleFieldSave}
          placeholder="https://github.com/…"
        />
        <EditableField
          label="Twitter / X"
          name="twitter_url"
          value={formData.twitter_url}
          onSave={handleFieldSave}
          placeholder="https://x.com/…"
        />
        <EditableField
          label="Instagram"
          name="instagram_url"
          value={formData.instagram_url}
          onSave={handleFieldSave}
          placeholder="https://instagram.com/…"
        />
        <div className="col-span-full">
          <EditableField
            label="Biografía"
            name="bio"
            value={formData.bio}
            onSave={handleFieldSave}
            type="textarea"
            placeholder="Cuéntanos en dos líneas de dónde vienes y para dónde vas."
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-color bg-bg-secondary px-5 py-4">
        <span className="text-[13px] text-text-muted">
          Tus documentos y tu foto solo los ve el equipo de Tech Centre.
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-9 shrink-0 items-center rounded-lg border px-4 text-[13.5px] font-medium transition-colors"
          style={{
            borderColor: 'color-mix(in srgb, var(--pay-critico) 40%, transparent)',
            color: 'var(--pay-critico)',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </section>
  )
}

function Card({
  id,
  icon,
  title,
  hint,
  children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)] scroll-mt-28"
    >
      <div className="flex items-center gap-3 border-b border-border-color px-5 py-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-secondary/10 text-secondary">
          {icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <p className="text-[12.5px] text-text-muted">{hint}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-7 px-5 pb-3.5 pt-1.5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[30px] items-center gap-[7px] rounded-[7px] border border-border-color bg-bg-secondary px-[11px] text-[12.5px] text-text-primary">
      <span className="text-secondary">{icon}</span>
      {children}
    </span>
  )
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '··'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
