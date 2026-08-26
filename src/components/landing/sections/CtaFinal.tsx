"use client";

import { motion, useReducedMotion } from "framer-motion";
import CohorteBadge from "../CohorteBadge";
import { whatsappWith } from "../data";
import { RUTAS_CTA_FINAL, RUTAS_DIAGNOSTICO_URL, RUTAS_LEGAL } from "../rutas/data";
import { trackAgentes } from "../agentes/track";

const EMPRESAS_WA = whatsappWith(
  "Hola, quiero información sobre los programas de Tech Centre para empresas.",
);

export default function CtaFinal() {
  const reduce = useReducedMotion();

  return (
    <section
      id="cta"
      className="relative px-4 py-20 sm:px-6 md:py-28"
      aria-labelledby="cta-title"
    >
      <motion.div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[rgba(63,224,160,0.45)] px-6 py-16 text-center md:px-12"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(63,224,160,0.16) 0%, rgba(20,70,58,0.4) 45%, rgba(7,16,13,0.9) 100%)",
        }}
        initial={{ opacity: 0, boxShadow: "0 0 0 0 rgba(63,224,160,0)" }}
        whileInView={{
          opacity: 1,
          boxShadow: reduce
            ? "0 0 0 0 rgba(63,224,160,0)"
            : "0 0 80px -20px rgba(63,224,160,0.45)",
        }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <CohorteBadge className="relative !bg-[rgba(7,16,13,0.4)]" />

        <h2
          id="cta-title"
          className="lv2-display relative mt-6 text-4xl text-[var(--paper)] sm:text-5xl md:text-6xl"
        >
          El viaje <span className="lv2-mint">apenas comienza</span>
        </h2>
        <p className="relative mx-auto mt-5 max-w-2xl text-lg lv2-soft">
          {RUTAS_CTA_FINAL.body}
        </p>
        <div className="relative mt-9 flex flex-col items-center gap-3">
          <a
            href={RUTAS_DIAGNOSTICO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-btn px-8 py-4 text-lg"
            onClick={() =>
              trackAgentes("click_cta_diagnostico", { section: "home_cta_final" })
            }
          >
            {RUTAS_CTA_FINAL.cta}
          </a>
          <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
            {RUTAS_CTA_FINAL.note}
          </p>
          <p className="mt-4 text-sm lv2-soft">
            ¿Buscas formar a tu equipo? También llevamos estos programas dentro de
            empresas.{" "}
            <a
              href={EMPRESAS_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="agentes-mint-link"
            >
              Escríbenos
            </a>
            .
          </p>
        </div>
      </motion.div>

      <p className="mx-auto mt-8 max-w-4xl text-center text-xs leading-relaxed lv2-mute">
        {RUTAS_LEGAL}
      </p>
    </section>
  );
}
