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
        // Usar push en lugar de replace para mantener el historial
        router.push('/perfil/datos-personales')
      }
    }
  }, [user, loading, router])

  // Mostrar loader mientras redirige
  return (
    <div className="flex items-center justify-center mt-20 h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </div>
  )
}
