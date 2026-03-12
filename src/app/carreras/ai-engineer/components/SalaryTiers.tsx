"use client";

const tiers = [
  {
    level: "Graduado del programa",
    local: "$3–5M COP",
    localUsd: "$8K–$15K",
    remote: "$15–25K",
    note: "Con portafolio; 3–6 meses de búsqueda",
  },
  {
    level: "+6 meses experiencia",
    local: "$4–8M COP",
    localUsd: "$12K–$24K",
    remote: "$25–40K",
    note: "Junior establecido, proyectos en producción",
  },
  {
    level: "+1 año experiencia",
    local: "$6–12M COP",
    localUsd: "$18K–$36K",
    remote: "$36–60K",
    note: "Mid-level, puede liderar módulos",
  },
  {
    level: "+2 años experiencia",
    local: "$10–20M COP",
    localUsd: "$30K–$60K",
    remote: "$60–112K",
    note: "Senior, arquitecto de soluciones IA",
  },
];

export default function SalaryTiers() {
  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            ¿Cuánto puedes ganar?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Proyección salarial basada en datos reales de Glassdoor,
            LinkedIn y PwC para Colombia y el mercado remoto (USD/año).
          </p>
        </header>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl border border-border-color overflow-hidden bg-[var(--card-background)] shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10 border-b border-border-color">
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                  Nivel
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                  Local (COP)
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                  Local (USD)
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                  Remoto (USD)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {tiers.map((tier) => (
                <tr key={tier.level} className="hover:bg-[var(--primary)]/5 dark:hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-text-primary">
                      {tier.level}
                    </span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {tier.note}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary font-mono">
                    {tier.local}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary font-mono">
                    {tier.localUsd}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                    {tier.remote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {tiers.map((tier) => (
            <article
              key={tier.level}
              className="rounded-xl p-5 bg-[var(--card-background)] border border-border-color shadow-sm"
            >
              <h3 className="text-sm font-bold text-text-primary mb-1">
                {tier.level}
              </h3>
              <p className="text-xs text-text-muted mb-3">{tier.note}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">
                    Local COP
                  </span>
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {tier.local}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">
                    Local USD
                  </span>
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {tier.localUsd}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">
                    Remoto USD
                  </span>
                  <span className="text-sm font-bold text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                    {tier.remote}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="text-center text-xs text-text-muted mt-8">
          Fuente: Glassdoor, LinkedIn Salary Insights, PwC AI Jobs Barometer
          2025. Salarios remotos reflejan empresas de EE.UU. contratando en
          LATAM.
        </p>
      </div>
    </section>
  );
}
