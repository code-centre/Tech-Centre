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
export const Sidebar = ({ activeSection, onSectionChange, sections }: SidebarProps) => {
  const { user } = useUserStore()


  return (
    <aside className="hidden lg:block w-80 bg-bgCard shadow-lg min-h-screen left-0 top-0">
      <div className="p-4 pt-6">
        <h2 className="text-xl font-semibold text-white border-b pb-2 pt-5 border-dashed">Mi Perfil</h2>
      </div>
      <nav className="px-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mb-1 ${activeSection === section.id ? 'bg-zinc-900 text-blueApp' : 'text-white hover:bg-gray-50 hover:text-blueApp'}`}
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
