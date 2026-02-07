'use client'
import { Sidebar } from '@/components/profile/Sidebar'
import { CalendarIcon, UserIcon, GraduationCap, Receipt } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@/lib/supabase'

const validSections = ['datos-personales', 'cursos', 'instructor', 'facturas']

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const pathname = usePathname()
  
  // Extraer la sección activa de la URL
  const sectionMatch = pathname?.match(/\/perfil\/([^/]+)/)
  const sectionParam = sectionMatch ? sectionMatch[1] : 'cursos'
  const activeSection = validSections.includes(sectionParam) ? sectionParam : 'cursos'

  const sections = [
    {
      id: 'datos-personales',
      label: 'Mis datos',
      icon: UserIcon,
    },
    {
      id: 'cursos',
      label: 'Mis cursos',
      icon: CalendarIcon,
    },
    {
      id: 'facturas',
      label: 'Facturas',
      icon: Receipt,
    }
  ]

  const handleSectionChange = (sectionId: string) => {
    // Esta función se pasa al Sidebar pero no se usa porque los Links manejan la navegación
  }

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center mt-20 h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (la página manejará la redirección)
  if (!user) {
    return null
  }

  return (
    <main className='min-h-screen flex flex-col lg:flex-row mt-20 px-6 max-w-7xl mx-auto'>
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <section>
        <nav className="flex mt-5 md:mt-10 mx-5 border-b pb-4 border-dashed gap-3 border-gray-200 lg:hidden">
          {sections.map((section) => {
            const Icon = section.icon
            const sectionPath = `/perfil/${section.id}`
            return (
              <Link
                key={section.id}
                href={sectionPath}
                scroll={false}
                prefetch={true}
                className={`w-full flex items-center px-2 gap-3 py-2 rounded-md text-sm font-medium mb-2 ${activeSection === section.id ? 'bg-blue-50 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon size={20} />
                {section.label}
              </Link>
            )
          })}
        </nav>
      </section>

      <div className="w-full flex-1 mx-auto p-6">
        {children}
      </div>
    </main>
  )
}

