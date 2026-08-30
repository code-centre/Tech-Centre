'use client'
import ProfileData from '@/components/profile/ProfileData'
import PaymentReceiptsManager from '@/components/profile/PaymentReceiptsManager'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useUser } from '@/lib/supabase'
import ProfileCursosMatriculados from '@/components/profile/ProfileCursosMatriculados'
import InstructorPayments from '@/components/profile/InstructorPayments'
import ProfileSummary from '@/components/profile/ProfileSummary'

const validSections = ['resumen', 'datos-personales', 'cursos', 'facturas', 'honorarios']

export default function ProfileSectionPage() {
  const { user, loading } = useUser();
  const params = useParams()
  const router = useRouter()
  
  const sectionParam = params?.section as string
  const activeSection = validSections.includes(sectionParam) ? sectionParam : 'resumen'

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no hay usuario
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Si la sección no es válida, redirigir a cursos sin recargar
    if (sectionParam && !validSections.includes(sectionParam)) {
      router.push('/perfil/resumen')
    }
  }, [sectionParam, router])

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario después de cargar, no mostrar nada (ya se está redirigiendo)
  if (!user) {
    return null
  }

  // Solo renderizar el contenido específico de la sección
  return (
    <>
      {activeSection === 'resumen' ? (
        <ProfileSummary />
      ) : activeSection === 'datos-personales' ? (
        <ProfileData />
      ) : activeSection === 'cursos' ? (
        <ProfileCursosMatriculados user={user} />
      ) : activeSection === 'facturas' ? (
        <PaymentReceiptsManager />
      ) : activeSection === 'honorarios' ? (
        ['admin', 'instructor'].includes(user.role) ? (
          <InstructorPayments />
        ) : (
          <p className="text-secondary">No tienes acceso a esta sección</p>
        )
      ) : (
        <p className="text-secondary">No tienes acceso a esta sección</p>
      )}
    </>
  )
}
