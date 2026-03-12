"use client";

import { ArrowRight } from "lucide-react";

interface FinalCTAProps {
  onEnroll: () => void;
}

export default function FinalCTA({ onEnroll }: FinalCTAProps) {
  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-6 leading-tight">
          Tu futuro en IA empieza hoy
        </h2>
        <p className="text-lg text-text-muted mb-4 max-w-xl mx-auto">
          No necesitas permiso, ni un título especial, ni años de experiencia.
          Necesitas decidirte y empezar.
        </p>
        <p className="text-base text-text-muted mb-10 max-w-lg mx-auto">
          25 semanas. 100+ horas de clase en vivo. Portafolio real. Comunidad
          para toda la vida.
        </p>

        <button
          onClick={onEnroll}
          className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          Apartar mi cupo ahora
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="mt-6 text-sm text-text-muted">
          Próximo inicio: Abril 2026 &middot; Cupos limitados
        </p>
      </div>
    </section>
  );
}
