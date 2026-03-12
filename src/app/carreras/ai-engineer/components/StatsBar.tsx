"use client";

const stats = [
  {
    value: "#1",
    label: "puesto de mayor crecimiento",
    source: "LinkedIn 2025",
    color: "text-[var(--secondary)]",
  },
  {
    value: "26%",
    label: "crecimiento laboral proyectado",
    source: "BLS 2023–2033",
    color: "text-amber-400",
  },
  {
    value: "56%",
    label: "premium salarial IA",
    source: "PwC AI Jobs Barometer",
    color: "text-rose-400",
  },
];

export default function StatsBar() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="text-center p-8 rounded-2xl bg-[var(--card-background)] border border-border-color"
            >
              <span
                className={`block text-5xl md:text-6xl font-extrabold ${stat.color} font-mono leading-none mb-3`}
              >
                {stat.value}
              </span>
              <span className="block text-sm font-medium text-text-primary mb-1">
                {stat.label}
              </span>
              <span className="block text-xs text-text-muted">{stat.source}</span>
            </article>
          ))}
        </div>

        <p className="text-center text-sm text-text-muted mt-8 max-w-3xl mx-auto">
          El mercado de IA en LATAM crecerá de $5.8B a $34.6B para 2034 (CAGR
          22%). Las empresas de EE.UU. contratan talento remoto en la región con
          salarios de $36K–$112K USD/año.
        </p>
      </div>
    </section>
  );
}
