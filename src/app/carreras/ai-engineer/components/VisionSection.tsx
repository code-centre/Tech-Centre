"use client";

export default function VisionSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-4 font-mono">
          Nuestra visión
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
          Barranquilla como hub de talento AI
        </h2>
        <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
          Colombia está en una posición única: zona horaria alineada con
          EE.UU., talento joven en crecimiento, y costos que permiten a empresas
          norteamericanas contratar AI Engineers remotos a un 60–70% del costo
          de hacerlo en casa. Este programa es el primer paso para posicionar a
          Barranquilla como el centro de talento AI de la Costa Caribe.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {[
            { stat: "76%", label: "de empresas de EE.UU. con nearshore planean contratar más en LATAM" },
            { stat: "84%", label: "de empleadores LATAM aceleran upskilling en IA" },
            { stat: "22%", label: "CAGR del mercado de IA en LATAM hasta 2034" },
          ].map((item) => (
            <article
              key={item.label}
              className="p-6 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm"
            >
              <span className="block text-3xl font-extrabold text-[var(--primary)] dark:text-[var(--secondary)] font-mono leading-none mb-2">
                {item.stat}
              </span>
              <span className="text-xs text-text-muted leading-snug">
                {item.label}
              </span>
            </article>
          ))}
        </div>

        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm">
          <span className="text-sm text-text-muted">
            Una iniciativa de
          </span>
          <span className="text-sm font-bold text-text-primary">
            Costa Digital
          </span>
          <span className="text-sm text-text-muted">&middot;</span>
          <span className="text-sm font-bold text-text-primary">
            Tech Centre
          </span>
        </div>
      </div>
    </section>
  );
}
