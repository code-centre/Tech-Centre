'use client'
import { Sidebar } from '@/components/profile/Sidebar'
import { CalendarIcon, UserIcon, Receipt, GraduationCap, Wallet, Home, SlidersHorizontal } from 'lucide-react'
import { useProfileBadges } from '@/components/profile/useProfileBadges'
import type { Section } from '@/components/profile/Sidebar'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@/lib/supabase'

const validSections = ['resumen', 'datos-personales', 'cursos', 'facturas', 'instructor', 'honorarios']

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const pathname = usePathname()
  
  // Extraer la sección activa de la URL
  const sectionMatch = pathname?.match(/\/perfil\/([^/]+)/)
  const sectionParam = sectionMatch ? sectionMatch[1] : 'resumen'
  const activeSection = validSections.includes(sectionParam) ? sectionParam : 'resumen'
  const badges = useProfileBadges(user)

  // El menú se arma según quién entra: cada perfil ve sólo lo suyo, y lo que
  // está pendiente se avisa aquí para no tener que entrar a descubrirlo.
  const role = user?.role ?? 'student'
  const isStaff = ['admin', 'instructor'].includes(role)
  const isAdmin = role === 'admin'

  const sections: Section[] = [{ id: 'resumen', label: 'Resumen', icon: Home }]

  if (isAdmin) {
    sections.push({
      id: 'admin',
      label: 'Administración',
      icon: SlidersHorizontal,
      href: '/admin',
    })
  }

  if (isStaff) {
    sections.push(
      {
        id: 'instructor',
        label: 'Mis cohortes',
        icon: GraduationCap,
        badge: badges.pendingRolls,
        badgeTone: 'warn',
      },
      // «Honorarios» y no «Mis pagos» a propósito: si además está matriculado,
      // ya tiene una sección con ese nombre para lo que él debe.
      { id: 'honorarios', label: 'Mis honorarios', icon: Wallet }
    )
  }

  if (!isAdmin) {
    sections.push(
      { id: 'cursos', label: 'Mis cursos', icon: CalendarIcon },
      {
        id: 'facturas',
        label: 'Mis pagos',
        icon: Receipt,
        badge: badges.overdueInvoices,
        badgeTone: 'alert',
      }
    )
  }

  sections.push({
    id: 'datos-personales',
    label: 'Mis datos',
    icon: UserIcon,
    badge: badges.missingProfile,
    badgeTone: 'warn',
  })

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

