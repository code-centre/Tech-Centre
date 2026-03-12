"use client";

import { MapPin, Globe, Users } from "lucide-react";

export default function VisionSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Desde Barranquilla para Latinoamérica
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Barranquilla como hub exportador de talento de IA
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <article className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card-background)] border border-border-color">
            <MapPin className="w-8 h-8 text-[var(--secondary)] mb-4" />
            <h3 className="font-bold text-text-primary mb-2">
              Ubicación estratégica
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Alineación horaria con EE.UU., costo de vida competitivo y
              ecosistema tech emergente posicionan a Barranquilla como centro
              estratégico.
            </p>
          </article>

          <article className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card-background)] border border-border-color">
            <Globe className="w-8 h-8 text-[var(--secondary)] mb-4" />
            <h3 className="font-bold text-text-primary mb-2">
              Nearshoring #1
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Latinoamérica es el destino #1 de nearshoring para empresas de
              EE.UU. El 76% planea contratar más talento en la región en 2026,
              con ahorro del 60–70%.
            </p>
          </article>

          <article className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card-background)] border border-border-color">
            <Users className="w-8 h-8 text-[var(--secondary)] mb-4" />
            <h3 className="font-bold text-text-primary mb-2">
              Comunidad Costa Digital
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Acceso a{" "}
              <a
                href="https://costadigital.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--secondary)] underline underline-offset-2"
              >
                costadigital.org
              </a>
              , el ecosistema tech de Barranquilla con cientos de profesionales
              activos que han recorrido el mismo camino.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
