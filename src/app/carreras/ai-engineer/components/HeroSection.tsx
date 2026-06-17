"use client";

import { ArrowRight, Clock, MapPin, Layers, Code2 } from "lucide-react";

interface HeroSectionProps {
  onEnroll: () => void;
}

const stats = [
  { value: "6", label: "meses por ruta", icon: Clock },
  { value: "18h", label: "por semana", icon: Layers },
  { value: "0", label: "experiencia previa", icon: Code2 },
  { value: "100%", label: "presencial en BAQ", icon: MapPin },
];

/* Loop / interlocking-circles brand motif */
function BrandLoop({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="22" cy="20" r="15" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="42" cy="20" r="15" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export default function HeroSection({ onEnroll }: HeroSectionProps) {
  return (
    <section className="px-4 pt-6 pb-16 md:pt-10 md:pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl brand-gradient text-white shadow-2xl">
          {/* Decorative layers */}
          <div className="absolute inset-0 brand-grid opacity-60" aria-hidden="true" />
          <div
            className="absolute -top-24 -right-24 w-[460px] h-[460px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(31,211,130,0.30), transparent 70%)" }}
            aria-hidden="true"
          />
          <BrandLoop className="absolute top-10 right-8 w-40 text-[var(--secondary)]/25 hidden md:block" />
          <BrandLoop className="absolute -bottom-10 -left-8 w-52 text-[var(--secondary)]/15" />

          <div className="relative z-10 px-6 py-16 sm:px-10 md:px-14 md:py-24">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-[var(--secondary)] mb-6 font-mono">
                <BrandLoop className="w-7 text-[var(--secondary)]" />
                Programas · Ciclo 2026
              </p>

              <h1 className="font-highlight text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6">
                Despierta el genio{" "}
                <span className="text-gradient-brand">tech que llevas dentro</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-4 max-w-2xl leading-relaxed">
                Dos rutas para ir de cero a{" "}
                <strong className="text-white font-semibold">
                  Ingeniero de Aplicaciones de IA
                </strong>
                , el perfil que la industria busca y casi nadie está formando.
              </p>
              <p className="text-base text-white/60 mb-9 max-w-xl italic">
                “El conocimiento se revela cuando te atreves a explorar.”
              </p>

              {/* Route badges */}
              <ul className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
                <li className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--secondary)]/40 bg-[var(--secondary)]/10">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)] font-mono">
                    Ruta Web
                  </span>
                  <span className="text-sm text-white/90">Construye lo que se ve</span>
                </li>
                <li aria-hidden="true" className="hidden sm:block text-white/40 font-bold text-sm">
                  o
                </li>
                <li className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--secondary)]/40 bg-[var(--secondary)]/10">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)] font-mono">
                    Ruta de Datos
                  </span>
                  <span className="text-sm text-white/90">Revela el patrón</span>
                </li>
              </ul>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  onClick={onEnroll}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Empieza a explorar
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
                <a
                  href="#programa"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/25 text-white font-medium rounded-xl hover:border-[var(--secondary)] hover:bg-white/5 transition-all duration-300"
                >
                  Conoce las rutas
                </a>
              </div>
            </div>

            {/* Stats grid */}
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-14 max-w-3xl">
              {stats.map((stat) => (
                <li
                  key={stat.label}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <stat.icon className="w-5 h-5 text-[var(--secondary)]" aria-hidden="true" />
                  <span className="text-2xl md:text-3xl font-extrabold text-white font-mono leading-none">
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/65 text-center">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>

            <p className="relative z-10 mt-8 text-sm text-white/55">
              Barranquilla · 6 h presenciales + 12 h virtuales por semana ·
              Portafolio real · Comunidad que no te suelta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
