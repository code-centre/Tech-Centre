'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/supabase'

interface Section {
  id: string
  label: string
  icon: any
}

type SidebarProps = {
  activeSection: string
  onSectionChange: (section: string) => void
  sections: Section[]
}

export const Sidebar = ({ activeSection, onSectionChange, sections }: SidebarProps) => {
  const { user } = useUser()
  const pathname = usePathname()

  if (!user) {
    return null
  }

  return (
    <aside className="w-64 bg-[var(--card-background)] border border-border-color rounded-xl shadow-lg min-h-[calc(100vh-8rem)] sticky top-24 overflow-hidden">
      {/* User Profile Header */}
      <div className="p-6 border-b border-border-color">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary/50 shadow-lg ring-2 ring-secondary/20">
              {user?.profile_image ? (
                <Image
                  src={user.profile_image}
                  alt={user.first_name || 'Usuario'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[var(--card-background)] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary truncate">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.first_name || user?.email || 'Usuario'}
            </h2>
            {user?.professional_title && (
              <p className="text-sm text-text-muted truncate">{user.professional_title}</p>
            )}
            <p className="text-xs text-text-muted truncate mt-1 opacity-80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon
          const sectionPath = `/perfil/${section.id}`
          const isActive = pathname === sectionPath || pathname?.startsWith(sectionPath + '/') || activeSection === section.id
          
          return (
            <Link
              key={section.id}
              href={sectionPath}
              onClick={() => onSectionChange(section.id)}
              scroll={false}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200 ease-in-out
                relative overflow-hidden group
                ${
                  isActive
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-transparent'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-r-full" />
              )}
              <Icon
                size={20}
                className={isActive ? 'text-secondary' : 'text-text-muted group-hover:text-secondary'}
              />
              <span className={`
                flex-1 text-left transition-colors duration-200
                ${isActive ? 'font-semibold' : 'font-medium'}
              `}>
              {section.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
