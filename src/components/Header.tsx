"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronDown, Menu, X, User as UserIcon, LogOut, Users, FileText, GraduationCap, Newspaper, CalendarDays, UserCog, Shield } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@/lib/supabase'
import ProgramQuery from "./ProgramQuery"
import { ThemeToggle } from "./ThemeToggle"
import type { Program } from '@/types/programs'

export default function Header() {
  const { user, loading: loadingUser } = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [supabasePrograms, setSupabasePrograms] = useState<Program[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleProgramsLoaded = useCallback((programs: Program[]) => {
    setSupabasePrograms(programs)
  }, [])

  const handleSignOut = async () => {
    console.log('Cerrando sesión')
    try {
      await supabase.auth.signOut()
      console.log('Cerrando sesión exitosamente')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Click outside handler for mobile menu
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false)
      setMobileDropdown(null)
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen || mobileDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchstart", handleClickOutside)
      }
    }
  }, [isMenuOpen, mobileDropdown, handleClickOutside])

  const toggleMobileDropdown = (dropdown: string) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown)
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0E1116]/80 backdrop-blur-sm shadow-lg border-b border-[#374151]">
      <ProgramQuery onProgramsLoaded={handleProgramsLoaded} />

      <div className="max-w-7xl mx-auto container px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/tech-center-logos/logo-primary-extendido.png"
              alt="Logo de Tech-Centre"
              width={160}
              height={40}
              className="hover:animate-pulse hover:animate-once hover:animate-duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12 text-lg">
            {/* Programas Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-[#2FB7C4] 
                font-medium transition-all duration-200 group cursor-pointer"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-[#2FB7C4] after:transition-all group-hover:after:w-full"
                >
                  Programas
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div
                className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
                absolute top-full left-0 mt-2 w-80 bg-[#0E1116] backdrop-blur-md rounded-xl 
                shadow-lg border border-[#374151] py-3 transition-all duration-200"
              >
                <div className="px-4 py-2">
                  <Link
                    href="/programas-academicos"
                    className="block px-3 py-2 text-sm font-medium text-[#2FB7C4] hover:bg-[#1A1F2E] 
                      rounded-md transition-all duration-200 mb-2 border-b border-[#374151]"
                  >
                    Oferta académica
                  </Link>
                  <div
                    className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin 
                    scrollbar-thumb-secondary/20 hover:scrollbar-thumb-secondary/40"
                  >
                    {supabasePrograms.map((program) => (
                      <Link
                        key={program.id}
                        href={`/programas-academicos/${program.code}`}
                        className="block px-3 py-2 text-sm text-white hover:bg-[#1A1F2E] 
                          hover:text-[#2FB7C4] rounded-md transition-all duration-200 animate-fade-in-up"
                      >
                        {program.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/blog"
              className="flex items-center space-x-2 text-white hover:text-[#2FB7C4] 
              font-medium transition-all duration-200 group"
            >
              <span
                className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                after:w-0 after:bg-[#2FB7C4] after:transition-all group-hover:after:w-full"
              >
                Blog
              </span>
            </Link>

            <div className="relative group">
              <a
                href="https://www.codigoabierto.tech/eventos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white hover:text-[#2FB7C4] 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-[#2FB7C4] after:transition-all group-hover:after:w-full"
                >
                  Comunidad
                </span>
              </a>
            </div>
          </nav>

          {/* User Actions */}
          {loadingUser ? (
            <div className="h-10 w-24 bg-[#1A1F2E]/20 rounded-md animate-pulse"></div>
          ) : user ? (
            <div className="hidden lg:flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center bg-[#1A1F2E]/50 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2FB7C4]/50 mr-3 flex-shrink-0">
                    {user.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt={user.first_name || 'Usuario'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2FB7C4] flex items-center justify-center text-white font-semibold">
                        {user.first_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">
                        Hola, {user.first_name || 'Usuario'}
                      </span>
                      <span className="text-xs text-white/80">
                        Mi cuenta
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/80 transition-transform duration-300 group-hover:rotate-180" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full right-0 mt-2 w-64 bg-[#0E1116] backdrop-blur-md rounded-xl shadow-lg border border-[#374151] py-3 transition-all duration-200 z-50">
                  {/* Profile Link */}
                  <Link
                    href="/perfil"
                    className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                  >
                    <UserIcon className="w-5 h-5 text-[#2FB7C4]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Ver perfil</span>
                      <span className="text-xs text-white/60">Gestiona tu cuenta</span>
                    </div>
                  </Link>

                  {/* Admin Section - admin ve todo; instructor solo Blog */}
                  {(user?.role === 'admin' || user?.role === 'instructor') && (
                    <>
                      <div className="border-t border-[#374151] my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                          {user?.role === 'admin' ? 'Administración' : 'Blog'}
                        </p>
                      </div>
                      {user?.role === 'admin' && (
                        <>
                          <Link
                            href="/admin/cohortes"
                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                          >
                            <CalendarDays className="w-4 h-4 text-[#2FB7C4]" />
                            <span className="text-sm">Cohortes</span>
                          </Link>
                          <Link
                            href="/admin/pagos"
                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                          >
                            <FileText className="w-4 h-4 text-[#2FB7C4]" />
                            <span className="text-sm">Pagos</span>
                          </Link>
                          <Link
                            href="/admin/estudiantes"
                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                          >
                            <Users className="w-4 h-4 text-[#2FB7C4]" />
                            <span className="text-sm">Estudiantes</span>
                          </Link>
                          <Link
                            href="/admin/programas"
                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                          >
                            <GraduationCap className="w-4 h-4 text-[#2FB7C4]" />
                            <span className="text-sm">Programas</span>
                          </Link>
                          <Link
                            href="/admin/instructores"
                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                          >
                            <UserCog className="w-4 h-4 text-[#2FB7C4]" />
                            <span className="text-sm">Instructores</span>
                          </Link>
                          <Link
                            href="/admin/admins"
                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                          >
                            <Shield className="w-4 h-4 text-[#2FB7C4]" />
                            <span className="text-sm">Admins</span>
                          </Link>
                        </>
                      )}
                      <Link
                        href="/admin/blog"
                        className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#1A1F2E] transition-all duration-200"
                      >
                        <Newspaper className="w-4 h-4 text-[#2FB7C4]" />
                        <span className="text-sm">Blog</span>
                      </Link>
                    </>
                  )}

                  {/* Logout */}
                  <div className="border-t border-[#374151] my-2"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex cursor-pointer items-center space-x-3 px-4 py-3 text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Cerrar sesión</span>
                      <span className="text-xs text-white/60">Salir de tu cuenta</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <Link
                href="/registro"
                className="relative inline-flex items-center justify-center px-6 py-2.5 font-medium text-white bg-[#2FB7C4] hover:bg-[#2FB7C4]/90 focus:outline-none focus:ring-2 focus:ring-[#2FB7C4] focus:ring-offset-2 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
                >
                <span className="absolute inset-0 bg-[#2FB7C4] opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative text-white">
                  Registrarse
                </span>
                <svg
                  className="w-4 h-4 ml-2 -mr-1 transition-transform duration-300 transform hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/iniciar-sesion"
                className="relative px-4 py-2 text-white font-medium group overflow-hidden"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Iniciar sesión
                </span>
                <div className="absolute inset-0 bg-[#2FB7C4] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-md"></div>
              </Link>
            </div>
          )}


          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from propagating to the backdrop
                e.preventDefault(); // Prevent default action
                requestAnimationFrame(() => {
                  setIsMenuOpen(!isMenuOpen);
                });
              }}
              className="p-2 hover:animate-pulse hover:animate-once cursor-pointer"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 animate-fade-in animate-duration-200 text-white" />
              ) : (
                <Menu className="w-6 h-6 animate-fade-in animate-duration-200 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Sidebar */}
    <nav
      ref={mobileMenuRef}
      aria-label="Menú móvil"
      onClick={(e) => e.stopPropagation()}
      className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0E1116]/95 backdrop-blur-md border-l border-[#374151] z-60 shadow-2xl transition-transform duration-300 ease-out ${
        isMenuOpen
          ? "translate-x-0"
          : "translate-x-full"
      }`}
    >
      <div className="px-4 py-4 divide-y divide-[#374151] h-full overflow-y-auto flex flex-col">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-[#1A1F2E] rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Programas Link */}
            <div className="py-2">
              <Link
                href="/programas-academicos"
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-[#2FB7C4] transition-colors duration-200"
                onClick={() => {
                  setIsMenuOpen(false)
                  setMobileDropdown(null)
                }}
              >
                <span>Programas</span>
              </Link>
            </div>

            {/* Blog Link */}
            <div className="py-2">
              <Link
                href="/blog"
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-[#2FB7C4] transition-colors duration-200"
                onClick={() => {
                  setIsMenuOpen(false)
                  setMobileDropdown(null)
                }}
              >
                <span>Blog</span>
              </Link>
            </div>

            {/* Comunidad Link */}
            <div className="py-2">
              <a
                href="https://www.codigoabierto.tech/eventos"
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-[#2FB7C4] transition-colors duration-200"
                onClick={() => {
                  setIsMenuOpen(false)
                  setMobileDropdown(null)
                }}
              >
                <span>Comunidad</span>
              </a>
            </div>

            {/* User Actions */}
            <div className="py-4">
              {user ? (
                <div className="flex flex-col space-y-3">
                  {/* Profile Section */}
                  <Link
                    href="/perfil"
                    className="flex items-center space-x-3 px-4 py-3 text-white bg-[#2FB7C4]/20 hover:bg-[#2FB7C4]/30 rounded-lg transition-all duration-300 w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2FB7C4]/50 flex-shrink-0">
                      {user.profile_image ? (
                        <Image
                          src={user.profile_image}
                          alt={user.first_name || 'Usuario'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2FB7C4] flex items-center justify-center text-white font-semibold">
                          {user.first_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-white">Hola, {user.first_name || 'Usuario'}</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-3 text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300 w-full flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>

                  {/* Admin Section - admin ve todo; instructor solo Blog */}
                  {(user?.role === 'admin' || user?.role === 'instructor') && (
                    <div className="py-2 space-y-2">
                      {user?.role === 'admin' && (
                        <>
                          <Link
                            href="/admin/cohortes"
                            className="flex items-center space-x-3 py-2 px-4 text-sm text-white hover:text-[#2FB7C4] hover:bg-[#1A1F2E]/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            <CalendarDays className="w-4 h-4 text-[#2FB7C4]" />
                            <span>Cohortes</span>
                          </Link>
                          <Link
                            href="/admin/pagos"
                            className="flex items-center space-x-3 py-2 px-4 text-sm text-white hover:text-[#2FB7C4] hover:bg-[#1A1F2E]/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            <FileText className="w-4 h-4 text-[#2FB7C4]" />
                            <span>Pagos</span>
                          </Link>
                          <Link
                            href="/admin/estudiantes"
                            className="flex items-center space-x-3 py-2 px-4 text-sm text-white hover:text-[#2FB7C4] hover:bg-[#1A1F2E]/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            <Users className="w-4 h-4 text-[#2FB7C4]" />
                            <span>Estudiantes</span>
                          </Link>
                          <Link
                            href="/admin/programas"
                            className="flex items-center space-x-3 py-2 px-4 text-sm text-white hover:text-[#2FB7C4] hover:bg-[#1A1F2E]/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            <GraduationCap className="w-4 h-4 text-[#2FB7C4]" />
                            <span>Programas</span>
                          </Link>
                          <Link
                            href="/admin/instructores"
                            className="flex items-center space-x-3 py-2 px-4 text-sm text-white hover:text-[#2FB7C4] hover:bg-[#1A1F2E]/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            <UserCog className="w-4 h-4 text-[#2FB7C4]" />
                            <span>Instructores</span>
                          </Link>
                          <Link
                            href="/admin/admins"
                            className="flex items-center space-x-3 py-2 px-4 text-sm text-white hover:text-[#2FB7C4] hover:bg-[#1A1F2E]/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            <Shield className="w-4 h-4 text-[#2FB7C4]" />
                            <span>Admins</span>
                          </Link>
                        </>
                      )}
                      <Link
                        href="/admin/blog"
                        className="flex items-center justify-between w-full py-3 px-4 text-white font-semibold bg-[#1A1F2E]/50 hover:bg-[#1A1F2E] rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setMobileDropdown(null)
                        }}
                      >
                        <span>{user?.role === 'admin' ? 'Admin - Blog' : 'Blog'}</span>
                        <Newspaper className="w-5 h-5 text-[#2FB7C4]" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start space-y-3">
                  <Link
                    href="/registro"
                    className="px-4 py-3 text-white bg-[#2FB7C4] hover:bg-[#2FB7C4]/90 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full text-center font-medium flex items-center justify-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-white">Registrarse</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-300 transform hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="/iniciar-sesion"
                    className="px-4 py-3 text-[#2FB7C4] border-2 border-[#2FB7C4] hover:bg-[#2FB7C4] hover:text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
      </div>
    </nav>

    {/* Backdrop */}
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-55 lg:hidden transition-opacity duration-300 ease-in-out ${
        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsMenuOpen(false);
        setMobileDropdown(null);
      }}
    />
    </>
  )
}
