'use client'
import AdminUsers from '@/components/profile/AdminUsers'
import ProfileData from '@/components/profile/ProfileData'
// import ProfileEvents from '@/components/profile/ProfileEvents'
import { Sidebar } from '@/components/profile/Sidebar'
import { CalendarIcon, UserCogIcon, UserIcon, GraduationCap } from 'lucide-react'
import ProfileCourses from '@/components/profile/ProfileCourses'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useUser } from '@/lib/supabase';
import InstructorPanel from '@/components/profile/InstructorPanel'
import ProfileCursosMatriculados from '@/components/profile/ProfileCursosMatriculados'

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [activeSection, setActiveSection] = useState('profile')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center mt-20 h-screen">Cargando...</div>
  }

  if (!user) {
    return null
  }

  console.log('User object:', user);

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
    <main className='min-h-screen pt-10 flex flex-col lg:flex-row mt-20'>
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <section>
        <nav className="flex mt-5 md:mt-10  mx-5 border-b pb-4 border-dashed gap-3 border-gray-200 lg:hidden">
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


      <div className="container w-full flex-1 mx-auto p-6 md:py-12">
      {activeSection === 'profile' ? (
        <ProfileData />
      ) : activeSection === 'cursos' ? (
        user?.role === 'student' ? (
          <ProfileCursosMatriculados user={user} />
        ) : (
          <p className="text-gray-500">No te has matriculado en ningún curso</p>
        )
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
