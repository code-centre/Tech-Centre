"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/573005523872?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20programas%20de%20Tech%20Centre";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Parallax sutil: la imagen se mueve ~8% más lento que el scroll.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-24 pb-16"
      aria-labelledby="hero-title"
    >
      {/* Foto de fondo oscurecida con parallax */}
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

      {/* Texturas de bloques menta */}
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
            <span className="lv2-mono">Centro de Tecnología del Caribe</span>
          </motion.span>

          {/* Titular revelado por barrido de luz menta */}
          <div className="relative mt-5">
            <motion.h1
              id="hero-title"
              className="lv2-display text-[2.5rem] leading-[1.02] text-[var(--paper)] sm:text-6xl lg:text-7xl"
              initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
              animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              Despierta el genio{" "}
              <span className="lv2-mint">tech que llevas dentro</span>
            </motion.h1>
            {!reduce && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(63,224,160,0.55),transparent)] blur-md"
                initial={{ left: "-10%", opacity: 0 }}
                animate={{ left: ["-10%", "110%"], opacity: [0, 1, 0] }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
            )}
          </div>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed lv2-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Aprende a construir con inteligencia artificial, de cero al perfil que
            la industria busca. Presencial, en el Caribe, acompañándote paso a
            paso.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <Link href="#rutas" className="lv2-btn">
              Empieza a explorar
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lv2-btn-secondary"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Habla con nosotros
            </a>
          </motion.div>

          <motion.ul
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            <li className="flex items-center gap-2 lv2-mono">
              <span className="lv2-dot" aria-hidden="true" />
              Clases presenciales en Barranquilla
            </li>
            <li className="flex items-center gap-2 lv2-mono">
              <span className="lv2-dot" aria-hidden="true" />
              Inscripciones abiertas
            </li>
          </motion.ul>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#manifiesto"
        aria-label="Desplázate para descubrir más"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[var(--mute)] transition-colors hover:text-[var(--mint)]"
      >
        <ArrowDown className="lv2-cue h-6 w-6" aria-hidden="true" />
      </a>
    </section>
  );
}
