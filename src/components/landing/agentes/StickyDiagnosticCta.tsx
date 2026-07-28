"use client";

import { useEffect, useState } from "react";
import { AGENTES_DIAGNOSTICO_URL } from "./data";
import { trackAgentes } from "./track";

/** Barra fija en móvil para no perder el CTA en páginas largas. */
export default function StickyDiagnosticCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const nearBottom = max > 0 && y / max > 0.88;
      setVisible(y > 420 && !nearBottom);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="agentes-sticky-cta" role="region" aria-label="Agendar diagnóstico">
      <a
        href={AGENTES_DIAGNOSTICO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="agentes-btn-amber"
        onClick={() => trackAgentes("click_cta_diagnostico", { section: "sticky_mobile" })}
      >
        Agendar diagnóstico
      </a>
      <p>20 min · sin examen · sin pago</p>
    </div>
  );
}
