'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, InstagramIcon } from 'lucide-react'
import Image from 'next/image'
import { LinkedInIcon } from './Icons'
import { useSupabaseClient } from '@/lib/supabase'
import type { Program } from '@/types/programs'

interface FooterProps {
  slug?: string;
  programasEducativos?: Program[];
}
export function Footer() {
  const supabase = useSupabaseClient()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('id, name, code, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error

        setPrograms(data as Program[] || [])
      } catch (err) {
        console.error('Error cargando programas para el footer:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [supabase])

  return (
    <footer className="card-background text-text-primary py-8 border-t border-border-color">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tech Centre Column */}
          <div>
            <h3 className="font-bold text-secondary mb-4 flex items-center">
              <Image
                src="/tech-center-logos/logo-primary.png"
                alt="Tech Centre Logo"
                width={100}
                height={100}
                className="mr-2"
              />
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Formamos a los profesionales tech del futuro con programas prácticos y actualizados.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=100092748068869" className="text-text-primary hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/techcentre.co/" className="text-text-primary hover:text-secondary transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/tech-centrebaq/" className="text-text-primary hover:text-secondary transition-colors">
                <LinkedInIcon className="h-5 w-5" />
              </a> 
            </div>
          </div>

          {/* Enlaces rápidos Column */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#quienes-somos" className="text-text-muted hover:text-secondary text-sm transition-colors">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/#cursos" className="text-text-muted hover:text-secondary text-sm transition-colors">
                  Oferta académica
                </Link>
              </li>
              <li>
                <Link href="/#testimonios" className="text-text-muted hover:text-secondary text-sm transition-colors">
                  Testimonios
                </Link>
              </li>              
              <li>
                <div className="text-text-muted opacity-50 cursor-not-allowed text-sm">
                  Noticias
                </div>
              </li>
              <li>
                <div className="text-text-muted opacity-50 cursor-not-allowed text-sm">
                  Preguntas frecuentes
                </div>
              </li>
            </ul>
          </div>
          {/* Programas Column */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">Programas y cursos</h3>
            {loading ? (
              <ul className="space-y-2">
                <li className="text-text-muted text-sm">Cargando programas...</li>
              </ul>
            ) : programs.length > 0 ? (
              <ul className="space-y-2">
                {programs.map((programa) => (
                  <li key={programa.id}>
                    <Link 
                      href={`/programas-academicos/${programa.slug || programa.code}`} 
                      className="text-text-muted hover:text-secondary text-sm transition-colors"
                    >
                      {programa.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    href="/programas-academicos" 
                    className="text-text-muted hover:text-secondary text-sm font-medium transition-colors"
                  >
                    Ver todos →
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2">
                <li>
                  <Link href="/programas-academicos" className="text-text-muted hover:text-secondary text-sm transition-colors">
                    Ver programas
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Contacto Column */}
          <div id="contacto">
            <h3 className="font-bold text-text-primary mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                <span className="text-text-muted text-sm">
                  Cra. 50 # 72-126, Centro Histórico, Barranquilla
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-secondary mr-2" />
                <a href="tel:+573003234567" className="text-text-muted hover:text-secondary text-sm transition-colors">
                  +57 300 552 3872
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-secondary mr-2" />
                <a href="mailto:info@techcentre.edu.co" className="text-text-muted hover:text-secondary text-sm transition-colors">
                  admisiones@techcentre.co
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border-color mt-8 pt-6 text-center text-text-muted text-sm">
          <p>© 2025 · Tech Centre. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
