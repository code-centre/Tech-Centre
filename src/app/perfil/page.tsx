'use client'
import ProfileData from '@/components/profile/ProfileData'
// import ProfileEvents from '@/components/profile/ProfileEvents'
import { Sidebar } from '@/components/profile/Sidebar'
import { CalendarIcon, UserIcon, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useUser } from '@/lib/supabase';
import InstructorPanel from '@/components/profile/InstructorPanel'
import ProfileCursosMatriculados from '@/components/profile/ProfileCursosMatriculados'

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [activeSection, setActiveSection] = useState('cursos')
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no hay usuario
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/')
    }
  }, [user, loading, router, isRedirecting])

  // Mostrar loader mientras carga o mientras redirige
  if (loading || isRedirecting) {
    return (
      <div className="flex items-center justify-center mt-20 h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blueApp border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario después de cargar, no mostrar nada (ya se está redirigiendo)
  if (!user) {
    return null
  }

  const sections = [
    {
      id: 'profile',
      label: 'Mis datos',
      icon: UserIcon,
    },
    {
      id: 'cursos',
      label: 'Mis cursos',
      icon: CalendarIcon,
    },
    {
      id: 'instructor',
      label: 'Instruidos',
      icon: GraduationCap,
    },
  ]


  return (
    <main className='min-h-screen flex flex-col lg:flex-row mt-20 px-6 max-w-7xl mx-auto'>
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <section>
        <nav className="flex mt-5 md:mt-10 mx-5 border-b pb-4 border-dashed gap-3 border-gray-200 lg:hidden">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-2 gap-3 py-2 rounded-md text-sm font-medium mb-2 ${activeSection === section.id ? 'bg-blue-50 text-blueApp' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon size={20} />
                {section.label}
              </button>
            )
          })}
        </nav>
      </section>


      <div className="w-full flex-1 mx-auto p-6">
        {activeSection === 'profile' ? (
          <ProfileData />
        ) : activeSection === 'cursos' ? (
          <ProfileCursosMatriculados user={user} />
        ) : activeSection === 'instructor' && user?.role === 'instructor' || user?.role === 'admin' ? (
          <div>
            <InstructorPanel />
          </div>
        ) : (
          <p className="text-blueApp">No tienes acceso a esta sección</p>
        )}
      </div>
    </main>
  )
}
