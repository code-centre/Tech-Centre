"use client";

import { motion, useReducedMotion } from "framer-motion";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

export default function Manifiesto() {
  const reduce = useReducedMotion();

  return (
    <section
      id="manifiesto"
      className="relative overflow-hidden py-24 md:py-32"
      aria-labelledby="manifiesto-title"
    >
      {/* Destello menta detrás del statement */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(63,224,160,0.14),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal className="flex justify-center">
          <SparkEyebrow>El método</SparkEyebrow>
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            id="manifiesto-title"
            className="lv2-display mt-6 text-4xl text-[var(--paper)] sm:text-5xl md:text-6xl"
          >
            El genio no se enseña.{" "}
            <motion.span
              initial={{ color: reduce ? "#3FE0A0" : "#8FA59C" }}
              whileInView={{ color: "#3FE0A0" }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ textShadow: "0 0 24px rgba(63,224,160,0.35)" }}
            >
              Se revela.
            </motion.span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-[60ch] text-lg leading-relaxed lv2-soft">
            La forma de programar cambió. Ya no basta con escribir código: el
            oficio ahora es construir sistemas confiables alrededor de la
            inteligencia artificial.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mx-auto mt-5 max-w-[60ch] text-lg leading-relaxed lv2-soft">
            Eso es lo que formamos. No vendemos cursos de un lenguaje: te
            llevamos de cero al oficio que el mercado contrata, aquí, en el
            Caribe, acompañándote paso a paso.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
