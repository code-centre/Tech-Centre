"use client"
import Link from "next/link"
import Image from "next/image"
import useUserStore from "../../store/useUserStore"
import { useState, useEffect } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { db } from "../../firebase"
import { collection, query, where } from "firebase/firestore"
import { ChevronDown, Menu, X, Globe, Moon, Sun, ChevronRight } from "lucide-react"
import type { User } from "firebase/auth"

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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null)
  const { user, setUser } = useUserStore() as { user: User | null; setUser: (user: User | null) => void }


  useEffect(() => {
    if (user) {
      setUserOn(true)
    }
  }, [user])

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

  const specializedCoursesInfo = specializedCourses?.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Course))
    .filter((course) => {

      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0);

      const fechaCurso = new Date(course.date)
      fechaCurso.setHours(0, 0, 0, 0);

      return fechaCurso >= fechaActual && course.status === "published"
    }) || []

  console.log("Diplomas:", diplomasInfo)
  console.log("Cursos especializados:", specializedCoursesInfo)

  // Add a function to check if we're on mobile
  const isMobile = () => {
    return window.innerWidth < 1024; // 1024px is the 'lg' breakpoint in Tailwind
  }

  const toggleMobileDropdown = (dropdown: string) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">

          <Link href="/" className="flex-shrink-0">
            <Image
              src="/tech-center-logos/Logo-horizontal-azul.png"
              alt="Logo de Tech-Centre"
              width={160}
              height={40}
              className="hover:animate-pulse hover:animate-once hover:animate-duration-300"
            />
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Cursos Especializados Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group">
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full">
                  Cursos Especializados
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
                absolute top-full left-0 mt-2 w-80 bg-zinc-900 backdrop-blur-md rounded-xl 
                shadow-lg border border-white/20 py-3 transition-all duration-200">
                <div className="px-4 py-2">
                  <Link
                    href="/#cursos"
                    className="block px-3 py-2 text-sm font-medium text-blueApp hover:bg-blue-50 
                      rounded-md transition-all duration-200 mb-2 border-b border-gray-100"
                    onClick={(e) => {
                      if (window.location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
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
            </div>


            {/* Diplomados Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-white hover:text-blueApp 
                font-medium transition-all duration-200 group">
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full">
                  Diplomados
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
                absolute top-full left-0 mt-2 w-80 bg-zinc-900 backdrop-blur-md rounded-xl 
                shadow-lg border border-white/20 py-3 transition-all duration-200">
                <div className="px-4 py-2">
                  <Link
                    href="/#cursos"
                    className="block px-3 py-2 text-sm font-medium text-blueApp hover:bg-blue-50 
                      rounded-md transition-all duration-200 mb-2 border-b border-gray-100"
                    onClick={(e) => {
                      if (window.location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
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
                    <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin 
                      scrollbar-thumb-blueApp/20 hover:scrollbar-thumb-blueApp/40">
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


            <Link
              href="/empresas"
              className="text-white hover:text-blueApp font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blueApp after:transition-all hover:after:w-full"
            >
              Empresas
            </Link>
            <Link
              href="/comunidades"
              className="text-white hover:text-blueApp font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blueApp after:transition-all hover:after:w-full"
            >
              Comunidades
            </Link>
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
                        Hola, {user.name}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="gap-0 flex items-center justify-end space-x-4 lg:space-x-6">
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:animate-pulse hover:animate-once"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 animate-fade-in animate-duration-200" />
            ) : (
              <Menu className="w-6 h-6 animate-fade-in animate-duration-200" />
            )}
          </button>
        </div>
        {
          isMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-16 bg-white/80 backdrop-blur-md 
            border-t border-white/20 z-50 animate-slide-in-down animate-duration-200">
              <div className="px-4 py-2 divide-y divide-gray-100">

                <div className="py-2">
                  <button
                    onClick={() => toggleMobileDropdown("cursos-mobile")}
                    className="flex items-center justify-between w-full py-2 text-gray-700 font-medium"
                  >
                    <span>Cursos Especializados</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 
                    ${mobileDropdown === "cursos-mobile" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {mobileDropdown === "cursos-mobile" && (
                    <div className="mt-2 pl-4 animate-fade-in animate-duration-200">
                      <Link
                        href="/#cursos"
                        className="block py-2 text-sm font-medium text-blueApp border-b border-gray-100 mb-2"
                        onClick={(e) => {
                          if (window.location.pathname === '/') {
                            e.preventDefault();
                            document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
                          }
                          setIsMenuOpen(false);
                          setMobileDropdown(null);
                        }}
                      >
                        Toda nuestra oferta académica
                      </Link>
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blueApp" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {specializedCoursesInfo.map((course) => (
                            <Link
                              key={course.id}
                              href={`/programas-academicos/${course.slug}`}
                              className="block py-2 text-sm text-gray-600 hover:text-blueApp 
                              transition-colors duration-200"
                              onClick={() => {
                                setIsMenuOpen(false)
                                setMobileDropdown(null)
                              }}
                            >
                              {course.title || course.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Diplomados Mobile Dropdown */}
                <div className="py-2">
                  <button
                    onClick={() => toggleMobileDropdown("diplomados-mobile")}
                    className="flex items-center justify-between w-full py-2 text-gray-700 font-medium"
                  >
                    <span>Diplomados</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 
                    ${mobileDropdown === "diplomados-mobile" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {mobileDropdown === "diplomados-mobile" && (
                    <div className="mt-2 pl-4 animate-fade-in animate-duration-200">
                      {diplomasInfo.map((diploma) => (
                        <Link
                          key={diploma.id}
                          href={`/programas-academicos/${diploma.slug}`}
                          className="block py-2 text-sm text-gray-600 hover:text-blueApp 
                          transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {diploma.title || diploma.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>


              </div>
            </div>
          )
        }
      </div >

      {/* Backdrop */}
      {
        (isMenuOpen || (isMobile() && mobileDropdown)) && (
          <div
            className="fixed inset-0 bg-black/10 transition-opacity duration-200 ease-in-out z-40"
            onClick={() => {
              setIsMenuOpen(false)
              setMobileDropdown(null)
            }}
          />
        )
      }
    </header >
  )
}
