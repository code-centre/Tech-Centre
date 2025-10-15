"use client"
import Link from "next/link"
import Image from "next/image"
import useUserStore from "../../store/useUserStore"
import { useState, useEffect, useRef, useCallback } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { db } from "../../firebase"
import { collection, query, where } from "firebase/firestore"
import { ChevronDown, Menu, X, ChevronRight, ChevronLast, ChevronLeft } from "lucide-react"
import type { User } from "firebase/auth"
import Anuncios from "@/components/anuncios";

interface Course {
  id: string
  title?: string
  name?: string
  slug?: string
  status: string
  type: string
  date: string // Add date field
}

export default function Header() {
  const [userOn, setUserOn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null)
  const [showCursosEspecializados, setShowCursosEspecializados] = useState(false)
  const [showDiplomados, setShowDiplomados] = useState(false)
  const cursosEspecializadosRef = useRef<HTMLDivElement>(null)
  const diplomadosRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const { user, setUser } = useUserStore() as { user: any | null; setUser: (user: any | null) => void }

  useEffect(() => {
    if (user) {
      setUserOn(true)
    }
  }, [user])

  // Click outside handler for mobile dropdowns
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

  const handleLogOut = () => {
    setUser(null)
    setUserOn(false)
  }

  const [specializedCourses, loading, error] = useCollection(
    query(collection(db, "events"), where("type", "==", "curso especializado"), where("status", "==", "published")),
  )

  const [diplomaCourses, loadingDiploma, errorDiploma] = useCollection(
    query(collection(db, "programs"), where("type", "==", "Diplomado"), where("status", "==", "Publicado")),
  )

  interface Diploma {
    id: string
    title?: string
    name?: string
    slug?: string
    status?: string
    type?: string
    date?: string
  }

  const diplomasInfo: Diploma[] =
    diplomaCourses?.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Diploma, "id">),
    })) || []

  const specializedCoursesInfo =
    specializedCourses?.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Course,
      )
      .filter((course) => {
        const fechaActual = new Date()
        fechaActual.setHours(0, 0, 0, 0)

        const fechaCurso = new Date(course.date)
        fechaCurso.setHours(0, 0, 0, 0)

        return fechaCurso >= fechaActual && course.status === "published"
      }) || []

  // State to check if we're on mobile
  const [isMobile, setIsMobile] = useState(false)

  // Effect to update isMobile state based on window size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024) // 1024px is the 'lg' breakpoint in Tailwind
    }

    // Check on first render
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile)

    // Clean up
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const toggleMobileDropdown = (dropdown: string) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm shadow-lg">
      <Anuncios />  
      <div className="max-w-7xl mx-auto">
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
            {/* cursos general dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
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
                absolute top-full left-0 mt-2 w-60 bg-zinc-900 backdrop-blur-md rounded-xl 
                shadow-lg border border-white/20 py-3 transition-all duration-200"
              >
                <div className="px-4 py-2 space-y-2">
                  <Link
                    href="/programas-academicos"
                    className="block px-3 py-2 text-sm font-medium text-blueApp hover:bg-blue-50 
                      rounded-md transition-all duration-200 mb-2 border-b border-gray-100"
                  >
                    ¡Estudia con nosotros!
                  </Link>
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setShowDiplomados(true)}
                    onMouseLeave={() => setShowDiplomados(false)}
                    ref={diplomadosRef}
                  >
                    <div
                      className="flex items-center space-x-2 text-white hover:text-blueApp 
                      font-medium transition-all duration-200 px-3 py-2"
                    >
                      <span
                        className="relative after:absolute text-sm after:bottom-0 after:left-0 after:h-0.5 
                        after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                      >
                        Diplomados
                      </span>
                      <ChevronLeft
                        className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" 
                      />
                    </div>
                    <div
                      className={`z-20 absolute left-full top-0 ml-2 w-80 bg-zinc-900 backdrop-blur-md rounded-xl shadow-lg border border-white/20 py-3 transition-all duration-200 ${
                        showDiplomados ? 'opacity-100 visible' : 'opacity-0 invisible'
                      }`}
                      onMouseEnter={() => setShowDiplomados(true)}
                      onMouseLeave={() => setShowDiplomados(false)}
                    >
                      <div className=" px-4 py-2">
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-blueApp/20 hover:scrollbar-thumb-blueApp/40">
                            {diplomasInfo.map((diploma, index) => (
                              <Link
                                key={diploma.id}
                                href={`/programas-academicos/${diploma.slug}`}
                                className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                                  hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                {diploma.title || diploma.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setShowCursosEspecializados(true)}
                    onMouseLeave={() => setShowCursosEspecializados(false)}
                    ref={cursosEspecializadosRef}
                  >
                    <div
                      className="flex items-center space-x-2 text-white hover:text-blueApp 
                      font-medium transition-all duration-200 px-3 py-2"
                    >
                      <span
                        className="relative text-sm after:absolute after:bottom-0 after:left-0 after:h-0.5 
                        after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                      >
                        Cursos Especializados
                      </span>
                      <ChevronLeft
                        className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" 
                      />
                    </div>
                    <div
                      className={`z-20 absolute left-full top-0 ml-2 w-80 bg-zinc-900 backdrop-blur-md rounded-xl shadow-lg border border-white/20 py-3 transition-all duration-200 ${showCursosEspecializados ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                      onMouseEnter={() => setShowCursosEspecializados(true)}
                      onMouseLeave={() => setShowCursosEspecializados(false)}
                    >
                      <div className=" px-4 py-2">
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-blueApp/20 hover:scrollbar-thumb-blueApp/40">
                            {specializedCoursesInfo.map((course, index) => (
                              <Link
                                key={course.id}
                                href={`/programas-academicos/${course.slug}`}
                                className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                {course.title || course.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Cursos Especializados Dropdown */}
            {/* <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Cursos Especializados
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
                    href="/#cursosespecializados"
                    className="block px-3 py-2 text-sm font-medium text-blueApp hover:bg-blue-50 
                      rounded-md transition-all duration-200 mb-2 border-b border-gray-100"
                    onClick={(e) => {
                      if (window.location.pathname === "/") {
                        e.preventDefault()
                        document.getElementById("cursosespecializados")?.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    Toda nuestra oferta académica
                  </Link>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-blueApp/20 hover:scrollbar-thumb-blueApp/40">
                      {specializedCoursesInfo.map((course, index) => (
                        <Link
                          key={course.id}
                          href={`/programas-academicos/${course.slug}`}
                          className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {course.title || course.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div> */}

            {/* Diplomados Dropdown */}
            {/* <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Diplomados
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
                    href="/#cursos"
                    className="block px-3 py-2 text-sm font-medium text-blueApp hover:bg-blue-50 
                      rounded-md transition-all duration-200 mb-2 border-b border-gray-100"
                    onClick={(e) => {
                      if (window.location.pathname === "/") {
                        e.preventDefault()
                        document.getElementById("cursos")?.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    Toda nuestra oferta académica
                  </Link>
                  {loadingDiploma ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                    </div>
                  ) : (
                    <div
                      className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin 
                      scrollbar-thumb-blueApp/20 hover:scrollbar-thumb-blueApp/40"
                    >
                      {diplomasInfo.map((diploma, index) => (
                        <Link
                          key={diploma.id}
                          href={`/programas-academicos/${diploma.slug}`}
                          className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {diploma.title || diploma.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>   */}
            {/* Empresas Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Empresas
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
                    href="/empresas"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                  >
                    Capacitaciones
                  </Link>
                </div>
                <div className="px-4 py-2">
                  <Link
                    href="/empresas/trabajo"
                     className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Trabaja con nosotros
                    </Link>
                  </div>
                  <div className="px-4 py-2">
                    <Link
                      href="/empresas#pasantias"
                      className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                              hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                    >
                      Pasantías
                    </Link>
                  </div>
                  
              </div>
            </div>  
            {/* Comunidad Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Comunidad
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
                    href="/"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                  >
                    F. Codigo abierto
                  </Link>
                </div>
                <div className="px-4 py-2">
                  <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                  M. Costa digital
                  </div>
                </div>
                <div className="px-4 py-2">
                    <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Caribe Ventures
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Ciudad inmersiva
                    </div>
                  </div>
                  
              </div>
            </div> 
            {/* Noticias Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Noticias
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
                    href="/"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                  >
                    Blogs
                  </Link>
                </div>
                <div className="px-4 py-2">
                  <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                  Prensa
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                  Eventos
                  </div>
                </div>
              </div>
            </div>   
            {user ? (<div>
              <div className="relative group">
              <button
                className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group"
              >
                <span
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full"
                >
                  Admin
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
                    href="/admin/estudiantes"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                  >
                    Lista estudiantes
                  </Link>
                </div>
                <div className="px-4 py-2">
                  <Link
                    href="/admin/pagos"
                     className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Lista de pagos
                    </Link>
                  </div>
              </div>
            </div> 
            </div>) : (<div></div>)}   
          </nav>
          {/* User Actions */}
          {user ? (
            <div className="hidden lg:flex items-center space-x-4 ">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg h-10 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-blueApp flex items-center justify-center text-white mr-3">
                  {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                </div>
                <Link href={"/perfil"} className="group relative">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200">
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm group-hover:text-blue-100 transition-colors">
                        Hola, {user?.name}
                      </span>
                      <span className="text-xs text-white/80 group-hover:text-blue-200 transition-colors">
                        Ver perfil
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/80 group-hover:text-blue-200 transition-colors" />
                  </div>
                </Link>
              </div>
              <button
                onClick={handleLogOut}
                className="px-4 py-2 text-white bg-red-500 hover:to-red-300 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="gap-0 flex items-center justify-end space-x-4 lg:space-x-6">
                {!isMobile && (
                  <Link
                    href="/registro"
                    className="relative inline-flex items-center justify-center px-6 py-2.5 font-medium text-white bg-blueApp hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300
                  hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
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
                )}
                <div className="hidden lg:flex items-center space-x-6 animate-fade-in animate-delay-300">
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
              </div>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from propagating to the backdrop
              e.preventDefault(); // Prevent default action
              requestAnimationFrame(() => {
                setIsMenuOpen(!isMenuOpen);
              });
            }}
            className="lg:hidden p-2 hover:animate-pulse hover:animate-once"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 animate-fade-in animate-duration-200 text-white" />
            ) : (
              <Menu className="w-6 h-6 animate-fade-in animate-duration-200 text-white" />
            )}
          </button>
        </div>
        <div
          ref={mobileMenuRef}
          onClick={(e) => e.stopPropagation()} // Prevent clicks within the menu from closing it
          className={`lg:hidden fixed inset-x-0 top-16 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-600 z-50 shadow-lg transition-all duration-300 ease-in-out ${isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
        >
          <div className="px-4 py-4 divide-y divide-gray-300">
            {/* Cursos Especializados Mobile Dropdown */}
            <div className="py-2">
              <button
                onClick={() => toggleMobileDropdown("cursos-mobile")}
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
              >
                <span>Cursos Especializados</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown === "cursos-mobile" ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileDropdown === "cursos-mobile"
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
                  }`}
              >
                <div className="mt-2 pl-4 space-y-2 transform transition-transform duration-300">
                  <Link
                    href="/#cursos"
                    className="block py-2 text-sm font-medium text-white hover:underline transition-colors duration-200"
                    onClick={(e) => {
                      if (window.location.pathname === "/") {
                        e.preventDefault()
                        document.getElementById("cursos")?.scrollIntoView({ behavior: "smooth" })
                      }
                      setIsMenuOpen(false)
                      setMobileDropdown(null)
                    }}
                  >
                    Toda nuestra oferta académica
                  </Link>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                    </div>
                  ) : (
                    specializedCoursesInfo.map((course, index) => (
                      <Link
                        key={course.id}
                        href={`/programas-academicos/${course.slug}`}
                        className="block py-2 text-sm text-white hover:text-blueApp transition-colors duration-200 transform hover:translate-x-1"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setMobileDropdown(null)
                        }}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          opacity: mobileDropdown === "cursos-mobile" ? 1 : 0,
                          transform: mobileDropdown === "cursos-mobile" ? "translateY(0)" : "translateY(-10px)",
                          transition: "all 0.3s ease-out",
                        }}
                      >
                        {course.title || course.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Diplomados Mobile Dropdown */}
            <div className="py-2">
              <button
                onClick={() => toggleMobileDropdown("diplomados-mobile")}
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
              >
                <span>Diplomados</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown === "diplomados-mobile" ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileDropdown === "diplomados-mobile"
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
                  }`}
              >
                <div className="mt-2 pl-4 space-y-2 transform transition-transform duration-300">
                  <Link
                    href="/#cursos"
                    className="block py-2 text-sm font-medium text-white hover:underline transition-colors duration-200"
                    onClick={(e) => {
                      if (window.location.pathname === "/") {
                        e.preventDefault()
                        document.getElementById("cursos")?.scrollIntoView({ behavior: "smooth" })
                      }
                      setIsMenuOpen(false)
                      setMobileDropdown(null)
                    }}
                  >
                    Toda nuestra oferta académica
                  </Link>
                  {loadingDiploma ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                    </div>
                  ) : (
                    diplomasInfo.map((diploma, index) => (
                      <Link
                        key={diploma.id}
                        href={`/programas-academicos/${diploma.slug}`}
                        className="block py-2 text-sm text-white hover:text-blueApp transition-colors duration-200 transform hover:translate-x-1"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setMobileDropdown(null)
                        }}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          opacity: mobileDropdown === "diplomados-mobile" ? 1 : 0,
                          transform: mobileDropdown === "diplomados-mobile" ? "translateY(0)" : "translateY(-10px)",
                          transition: "all 0.3s ease-out",
                        }}
                      >
                        {diploma.title || diploma.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>            
            {/* Other Navigation Links */}
            {/* Empresas Dropdown */}
            <div className="py-2">
              <button
                onClick={() => toggleMobileDropdown("empresas-mobile")}
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
              >
                <span
                >
                  Empresas
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown === "empresas-mobile" ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileDropdown === "empresas-mobile"
                  ? "max-h-[20vh] opacity-100 overflow-y-auto"
                  : "max-h-0 opacity-0"
                  }`}
              >
                <div className="mt-2 pl-4 space-y-2 transform transition-transform duration-300">
                  <Link
                    href="/"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                  >
                    Capacitaciones
                  </Link>
                </div>
                <div className="px-4 py-2">
                    <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Trabaja con nosotros
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Pasantías
                    </div>
                  </div>
                  
              </div>
            </div>  
            {/* Comunidad Dropdown */}
            <div className="py-2">
              <button
                onClick={() => toggleMobileDropdown("comunidad-mobile")}
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
              >
                <span>
                  Comunidad
                  </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown === "comunidad-mobile" ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileDropdown === "comunidad-mobile"
                  ? "max-h-[20vh] opacity-100 overflow-y-auto"
                  : "max-h-0 opacity-0"
                  }`}
              >
                <div className="px-4 py-2">
                  <Link
                    href="/"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
                  >
                    F. Codigo abierto
                  </Link>
                </div>
                <div className="px-4 py-2">
                  <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                  M. Costa digital
                  </div>
                </div>
                <div className="px-4 py-2">
                    <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Caribe Ventures
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Ciudad inmersiva
                    </div>
                  </div>
                  
              </div>
            </div> 
            {/* Noticias Dropdown */}
            <div className="py-2">
              <button
                onClick={() => toggleMobileDropdown("Noticias-mobile")}
                className="flex items-center justify-between w-full py-3 text-white font-semibold hover:text-blueApp transition-colors duration-200"
              >
                <span>
                  Noticias
                  </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown === "Noticias-mobile" ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`${
                  mobileDropdown === "Noticias-mobile"
                    ? "max-h-[20vh] opacity-100 overflow-y-auto"
                    : "max-h-0 opacity-0"
                } transition-all duration-500 ease-in-out`}
              >
                <div className="px-4 py-2">
                  <Link
                    href="/"
                    className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                    Blogs
                  </Link>
                </div>
                <div className="px-4 py-2">
                  <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                  Prensa
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="block px-3 py-2 text-sm text-white hover:bg-blue-50 
                            hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up">
                  Eventos
                  </div>
                </div>
              </div>
            </div> 

            {/* User Actions - Move Register button inside mobile menu */}
            <div className="py-4">
              {user ? (
                <div className="flex flex-col items-start space-y-3">
                  <Link
                    href="/perfil"
                    className="flex items-center space-x-3 px-4 py-3 text-white bg-blueApp hover:bg-blue-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                      {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">Hola, {user.name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogOut()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full flex items-center justify-center space-x-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
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
        className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
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
