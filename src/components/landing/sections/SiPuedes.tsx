"use client";

import { motion, useReducedMotion } from "framer-motion";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

const steps = [
  {
    tag: "Antes · duda",
    quote: "¿Y si sí puedo?",
    text: "No tienes que saberlo todo para empezar. Solo dar el primer paso.",
  },
  {
    tag: "Durante · esfuerzo",
    quote: "Vas bien.",
    text: "Es normal sentirse así al inicio. Aquí te acompañamos paso a paso.",
  },
  {
    tag: "Después · orgullo",
    quote: "Lo lograste.",
    text: "Sales con un portafolio real y un perfil que la industria contrata.",
  },
];

export default function SiPuedes() {
  const reduce = useReducedMotion();

  return (
    <section
      id="confianza"
      className="relative overflow-hidden py-24 md:py-28"
      aria-labelledby="confianza-title"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-0 h-[360px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(63,224,160,0.1),transparent)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <SparkEyebrow>El viaje</SparkEyebrow>
          </div>
          <h2
            id="confianza-title"
            className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl"
          >
            De la duda al <span className="lv2-mint">&ldquo;lo logré&rdquo;</span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* Línea menta conectora (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-[var(--line)] md:block">
            <motion.span
              className="block h-full origin-left bg-[var(--mint)]"
              style={{ boxShadow: "0 0 8px var(--mint)" }}
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>

          <ol className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.quote} delay={i * 0.25} className="text-center md:text-left">
                <span
                  className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--mint)] bg-[var(--ink)] lv2-display text-xl text-[var(--mint)] md:mx-0"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="lv2-mono">{step.tag}</p>
                <p className="lv2-display mt-2 text-2xl text-[var(--paper)]">
                  &ldquo;{step.quote}&rdquo;
                </p>
                <p className="mt-3 leading-relaxed lv2-soft">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
