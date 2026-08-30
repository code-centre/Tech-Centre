'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    // Redirigir a la sección de cursos por defecto sin recargar
    if (!loading) {
      if (!user) {
        router.push('/')
      } else {
        // El perfil abre en lo que sigue, no en un formulario.
        router.push('/perfil/resumen')
      }
    }
  }, [user, loading, router])

  // Mostrar loader mientras redirige
  return (
    <div className="flex items-center justify-center mt-20 h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm">Cargando...</p>
      </div>
    </div>
  )
}
