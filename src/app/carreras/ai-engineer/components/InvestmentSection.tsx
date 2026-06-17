"use client";

import { ArrowRight, Check } from "lucide-react";

interface InvestmentSectionProps {
  onEnrollCareer: () => void;
  onEnrollModule: (moduleName: string) => void;
}

const modules = [
  { name: "Etapa 1 · Fundamentos", price: 800000, duration: "Programar desde cero" },
  { name: "Etapa 2 · Especialidad (Web o Datos)", price: 1100000, duration: "Desarrollo web / Ing. de datos" },
  { name: "Etapa 3 · IA aplicada", price: 1300000, duration: "Agentes, RAG y evals" },
  { name: "Etapa 4 · Despliegue seguro", price: 1200000, duration: "Servidores, nube y seguridad" },
];

const totalIndividual = modules.reduce((sum, m) => sum + m.price, 0);
const careerPrice = 3600000;

function fmt(n: number) {
  return "$" + n.toLocaleString("es-CO");
}

export default function InvestmentSection({
  onEnrollCareer,
  onEnrollModule,
}: InvestmentSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
            Inversión
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Puedes tomar una etapa individual o inscribirte en la ruta completa
            (Web o Datos) con descuento.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Individual modules */}
          <div className="rounded-2xl border border-border-color bg-[var(--card-background)] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border-color">
              <h3 className="text-lg font-bold text-text-primary">
                Etapas individuales
              </h3>
              <p className="text-sm text-text-muted mt-1">
                Toma solo las que necesites
              </p>
            </div>
            <div className="divide-y divide-border-color">
              {modules.map((mod) => (
                <div
                  key={mod.name}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <span className="text-sm font-medium text-text-primary">
                      {mod.name}
                    </span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {mod.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-text-primary font-mono">
                      {fmt(mod.price)}
                    </span>
                    <button
                      onClick={() => onEnrollModule(mod.name)}
                      className="text-xs font-semibold text-[var(--primary)] dark:text-[var(--secondary)] hover:underline cursor-pointer"
                    >
                      Inscribirme
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--primary)]/6 dark:bg-[var(--secondary)]/8 border-t border-border-color">
              <span className="text-sm font-semibold text-text-primary">
                Total por separado
              </span>
              <span className="text-sm font-bold text-text-primary font-mono line-through opacity-60">
                {fmt(totalIndividual)}
              </span>
            </div>
          </div>

          {/* Career bundle */}
          <div className="relative pt-4">
            <div className="absolute top-0 right-6 z-10">
              <span className="inline-block px-4 py-1.5 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white dark:text-gray-900 text-xs font-bold rounded-full shadow-md">
                Ahorra {fmt(totalIndividual - careerPrice)}
              </span>
            </div>
          <div className="rounded-2xl border-2 border-[var(--primary)] dark:border-[var(--secondary)] bg-[var(--card-background)] overflow-hidden shadow-lg">
            <div className="px-6 pt-6 pb-4 border-b border-border-color">
              <h3 className="text-lg font-bold text-text-primary">
                Ruta completa
              </h3>
              <p className="text-sm text-text-muted mt-1">
                4 etapas · 6 meses + beneficios exclusivos
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-text-primary font-mono">
                  {fmt(careerPrice)}
                </span>
                <span className="text-sm text-text-muted line-through">
                  {fmt(totalIndividual)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-4 font-mono">
                Incluye
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Las 4 etapas completas (6 meses, 18 h/sem)",
                  "Mentoría presencial en Barranquilla",
                  "Proyectos reales y portafolio desplegado",
                  "Certificado de Tech Centre",
                  "Comunidad de egresados que no te suelta",
                  "Plan de pago en 3 o 6 cuotas",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)] mt-0.5 shrink-0" />
                    <span className="text-sm text-text-muted">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onEnrollCareer}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl cursor-pointer"
              >
                Inscribirme en la ruta
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-xs text-text-muted mt-4">
                Planes de pago: 3 cuotas de {fmt(1200000)} o
                6 cuotas de {fmt(600000)}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
