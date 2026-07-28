"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AGENTES_DEMO_BAND, AGENTES_DEMO_EVENT, AGENTES_DEMO_PATH } from "./data";
import { trackAgentes } from "./track";

/** Banda de ancho completo de la clase demo. */
export default function DemoClassBand() {
  return (
    <section className="agentes-demo-band" aria-labelledby="demo-band-title">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="agentes-mono-label">{AGENTES_DEMO_EVENT.dateLabel}</p>
        <h2 id="demo-band-title" className="agentes-section-title mt-3">
          {AGENTES_DEMO_BAND.title}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
          {AGENTES_DEMO_BAND.body}
        </p>
        <Link
          href={AGENTES_DEMO_PATH}
          className="agentes-btn-amber mt-8 inline-flex"
          onClick={() => trackAgentes("click_cta_clase_demo", { section: "demo_band" })}
        >
          {AGENTES_DEMO_BAND.cta} · {AGENTES_DEMO_EVENT.dateShort}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="agentes-cta-note mt-4">
          Si ya sabes que quieres entrar a la cohorte, agenda el diagnóstico directo.
        </p>
      </div>
    </section>
  );
}
