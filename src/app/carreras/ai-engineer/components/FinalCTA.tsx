"use client";

import { ArrowRight } from "lucide-react";

interface FinalCTAProps {
  onEnroll: () => void;
}

export default function FinalCTA({ onEnroll }: FinalCTAProps) {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--secondary)]/5 to-background">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-bold tracking-widest uppercase text-[var(--secondary)] mb-6 font-mono">
          Tu siguiente paso
        </p>

        <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-6 leading-tight">
          El mercado de IA crece al 30% anual.
        </h2>

        <div className="space-y-2 mb-10">
          <p className="text-lg text-text-muted">
            Hay 500,000+ vacantes abiertas globalmente.
          </p>
          <p className="text-lg text-text-muted">
            Barranquilla puede ser parte de esa historia.
          </p>
          <p className="text-xl font-bold text-text-primary mt-4">
            Tu siguiente paso empieza aquí.
          </p>
        </div>

        <button
          onClick={onEnroll}
          className="btn-primary inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          Inscribirme en AI Engineer
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
