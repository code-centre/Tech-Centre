"use client";

import { Check, X } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import {
  AGENTES_DIAGNOSTICO_URL,
  AGENTES_FIT,
} from "../agentes/data";
import { trackAgentes } from "../agentes/track";

export default function ParaQuien() {
  return (
    <section
      id="para-quien"
      className="relative py-24 md:py-28"
      aria-labelledby="para-quien-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>¿Es para ti?</SparkEyebrow>
          <h2
            id="para-quien-title"
            className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Hecho para el Constructor
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Ya programas, trabajas de lunes a viernes y usas IA todos los días.
            Lo que falta es pasar al otro lado: diseñar sistemas, no pedir código.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="agentes-fit-card h-full">
              <h3 className="agentes-fit-title agentes-fit-title-yes">Es para ti si</h3>
              <ul className="agentes-fit-list">
                {AGENTES_FIT.yes.map((item) => (
                  <li key={item}>
                    <Check className="agentes-fit-icon agentes-fit-icon-yes" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
          <Reveal delay={0.04}>
            <article className="agentes-fit-card agentes-fit-card-no h-full">
              <h3 className="agentes-fit-title agentes-fit-title-no">Todavía no es para ti si</h3>
              <ul className="agentes-fit-list">
                {AGENTES_FIT.no.map((item) => (
                  <li key={item}>
                    <X className="agentes-fit-icon agentes-fit-icon-no" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="agentes-fit-closing">
                {AGENTES_FIT.noClosing}{" "}
                <a
                  href={AGENTES_FIT.careersHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agentes-mint-link"
                >
                  {AGENTES_FIT.careersLabel}
                </a>
              </p>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <p className="agentes-needs-note mt-8 max-w-3xl">{AGENTES_FIT.pythonNote}</p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="agentes-inline-cta">
            <a
              href={AGENTES_DIAGNOSTICO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="agentes-btn-amber"
              onClick={() =>
                trackAgentes("click_cta_diagnostico", { section: "home_fit" })
              }
            >
              Agendar sesión de diagnóstico
            </a>
            <p>20 min · sin examen · sin pago</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
