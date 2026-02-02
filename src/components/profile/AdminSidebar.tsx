' use client'
import React from 'react'
import { UserIcon, CalendarIcon, UserCogIcon } from 'lucide-react'
import useUserStore from '../../../store/useUserStore'

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
export const AdminSidebar = ({ activeSection, onSectionChange, sections }: SidebarProps) => {
  const { user } = useUserStore()


  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen left-0 top-0">
      <div className="p-4 pt-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 border-dashed">Panel Administrativo</h2>
      </div>
      <nav className="px-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mb-1 ${activeSection === section.id ? 'bg-blue-50 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon size={20} />
              {section.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
