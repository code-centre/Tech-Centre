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
    <aside className="hidden lg:block w-80 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-r border-zinc-700/50 shadow-xl min-h-[calc(100vh-5rem)] sticky top-20 rounded-lg mr-6">
      {/* User Profile Header */}
      <div className="p-6 border-b border-zinc-700/50">
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
                <div className="w-full h-full bg-linear-to-br from-secondary to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.first_name || user?.email || 'Usuario'}
            </h2>
            {user?.professional_title && (
              <p className="text-sm text-gray-400 truncate">{user.professional_title}</p>
            )}
            <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon
          const sectionPath = `/perfil/${section.id}`
          const isActive = pathname === sectionPath || activeSection === section.id
          
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
                    ? 'bg-linear-to-r from-secondary/20 to-secondary/10 text-secondary shadow-lg shadow-secondary/10 border border-secondary/30'
                    : 'text-gray-300 hover:text-white hover:bg-zinc-800/50 border border-transparent'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-r-full"></div>
              )}
              
              {/* Icon */}
              <div className={`
                flex items-center justify-center transition-transform duration-200
                ${isActive ? 'scale-110' : 'group-hover:scale-110'}
              `}>
                <Icon 
                  size={20} 
                  className={isActive ? 'text-secondary' : 'text-gray-400 group-hover:text-secondary'}
                />
              </div>
              
              {/* Label */}
              <span className={`
                flex-1 text-left transition-colors duration-200
                ${isActive ? 'font-semibold' : 'font-medium'}
              `}>
              {section.label}
              </span>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-linear-to-r from-secondary/0 to-secondary/0 group-hover:from-secondary/5 group-hover:to-transparent transition-all duration-200 rounded-lg"></div>
            </Link>
          )
        })}
      </nav>

      {/* Footer decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent"></div>
    </aside>
  )
}
