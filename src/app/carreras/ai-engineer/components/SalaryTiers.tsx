"use client";

import { TrendingUp } from "lucide-react";

const tiers = [
  {
    level: "Empleo local Colombia (junior tech + IA)",
    salary: "$8K–$15K USD",
    cop: "$3M–$5M COP/mes",
    note: "Más probable al iniciar",
    highlight: false,
  },
  {
    level: "Nearshoring LATAM → EE.UU. (junior/mid)",
    salary: "$36K–$60K USD",
    cop: "$12M–$20M COP/mes",
    note: "Alcanzable en 6–12 meses de experiencia",
    highlight: true,
  },
  {
    level: "Remoto para empresa de EE.UU. (senior)",
    salary: "$60K–$112K USD",
    cop: "$20M–$38M COP/mes",
    note: "Requiere 1–2 años de experiencia",
    highlight: false,
  },
  {
    level: "Freelance / consultoría IA",
    salary: "$15K–$50K USD",
    cop: "$5M–$17M COP/mes",
    note: "Variable según clientes",
    highlight: false,
  },
  {
    level: "Emprendimiento con IA",
    salary: "Variable",
    cop: "Alto impacto",
    note: "Ahorro significativo en desarrollo",
    highlight: false,
  },
];

export default function SalaryTiers() {
  return (
    <section className="py-20 px-4 bg-[var(--card-background)]/50">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Retorno de inversión: expectativas reales
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Creemos en la transparencia. No te vamos a prometer que al terminar
            ganarás $150K dólares. Lo que sí podemos mostrarte son los
            escenarios reales.
          </p>
        </header>

        <div className="rounded-2xl border border-border-color bg-background overflow-hidden mb-8">
          <div className="hidden md:grid grid-cols-[1fr_150px_180px_200px] gap-4 px-6 py-4 bg-[var(--secondary)]/5 border-b border-border-color">
            <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono">
              Escenario
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono text-right">
              Salario anual
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono text-right">
              Salario mensual
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-text-muted font-mono text-right">
              Nota
            </span>
          </div>

          {tiers.map((tier) => (
            <div
              key={tier.level}
              className={`flex flex-col md:grid md:grid-cols-[1fr_150px_180px_200px] gap-2 md:gap-4 px-6 py-5 border-b border-border-color last:border-b-0 ${
                tier.highlight ? "bg-[var(--secondary)]/5" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {tier.highlight && (
                  <TrendingUp className="w-4 h-4 text-[var(--secondary)] shrink-0" />
                )}
                <span className="text-sm font-medium text-text-primary">
                  {tier.level}
                </span>
              </div>
              <span className="text-sm font-bold text-[var(--secondary)] font-mono md:text-right">
                {tier.salary}
              </span>
              <span className="text-sm text-text-muted md:text-right">
                {tier.cop}
              </span>
              <span className="text-xs text-text-muted/70 md:text-right">
                {tier.note}
              </span>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-[var(--secondary)]/5 border border-[var(--secondary)]/20 text-center">
          <p className="text-sm text-text-muted leading-relaxed max-w-2xl mx-auto">
            Incluso en el escenario más conservador ($3M COP/mes), la inversión
            de la carrera completa ($2.4M COP){" "}
            <strong className="text-text-primary">
              se recupera en el primer mes de empleo
            </strong>
            . Y si tomas un solo módulo ($600K–$800K COP), el retorno es
            prácticamente inmediato.
          </p>
        </div>
      </div>
    </section>
  );
}
