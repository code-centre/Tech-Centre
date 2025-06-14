"use client"
import Link from "next/link"
import Image from "next/image"
import useUserStore from "../../store/useUserStore"
import { useState, useEffect } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { db } from "../../firebase"
import { collection, query, where } from "firebase/firestore"
import { ChevronDown, Menu, X, Globe, Moon, Sun } from "lucide-react"
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
  const [isMobileView, setIsMobileView] = useState(false)
  const { user } = useUserStore() as { user: User | null }
  

  useEffect(() => {
    if (user) {
      setUserOn(true)
    }
  }, [user])

  const handleLogOut = () => {
    localStorage.removeItem("user")
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
      const fechaCurso = new Date(course.date)
      return fechaCurso > fechaActual && course.status === "published"
    }) || []

  console.log("Diplomas:", diplomasInfo)
  console.log("Cursos especializados:", specializedCoursesInfo)

  // Use useEffect for client-side operations
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024)
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Initial check
      handleResize()
      
      // Add event listener
      window.addEventListener('resize', handleResize)
      
      // Cleanup
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Update mobile dropdown toggle
  const toggleMobileDropdown = (dropdown: string) => {
    if (typeof window !== 'undefined') {
      setMobileDropdown(mobileDropdown === dropdown ? null : dropdown)
    }
  }

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
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
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blueApp 
                font-medium transition-all duration-200 group">
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full">
                  Cursos Especializados
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
                absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-xl 
                shadow-lg border border-gray-100 py-3 transition-all duration-200">
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
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blueApp rounded-md transition-all duration-200 animate-fade-in-up"
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
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blueApp 
                font-medium transition-all duration-200 group">
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 after:bg-blueApp after:transition-all group-hover:after:w-full">
                  Diplomados
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 
                absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-xl 
                shadow-lg border border-gray-100 py-3 transition-all duration-200">
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
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 
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
              className="text-gray-700 hover:text-blueApp font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blueApp after:transition-all hover:after:w-full"
            >
              Empresas
            </Link>
            <Link
              href="/comunidades"
              className="text-gray-700 hover:text-blueApp font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blueApp after:transition-all hover:after:w-full"
            >
              Comunidades
            </Link>
          </nav>

         
          <div className="hidden lg:flex items-center space-x-6 animate-fade-in animate-delay-300">
            <Link
              href="/iniciar-sesion"
              className="relative px-4 py-2 text-gray-700 font-medium group overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                Iniciar sesión
              </span>
              <div className="absolute inset-0 bg-blueApp transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-md"></div>
            </Link>
            
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
          </div>

          
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

     
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bg-white/95 backdrop-blur-sm 
            border-t border-gray-200 z-50 animate-slide-in-down animate-duration-200">
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
        )}
      </div>

      {/* Backdrop */}
      {(isMenuOpen || (isMobileView && mobileDropdown)) && (
        <div 
          className="fixed inset-0 bg-black/10 transition-opacity duration-200 ease-in-out z-40" 
          onClick={() => {
            setIsMenuOpen(false)
            setMobileDropdown(null)
          }}
        />
      )}
    </header>
  )
}
