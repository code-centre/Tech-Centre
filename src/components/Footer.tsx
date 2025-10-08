'use client'
import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Github, InstagramIcon } from 'lucide-react'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import Image from 'next/image'
import { AliadosSection } from './aliadosSection'
import { LinkedInIcon } from './Icons'

interface FooterProps {
  slug?: string;
  programasEducativos?: Program[];
  cortosFuturos?: EventFCA[];
}
export function Footer({ slug, programasEducativos = [], cortosFuturos = [] }: FooterProps) {

  const [programasEducativosSnapshot, loading, error] = useCollection(
    query(collection(db, 'programs'),
      where('status', '==', 'Publicado'))
  )
  const [cursosCortos, loadingCursosCortos, errorCursosCortos] = useCollection(
    query(collection(db, 'events'),
      where('status', '==', 'published'),
      where('type', '==', 'curso especializado'),)
  )

  // Procesar los datos
  const programasFromDB = programasEducativosSnapshot
    ? programasEducativosSnapshot.docs.map(doc => ({ ...(doc.data() as Program), id: doc.id }))
    : []
  const cursosCortosFromDB = cursosCortos
    ? cursosCortos.docs.map(doc => ({ ...(doc.data() as EventFCA), id: doc.id }))
    : []

  // Filtrar cursos futuros
  const cortosFuturosFromDB = cursosCortosFromDB.filter((curso) => {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    const fechaCurso = new Date(curso.date);
    fechaCurso.setHours(0, 0, 0, 0);

    return fechaCurso >= fechaActual;
  });

  const academicosFromProps = [...programasEducativos, ...cortosFuturos];
  const academicos = academicosFromProps.length > 0
    ? academicosFromProps
    : [...programasFromDB, ...cortosFuturosFromDB];


  return (
    <footer className="bg-background text-white py-8">
      <AliadosSection />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tech Centre Column */}
          <div>
            <h3 className="font-bold text-blue-400 mb-4 flex items-center">
              <Image
                src="/tech-center-logos/TechCentreLogoColor.png"
                alt="Tech Centre Logo"
                width={100}
                height={100}
                className="mr-2"
              />
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Formamos a los profesionales tech del futuro con programas prácticos y actualizados.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=100092748068869" className="text-white hover:text-blue-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/techcentre.co/" className="text-white hover:text-blue-400">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/tech-centrebaq/" className="text-white hover:text-blue-400">
                <LinkedInIcon className="h-5 w-5" />
              </a> 
            </div>
          </div>

          {/* Enlaces rápidos Column */}
          <div>
            <h3 className="font-bold text-white mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#quienes-somos" className="text-gray-300 hover:text-blue-400 text-sm">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/#cursos" className="text-gray-300 hover:text-blue-400 text-sm">
                  Oferta académica
                </Link>
              </li>
              <li>
                <Link href="/#testimonios" className="text-gray-300 hover:text-blue-400 text-sm">
                  Testimonios
                </Link>
              </li>              
              <li>
                <div className="text-gray-300 opacity-50 cursor-not-allowed text-sm">
                  Noticias
                </div>
              </li>
              <li>
                <div className="text-gray-300 opacity-50 cursor-not-allowed text-sm">
                  Preguntas frecuentes
                </div>
              </li>
            </ul>
          </div>
          {/* Programas Column */}
          <div>
            <h3 className="font-bold text-white mb-4">Programas y cursos</h3>
            <ul className="space-y-2">
              {academicos.length > 0 ? (
                academicos.slice(0, 6).map((programa) => (
                  <li key={programa.id}>
                    <Link href={`/programas-academicos/${programa.slug}`} className="text-gray-300 hover:text-blue-400 text-sm">
                      {'name' in programa ? programa.name : ('title' in programa ? programa.title : 'Programa')}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback a las opciones estáticas si no hay datos
                <>
                  <li>
                    <Link href="/programas-academicos/desarrollo-web" className="text-gray-300 hover:text-blue-400 text-sm">
                      Desarrollo Web
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/diseno-ux-ui" className="text-gray-300 hover:text-blue-400 text-sm">
                      Diseño UX/UI
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/cloud-computing" className="text-gray-300 hover:text-blue-400 text-sm">
                      Cloud Computing
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/curso-de-python" className="text-gray-300 hover:text-blue-400 text-sm">
                      Curso de Python
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/curso-de-figma" className="text-gray-300 hover:text-blue-400 text-sm">
                      Curso de Figma
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/analitica-datos" className="text-gray-300 hover:text-blue-400 text-sm">
                      Analítica de Datos
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contacto Column */}
          <div id="contacto">
            <h3 className="font-bold text-white mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Cra. 50 # 72-126, Centro Histórico, Barranquilla
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-2" />
                <a href="tel:+573003234567" className="text-gray-300 hover:text-blue-400 text-sm">
                  +57 300 323 4567
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-2" />
                <a href="mailto:info@techcentre.edu.co" className="text-gray-300 hover:text-blue-400 text-sm">
                  info@techcentre.edu.co
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>© 2025 · Tech Centre. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
