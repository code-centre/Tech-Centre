'use client'
import { Sidebar } from '@/components/profile/Sidebar'
import { CalendarIcon, UserIcon, Receipt } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@/lib/supabase'

const validSections = ['datos-personales', 'cursos', 'facturas']

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
    { id: 'datos-personales', label: 'Mis datos', icon: UserIcon },
    { id: 'cursos', label: 'Mis cursos', icon: CalendarIcon },
    { id: 'facturas', label: 'Facturas', icon: Receipt },
  ]

  const handleSectionChange = (sectionId: string) => {
    // Esta función se pasa al Sidebar pero no se usa porque los Links manejan la navegación
  }

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center pt-24 min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (la página manejará la redirección)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row pt-24 bg-bg-primary">
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:pl-6">
        <Sidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>

      <section className="lg:hidden px-6">
        <nav className="flex mt-5 md:mt-10 border-b pb-4 border-dashed gap-3 border-border-color">
          {sections.map((section) => {
            const Icon = section.icon
            const sectionPath = `/perfil/${section.id}`
            return (
              <Link
                key={section.id}
                href={sectionPath}
                scroll={false}
                prefetch={true}
                className={`w-full flex items-center px-2 gap-3 py-2 rounded-md text-sm font-medium mb-2 transition-colors ${activeSection === section.id ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'text-text-muted hover:bg-bg-secondary hover:text-text-primary border border-transparent'}`}
              >
                <Icon size={20} />
                {section.label}
              </Link>
            )
          })}
        </nav>
      </section>

      <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {children}
      </div>
    </main>
  )
}

