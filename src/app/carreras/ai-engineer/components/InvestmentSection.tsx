"use client";

import { ArrowRight, Check } from "lucide-react";

interface InvestmentSectionProps {
  onEnroll: () => void;
}

const modules = [
  { name: "Fundamentos Tech", duration: "1 sem", price: "$200,000", installments: "—" },
  { name: "Mód. 1: Programación", duration: "6 sem", price: "$600,000", installments: "$300,000 × 2" },
  { name: "Mód. 2: Backend & Apps", duration: "6 sem", price: "$600,000", installments: "$300,000 × 2" },
  { name: "Mód. 3: Agentes de IA", duration: "6 sem", price: "$800,000", installments: "$400,000 × 2" },
  { name: "Mód. 4: Cloud & Despliegue", duration: "6 sem", price: "$800,000", installments: "$400,000 × 2" },
];

const careerPlans = [
  {
    plan: "Pago único",
    price: "$2,400,000",
    detail: "Pago total al inscribirse",
    savings: "20% vs. individual",
    featured: true,
  },
  {
    plan: "6 cuotas",
    price: "$3,000,000",
    detail: "6 pagos de $500,000",
    savings: "Mismo precio, flexible",
    featured: false,
  },
  {
    plan: "Estudiante",
    price: "$1,800,000",
    detail: "Con carnet vigente",
    savings: "40% vs. individual",
    featured: false,
  },
];

const scenarios = [
  {
    title: "Empiezo desde cero",
    description:
      "Toma la carrera completa por $2,400,000 (pago único). Es la mejor relación calidad-precio y te lleva de cero a desplegar agentes de IA.",
  },
  {
    title: "Ya sé programar en Python",
    description:
      "Toma solo los módulos 3 (Agentes de IA) y 4 (Cloud & Despliegue) por $1,600,000. Saltas lo que ya sabes.",
  },
  {
    title: "Quiero probar primero",
    description:
      "Toma Fundamentos Tech ($200,000) o el Módulo 1 ($600,000). Si te gusta, puedes aplicar ese valor como crédito hacia la carrera completa dentro de los 30 días.",
  },
];

const comparisons = [
  "Uninorte — Diplomado Desarrollo de Software: $3,350,000 COP",
  "Uninorte — Diplomado en IA y Datos: $3,500,000+ COP",
  "U. Simón Bolívar — Semestre Ing. Sistemas: $5,914,000 COP",
  "BIT Institute — Bootcamp IA: ~$4,900,000 COP",
  "Bootcamps internacionales: $15M–$70M COP",
];

export default function InvestmentSection({ onEnroll }: InvestmentSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Inversión
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Puedes tomar la carrera completa con un descuento importante, o
            inscribirte en los módulos individuales que necesites.
          </p>
        </header>

        {/* Module pricing */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Precio por módulo individual
          </h3>
          <div className="rounded-2xl border border-border-color bg-background overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_100px_130px_150px] gap-4 px-6 py-3 bg-[var(--secondary)]/5 border-b border-border-color">
              <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono">
                Módulo
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono text-right">
                Duración
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono text-right">
                Precio
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono text-right">
                2 cuotas de
              </span>
            </div>
            {modules.map((mod) => (
              <div
                key={mod.name}
                className="flex flex-col md:grid md:grid-cols-[1fr_100px_130px_150px] gap-1 md:gap-4 px-6 py-4 border-b border-border-color last:border-b-0"
              >
                <span className="text-sm font-medium text-text-primary">
                  {mod.name}
                </span>
                <span className="text-sm text-text-muted md:text-right">
                  {mod.duration}
                </span>
                <span className="text-sm font-bold text-[var(--secondary)] font-mono md:text-right">
                  {mod.price}
                </span>
                <span className="text-sm text-text-muted md:text-right">
                  {mod.installments}
                </span>
              </div>
            ))}
            <div className="px-6 py-4 bg-[var(--card-background)]/50 border-t border-border-color">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="text-sm font-bold text-text-primary">
                  Total 4 módulos por separado
                </span>
                <span className="text-lg font-bold text-text-muted font-mono">
                  $3,000,000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Career pricing */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Carrera completa (Fundamentos + 4 módulos)
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {careerPlans.map((plan) => (
              <article
                key={plan.plan}
                className={`relative p-6 rounded-2xl border ${
                  plan.featured
                    ? "border-[var(--secondary)] bg-[var(--secondary)]/5"
                    : "border-border-color bg-background"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-6 text-xs font-bold text-[var(--primary)] bg-[var(--secondary)] px-3 py-1 rounded-full">
                    Recomendado
                  </span>
                )}
                <h4 className="text-lg font-bold text-text-primary mb-1">
                  {plan.plan}
                </h4>
                <span className="block text-3xl font-extrabold text-[var(--secondary)] font-mono mb-2">
                  {plan.price}
                </span>
                <p className="text-sm text-text-muted mb-2">{plan.detail}</p>
                <p className="text-xs font-semibold text-[var(--secondary)]">
                  {plan.savings}
                </p>
              </article>
            ))}
          </div>
          <p className="text-xs text-text-muted/70 mt-4 text-center">
            Todos los precios en COP. Carrera completa equivale a ~$415–$690 USD
            según plan.
          </p>
        </div>

        {/* Scenarios */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            ¿No sabes cuál elegir?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((s) => (
              <article
                key={s.title}
                className="p-6 rounded-2xl bg-[var(--card-background)] border border-border-color"
              >
                <h4 className="text-base font-bold text-text-primary mb-2">
                  {s.title}
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  {s.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Price comparison */}
        <div className="rounded-2xl bg-[var(--card-background)] border border-border-color p-6 mb-10">
          <h4 className="text-base font-bold text-text-primary mb-4">
            Contexto de precios: ¿cómo se compara?
          </h4>
          <ul className="space-y-2 mb-4">
            {comparisons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="text-text-muted/40 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-muted leading-relaxed">
            A <strong className="text-[var(--secondary)]">$2,400,000 COP</strong> por la
            carrera completa, este programa ofrece ~275 horas de formación
            presencial especializada — más horas y más enfocado que un diplomado
            universitario, a un precio menor.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onEnroll}
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg cursor-pointer"
          >
            Inscribirme ahora
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
