"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { RUTAS_DIAGNOSTICO_URL, RUTAS_HERO } from "../rutas/data";
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
            <span aria-hidden="true" className="lv2-spark" />
            <span className="lv2-mono !text-[var(--mint)]">
              {RUTAS_HERO.eyebrow.toUpperCase()}
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
              Dos rutas para entrar a{" "}
              <span className="lv2-mint">la industria que define esta década</span>
            </motion.h1>
          </div>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed lv2-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {RUTAS_HERO.subtitle}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-start gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={RUTAS_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lv2-btn"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", { section: "home_hero" })
                }
              >
                {RUTAS_HERO.primaryCta}
              </a>
              <a href="#rutas" className="lv2-btn-secondary">
                {RUTAS_HERO.secondaryCta}
              </a>
            </div>
            <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
              {RUTAS_HERO.primaryNote}
            </p>
          </motion.div>

          <motion.ul
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            <li className="flex items-center gap-2 lv2-mono">
              <span className="lv2-dot" aria-hidden="true" />
              Ruta Producto · productos y agentes de IA
            </li>
            <li className="flex items-center gap-2 lv2-mono">
              <span
                className="lv2-dot !bg-[var(--cyan)]"
                style={{ boxShadow: "0 0 8px var(--cyan)" }}
                aria-hidden="true"
              />
              Ruta Datos · datos y machine learning
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
