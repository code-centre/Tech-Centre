"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/573005523872?text=Hola%2C%20quiero%20inscribirme%20en%20Tech%20Centre";

export default function CtaFinal() {
  const reduce = useReducedMotion();

  return (
    <section
      id="cta"
      className="relative px-4 py-20 sm:px-6 md:py-28"
      aria-labelledby="cta-title"
    >
      <motion.div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[rgba(63,224,160,0.4)] px-6 py-16 text-center md:px-12"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(63,224,160,0.22) 0%, rgba(20,70,58,0.4) 45%, rgba(7,16,13,0.9) 100%)",
        }}
        initial={{ opacity: 0, boxShadow: "0 0 0 0 rgba(63,224,160,0)" }}
        whileInView={{
          opacity: 1,
          boxShadow: reduce
            ? "0 0 0 0 rgba(63,224,160,0)"
            : "0 0 80px -20px rgba(63,224,160,0.6)",
        }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(63,224,160,0.3),transparent)]"
        />
        <h2
          id="cta-title"
          className="lv2-display relative text-4xl text-[var(--paper)] sm:text-5xl md:text-6xl"
        >
          Empieza a explorar.{" "}
          <span className="lv2-mint">El viaje apenas comienza.</span>
        </h2>
        <p className="relative mt-5 text-lg lv2-soft">
          Grupos pequeños · clases presenciales · cupos limitados.
        </p>
        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/registro" className="lv2-btn text-lg">
            Inscríbete
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-btn-secondary text-lg"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Escríbenos por WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
}
