"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  AGENTES_COHORT,
  AGENTES_DEMO_EVENT,
  AGENTES_DEMO_PATH,
  AGENTES_DIAGNOSTICO_URL,
  AGENTES_PATH,
} from "../agentes/data";
import { trackAgentes } from "../agentes/track";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-24 pb-16"
      aria-labelledby="hero-title"
    >
      <motion.div className="absolute inset-0 -z-10" style={{ y: reduce ? 0 : imageY }}>
        <Image
          src="/techcentre-hero.jpg"
          alt="Estudiantes de Tech Centre en una clase presencial en Barranquilla"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,16,13,0.92)_0%,rgba(7,16,13,0.72)_50%,rgba(7,16,13,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_5%,rgba(28,90,73,0.45)_0%,transparent_60%)]" />
      </motion.div>

      <div aria-hidden="true" className="lv2-tex right-[8%] top-[14%] hidden h-40 w-40 md:block" />
      <div aria-hidden="true" className="lv2-tex right-[22%] bottom-[12%] hidden h-24 w-56 md:block" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.span
            className="inline-flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span
              aria-hidden="true"
              className="lv2-spark"
              style={{ background: "#FFB454", boxShadow: "0 0 10px #FFB454" }}
            />
            <span className="lv2-mono !text-[#FFB454]">
              PROGRAMA AVANZADO · INICIA {AGENTES_COHORT.startLabel.toUpperCase()}
            </span>
          </motion.span>

          <div className="relative mt-5">
            <motion.h1
              id="hero-title"
              className="lv2-display text-[2.5rem] leading-[1.02] text-[var(--paper)] sm:text-6xl lg:text-7xl"
              initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
              animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              Ya usas IA todos los días.{" "}
              <span style={{ color: "#FFB454" }}>Todavía no has construido nada con ella.</span>
            </motion.h1>
          </div>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed lv2-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Ingeniería de agentes, presencial en Barranquilla. Ocho semanas,
            cohorte pequeña. Primero diagnóstico de 20 minutos. Si aún dudas,
            hay clase demo el 15 de agosto.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-start gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={AGENTES_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="agentes-btn-amber"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", { section: "home_hero" })
                }
              >
                Agendar sesión de diagnóstico
              </a>
              <Link href={AGENTES_PATH} className="agentes-text-link">
                Ver el programa
              </Link>
            </div>
            <p className="agentes-cta-note">20 min · sin examen · sin pago</p>
          </motion.div>

          <motion.ul
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            <li className="flex items-center gap-2 lv2-mono">
              <span className="lv2-dot !bg-[#FFB454]" style={{ boxShadow: "0 0 8px #FFB454" }} aria-hidden="true" />
              Inicia {AGENTES_COHORT.startLabel} · cohorte pequeña
            </li>
            <li className="flex items-center gap-2 lv2-mono">
              <span className="lv2-dot !bg-[#FFB454]" style={{ boxShadow: "0 0 8px #FFB454" }} aria-hidden="true" />
              <Link href={AGENTES_DEMO_PATH} className="hover:text-[#FFB454]">
                Clase demo {AGENTES_DEMO_EVENT.dateShort}
              </Link>
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
