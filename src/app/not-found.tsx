import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Página no encontrada | Tech Centre',
  // Una 404 no debe competir en el índice con las páginas reales.
  robots: { index: false, follow: true },
}

/** Sitios a los que de verdad puede querer ir alguien que cayó aquí. */
const DESTINOS = [
  { href: '/programas', label: 'Programas y rutas' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/blog', label: 'Blog' },
  { href: '/contacto', label: 'Contacto' },
]

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] items-center overflow-hidden">
      <Image
        src="/community/sesion-presencial.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-[0.55]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/82 via-[var(--bg-primary)]/90 to-[var(--bg-primary)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border-color)_1px,transparent_1px),linear-gradient(90deg,var(--border-color)_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            Error 404
          </span>

          <h1 className="font-highlight text-4xl font-extrabold leading-tight tracking-tight card-text-primary text-balance sm:text-5xl lg:text-6xl">
            Esta página no existe.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed card-text-muted text-pretty">
            Puede que la hayamos movido, o que el enlace traiga algo mal escrito. Si buscabas un
            programa, están todos en un solo sitio.
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link
              href="/programas"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 font-bold tracking-tight text-[#0E1116] shadow-lg shadow-secondary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-secondary/35"
            >
              Ver los programas
              <ArrowRight className="h-[19px] w-[19px] transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/agendar-diagnostico"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-secondary/50 px-6 py-3.5 font-semibold card-text-primary transition-all duration-300 hover:border-secondary hover:bg-secondary/10"
            >
              <CalendarDays className="h-[19px] w-[19px] transition-transform group-hover:scale-110" />
              Agendar diagnóstico
            </Link>
          </div>

          <nav aria-label="Otras secciones" className="pt-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {DESTINOS.map((destino) => (
                <li key={destino.href}>
                  <Link
                    href={destino.href}
                    className="text-sm card-text-muted underline-offset-4 transition-colors hover:text-secondary hover:underline"
                  >
                    {destino.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  )
}
