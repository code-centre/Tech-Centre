"use client";

import { ArrowRight } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS_DIAGNOSTICO_URL } from "../rutas/data";
import { trackAgentes } from "../agentes/track";

const PROFILES = [
  {
    code: "empezando",
    label: "Estoy empezando",
    body: "Quiero entrar al mundo tech y necesito una ruta clara.",
  },
  {
    code: "ya-programo",
    label: "Ya sé programar",
    body: "Quiero construir proyectos más serios y actualizar mi stack.",
  },
  {
    code: "aplicar-ia",
    label: "Quiero aplicar IA",
    body: "Quiero llevar estas herramientas a mi trabajo o negocio.",
  },
] as const;

function diagnosticoHref(origen: string): string {
  return `${RUTAS_DIAGNOSTICO_URL}?origen=${origen}`;
}

/**
 * Calificación amable, después de programas, método y prueba.
 * Ayuda a reconocerse, no a filtrarse.
 */
export default function PorDondeEmpiezas() {
  return (
    <section
      id="por-donde-empiezas"
      className="relative scroll-mt-24 py-24 md:py-28"
      aria-labelledby="por-donde-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Tu punto de entrada</SparkEyebrow>
          <h2
            id="por-donde-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            ¿Por dónde <span className="lv2-mint">empiezas?</span>
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PROFILES.map((profile, index) => (
            <li key={profile.code}>
              <Reveal delay={index * 0.06} className="h-full">
                <a
                  href={diagnosticoHref(profile.code)}
                  className="lv2-card group flex h-full flex-col p-6 no-underline transition-colors md:p-7"
                  onClick={() =>
                    trackAgentes("click_cta_diagnostico", {
                      section: `home_perfil_${profile.code}`,
                    })
                  }
                >
                  <p className="lv2-mono !text-[var(--mint)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="lv2-display mt-4 text-2xl text-[var(--paper)]">
                    {profile.label}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed lv2-soft">
                    {profile.body}
                  </p>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.14}>
          <p className="mt-10">
            <a
              href={RUTAS_DIAGNOSTICO_URL}
              className="inline-flex items-center gap-2 border-b border-white/20 pb-0.5 text-[15px] lv2-soft transition-colors hover:border-[var(--mint)] hover:text-[var(--mint)]"
              onClick={() =>
                trackAgentes("click_cta_diagnostico", {
                  section: "home_por_donde_empiezas",
                })
              }
            >
              Encuentra tu punto de entrada
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
