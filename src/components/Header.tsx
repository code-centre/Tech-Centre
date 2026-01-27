"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronDown, Menu, X, User as UserIcon, LogOut, Users, FileText, GraduationCap } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@/lib/supabase'
import ProgramQuery from "./ProgramQuery"
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm shadow-lg">
      <ProgramQuery onProgramsLoaded={handleProgramsLoaded} />

      <div className="max-w-7xl mx-auto container px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/tech-center-logos/Logotechcentrehorizontal.png"
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
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group cursor-pointer"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Programas
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div
                className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
                absolute top-full left-0 mt-2 w-80 bg-zinc-900 backdrop-blur-md rounded-xl 
                shadow-lg border border-white/20 py-3 transition-all duration-200"
              >
                <div className="px-4 py-2">
                  <Link
                    href="/programas-academicos"
                    className="block px-3 py-2 text-sm font-medium text-blueApp hover:bg-blue-50 
                      rounded-md transition-all duration-200 mb-2 border-b border-gray-100"
                  >
                    Oferta académica
                  </Link>
                  <div
                    className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin 
                    scrollbar-thumb-blueApp/20 hover:scrollbar-thumb-blueApp/40"
                  >
                    {supabasePrograms.map((program) => (
                      <Link
                        key={program.id}
                        href={`/programas-academicos/${program.code}`}
                        className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                          hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                      >
                        {program.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <a
                href="https://www.codigoabierto.tech/eventos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Comunidad
                </span>
              </a>
            </div>
          </nav>

          {/* User Actions */}
          {loadingUser ? (
            <div className="h-10 w-24 bg-gray-200/20 rounded-md animate-pulse"></div>
          ) : user ? (
            <div className="hidden lg:flex items-center space-x-4">
              {/* User Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center bg-white/10 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blueApp/50 mr-3 flex-shrink-0">
                    {user.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt={user.first_name || 'Usuario'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blueApp flex items-center justify-center text-white font-semibold">
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
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full right-0 mt-2 w-64 bg-zinc-900 backdrop-blur-md rounded-xl shadow-lg border border-white/20 py-3 transition-all duration-200 z-50">
                  {/* Profile Link */}
                  <Link
                    href="/perfil"
                    className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-zinc-800 transition-all duration-200"
                  >
                    <UserIcon className="w-5 h-5 text-blueApp" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Ver perfil</span>
                      <span className="text-xs text-gray-400">Gestiona tu cuenta</span>
                    </div>
                  </Link>

                  {/* Admin Section - Only show if user is admin */}
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-zinc-700/50 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Administración
                        </p>
                      </div>
                      <Link
                        href="/admin/estudiantes"
                        className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-zinc-800 transition-all duration-200"
                      >
                        <Users className="w-4 h-4 text-blueApp" />
                        <span className="text-sm">Lista estudiantes</span>
                      </Link>
                      <Link
                        href="/admin/pagos"
                        className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-zinc-800 transition-all duration-200"
                      >
                        <FileText className="w-4 h-4 text-blueApp" />
                        <span className="text-sm">Lista de pagos</span>
                      </Link>
                      <Link
                        href="/admin/programas"
                        className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-zinc-800 transition-all duration-200"
                      >
                        <GraduationCap className="w-4 h-4 text-blueApp" />
                        <span className="text-sm">Lista de programas</span>
                      </Link>
                    </>
                  )}

                  {/* Logout */}
                  <div className="border-t border-zinc-700/50 my-2"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex cursor-pointer items-center space-x-3 px-4 py-3 text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Cerrar sesión</span>
                      <span className="text-xs text-gray-400">Salir de tu cuenta</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/registro"
                className="relative inline-flex items-center justify-center px-6 py-2.5 font-medium text-white bg-blueApp hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
                >
                <span className="absolute inset-0 bg-blueApp opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">
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
                <div className="absolute inset-0 bg-blueApp transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-md"></div>
              </Link>
            </div>
          )}


          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from propagating to the backdrop
              e.preventDefault(); // Prevent default action
              requestAnimationFrame(() => {
                setIsMenuOpen(!isMenuOpen);
              });
            }}
            className="lg:hidden p-2 hover:animate-pulse hover:animate-once cursor-pointer"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 animate-fade-in animate-duration-200 text-white" />
            ) : (
              <Menu className="w-6 h-6 animate-fade-in animate-duration-200 text-white" />
            )}
          </button>
        </div>
        {/* Mobile Sidebar - Slides in from right */}
        <div
          ref={mobileMenuRef}
          onClick={(e) => e.stopPropagation()} // Prevent clicks within the menu from closing it
          className={`lg:hidden fixed top-0 right-0 h-auto w-80 max-w-[85vw] bg-zinc-900/95 backdrop-blur-md border-l border-zinc-600 z-50 shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div className="px-4 py-4 divide-y divide-gray-300 h-auto overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Programas Link */}
            <div className="py-2">
              <Link
                href="/programas-academicos"
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
                onClick={() => {
                  setIsMenuOpen(false)
                  setMobileDropdown(null)
                }}
              >
                <span>Programas</span>
              </Link>
            </div>

            {/* Comunidad Link */}
            <div className="py-2">
              <a
                href="https://www.codigoabierto.tech/eventos"
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
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
                    className="flex items-center space-x-3 px-4 py-3 text-white bg-blueApp/20 hover:bg-blueApp/30 rounded-lg transition-all duration-300 w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blueApp/50 flex-shrink-0">
                      {user.profile_image ? (
                        <Image
                          src={user.profile_image}
                          alt={user.first_name || 'Usuario'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blueApp flex items-center justify-center text-white font-semibold">
                          {user.first_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">Hola, {user.first_name || 'Usuario'}</span>
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

                  {/* Admin Dropdown - Only show if user is admin */}
                  {user?.role === 'admin' && (
                    <div className="py-2">
                      <button
                        onClick={() => toggleMobileDropdown("admin-mobile")}
                        className="flex items-center justify-between w-full py-3 px-4 text-white font-semibold bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                      >
                        <span>Admin</span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown === "admin-mobile" ? "rotate-180" : ""}`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          mobileDropdown === "admin-mobile"
                            ? "max-h-[500px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="mt-2 pl-4 space-y-2">
                          <Link
                            href="/admin/estudiantes"
                            className="block py-2 px-3 text-sm text-white hover:text-blueApp hover:bg-zinc-800/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            Lista estudiantes
                          </Link>
                          <Link
                            href="/admin/pagos"
                            className="block py-2 px-3 text-sm text-white hover:text-blueApp hover:bg-zinc-800/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            Lista de pagos
                          </Link>
                          <Link
                            href="/admin/programas"
                            className="block py-2 px-3 text-sm text-white hover:text-blueApp hover:bg-zinc-800/30 rounded-md transition-all duration-200"
                            onClick={() => {
                              setIsMenuOpen(false)
                              setMobileDropdown(null)
                            }}
                          >
                            Lista de programas
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start space-y-3">
                  <Link
                    href="/registro"
                    className="px-4 py-3 text-white bg-blueApp hover:bg-blue-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full text-center font-medium flex items-center justify-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Registrarse</span>
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
                    className="px-4 py-3 text-blueApp border-2 border-blueApp hover:bg-blueApp hover:text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsMenuOpen(false);
          setMobileDropdown(null);
        }}
      />
    </header>
  )
}
