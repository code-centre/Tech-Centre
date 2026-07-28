"use client";

import { AGENTES_DIAGNOSTICO_URL } from "./data";
import { trackAgentes } from "./track";

interface InlineDiagnosticCtaProps {
  section: string;
  note?: string;
}

/** CTA compacto para insertar después de bloques de alta conversión. */
export default function InlineDiagnosticCta({
  section,
  note = "20 min · sin examen · sin pago",
}: InlineDiagnosticCtaProps) {
  return (
    <div className="agentes-inline-cta">
      <a
        href={AGENTES_DIAGNOSTICO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="agentes-btn-amber"
        onClick={() => trackAgentes("click_cta_diagnostico", { section })}
      >
        Agendar sesión de diagnóstico
      </a>
      <p>{note}</p>
    </div>
  );
}
