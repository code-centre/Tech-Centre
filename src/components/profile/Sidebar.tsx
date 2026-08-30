'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { useUser } from '@/lib/supabase'

export interface Section {
  id: string
  label: string
  icon: React.ElementType
  /** Cuántas cosas pendientes hay en esa sección; 0 no pinta nada. */
  badge?: number
  /** Ámbar para lo que conviene resolver, rojo para lo que ya se pasó. */
  badgeTone?: 'warn' | 'alert'
  /** Sale del perfil: el admin salta a su panel. */
  href?: string
}

type SidebarProps = {
  activeSection: string
  onSectionChange: (section: string) => void
  sections: Section[]
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  instructor: 'Instructor',
  student: 'Estudiante',
  lead: 'Lead',
}

const ROLE_COLOR: Record<string, string> = {
  admin: 'var(--pay-aviso)',
  instructor: 'var(--pay-serie-porcobrar)',
  student: 'var(--pay-serie-cobrado)',
  lead: 'var(--pay-neutro)',
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '··'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const Sidebar = ({ activeSection, onSectionChange, sections }: SidebarProps) => {
  const { user } = useUser()
  const pathname = usePathname()

  if (!user) return null

  const fullName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.email || 'Usuario'
  const role = user.role ?? 'student'
  const roleColor = ROLE_COLOR[role] ?? 'var(--pay-neutro)'

  return (
    <aside className="sticky top-24 w-64 overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
      <div className="flex items-center gap-3 border-b border-border-color px-4 py-[18px]">
        {user.profile_image ? (
          <Image
            src={user.profile_image}
            alt={fullName}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold"
            style={{
              background: `color-mix(in srgb, ${roleColor} 14%, transparent)`,
              color: roleColor,
            }}
          >
            {initialsOf(fullName)}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="truncate text-[14.5px] font-semibold text-text-primary">{fullName}</span>
          <span
            className="inline-flex h-5 w-fit items-center rounded-full px-2 text-[11px] font-semibold"
            style={{
              background: `color-mix(in srgb, ${roleColor} 14%, transparent)`,
              color: roleColor,
            }}
          >
            {ROLE_LABEL[role] ?? role}
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-2.5">
        {sections.map((section) => {
          const Icon = section.icon
          const href = section.href ?? `/perfil/${section.id}`
          const isExternal = Boolean(section.href)
          const isActive =
            !isExternal &&
            (pathname === href || pathname?.startsWith(`${href}/`) || activeSection === section.id)
          const badgeColor =
            section.badgeTone === 'alert' ? 'var(--pay-critico)' : 'var(--pay-aviso)'

          return (
            <Link
              key={section.id}
              href={href}
              onClick={() => onSectionChange(section.id)}
              scroll={false}
              className={`flex items-center gap-3 rounded-[9px] border px-3.5 py-[11px] text-sm transition-colors ${
                isActive
                  ? 'border-secondary/30 bg-secondary/12 font-semibold text-secondary'
                  : 'border-transparent font-medium text-text-muted hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span className="grow truncate">{section.label}</span>
              {section.badge ? (
                <span
                  className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-[#0E1116]"
                  style={{ background: badgeColor }}
                >
                  {section.badge}
                </span>
              ) : isExternal ? (
                <ExternalLink size={15} className="shrink-0 text-text-muted/70" />
              ) : null}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
