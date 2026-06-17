'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Facebook, InstagramIcon, MessageCircle } from 'lucide-react'
import { LinkedInIcon } from './Icons'
import EcosistemaStrip from './landing/EcosistemaStrip'
import { CONTACT } from './landing/data'

const navLinks = [
  { href: '/programas', label: 'Programas' },
  { href: '/metodologia', label: 'Cómo aprendes' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/blog', label: 'Blog' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/empleabilidad', label: 'Empleabilidad' },
  { href: '/inversion', label: 'Inversión' },
  { href: '/faq', label: 'FAQ' },
]

export function Footer() {
  return (
    <footer
      className="landing-v2 relative z-40"
      style={{ background: 'var(--ink)', backgroundImage: 'none' }}
    >
      <EcosistemaStrip />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Marca */}
          <div className="md:col-span-5">
            <Image
              src="/tech-center-logos/logo-blanco-extendido.png"
              alt="Tech Centre"
              width={170}
              height={42}
              className="h-10 w-auto"
            />
            <p className="lv2-display mt-5 max-w-xs text-lg text-[var(--paper)]">
              Despierta el genio tech que llevas dentro.{' '}
              <span className="lv2-mint">Desde el Caribe hacia el futuro.</span>
            </p>
            <div className="mt-6 flex gap-3">
              <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--soft)] transition-colors hover:border-[var(--mint)] hover:text-[var(--mint)]">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={CONTACT.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--soft)] transition-colors hover:border-[var(--mint)] hover:text-[var(--mint)]">
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--soft)] transition-colors hover:border-[var(--mint)] hover:text-[var(--mint)]">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navegar */}
          <nav className="md:col-span-3" aria-label="Navegación del pie de página">
            <h2 className="lv2-mono mb-4">Navegar</h2>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm lv2-soft transition-colors hover:text-[var(--mint)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div className="md:col-span-4">
            <h2 className="lv2-mono mb-4">Contacto</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mint)]" aria-hidden="true" />
                <span className="text-sm lv2-soft">{CONTACT.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-[var(--mint)]" aria-hidden="true" />
                <a href={`tel:+${CONTACT.whatsapp}`} className="text-sm lv2-soft transition-colors hover:text-[var(--mint)]">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-[var(--mint)]" aria-hidden="true" />
                <a href={`mailto:${CONTACT.email}`} className="text-sm lv2-soft transition-colors hover:text-[var(--mint)]">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="lv2-btn-secondary mt-1 inline-flex text-sm">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-sm lv2-mute sm:flex-row">
          <p>© 2026 · Tech Centre. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/terminos-y-condiciones" className="transition-colors hover:text-[var(--mint)]">
              Términos
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/aviso-de-privacidad" className="transition-colors hover:text-[var(--mint)]">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
