'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Users, FileText, UserCog, Shield, Newspaper, CalendarDays } from 'lucide-react';
import { useUser } from '@/lib/supabase';

const allNavItems = [
  { href: '/admin/cohortes', label: 'Cohortes', icon: CalendarDays, adminOnly: true },
  { href: '/admin/pagos', label: 'Pagos', icon: FileText, adminOnly: true },
  { href: '/admin/estudiantes', label: 'Estudiantes', icon: Users, adminOnly: true },
  { href: '/admin/programas', label: 'Programas', icon: GraduationCap, adminOnly: true },
  { href: '/admin/instructores', label: 'Instructores', icon: UserCog, adminOnly: true },
  { href: '/admin/admins', label: 'Admins', icon: Shield, adminOnly: true },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper, adminOnly: false },
];

export default function AdminSidenav() {
  const pathname = usePathname();
  const { user } = useUser();
  const isInstructor = user?.role === 'instructor';
  const navItems = isInstructor
    ? allNavItems.filter((item) => !item.adminOnly)
    : allNavItems;

  return (
    <aside className="hidden lg:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] z-30 bg-[var(--card-background)] border-r border-border-color shadow-xl overflow-hidden overflow-y-auto">
      <div className="p-4 border-b border-border-color">
        <h2 className="text-lg font-semibold text-text-primary">Administración</h2>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200 ease-in-out relative overflow-hidden group
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
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
