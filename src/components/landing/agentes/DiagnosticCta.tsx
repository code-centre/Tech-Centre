"use client";

import { MessageCircle } from "lucide-react";
import {
  AGENTES_CLOSING,
  AGENTES_DIAGNOSTICO_URL,
  AGENTES_DIAGNOSTICO_WA,
} from "./data";
import { trackAgentes } from "./track";

interface DiagnosticCtaProps {
  section?: string;
}

/** Bloque de cierre con enlace a la agenda de diagnóstico. */
export default function DiagnosticCta({ section = "closing" }: DiagnosticCtaProps) {
  return (
    <section className="agentes-diagnostic" aria-labelledby="diagnostic-title">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 id="diagnostic-title" className="agentes-section-title">
          {AGENTES_CLOSING.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">
          {AGENTES_CLOSING.body}
        </p>

        <a
          href={AGENTES_DIAGNOSTICO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="agentes-btn-amber agentes-btn-lg mt-10"
          onClick={() => trackAgentes("click_cta_diagnostico", { section })}
        >
          {AGENTES_CLOSING.cta}
        </a>
        <p className="agentes-cta-note mt-3">20 min · sin examen · sin pago</p>

        <p className="mt-5 text-sm text-[var(--text-muted)]">
          {AGENTES_CLOSING.whatsappNote}{" "}
          <a
            href={AGENTES_DIAGNOSTICO_WA}
            target="_blank"
            rel="noopener noreferrer"
            className="agentes-mint-link inline-flex items-center gap-1.5"
            onClick={() => trackAgentes("click_whatsapp", { section })}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
