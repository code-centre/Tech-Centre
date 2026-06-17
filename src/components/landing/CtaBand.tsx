"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { CONTACT } from "./data";

interface CtaBandProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
}

/** Banda de cierre luminosa con glow menta. */
export default function CtaBand({
  title,
  highlight,
  subtitle = "Grupos pequeños · clases presenciales · cupos limitados.",
  primaryLabel = "Inscríbete",
  primaryHref = "/inscripcion",
}: CtaBandProps) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-4 py-20 sm:px-6 md:py-28">
      <motion.div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[rgba(63,224,160,0.4)] px-6 py-16 text-center md:px-12"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(63,224,160,0.22) 0%, rgba(20,70,58,0.4) 45%, rgba(7,16,13,0.9) 100%)",
        }}
        initial={{ opacity: 0, boxShadow: "0 0 0 0 rgba(63,224,160,0)" }}
        whileInView={{
          opacity: 1,
          boxShadow: reduce ? "0 0 0 0 rgba(63,224,160,0)" : "0 0 80px -20px rgba(63,224,160,0.6)",
        }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <h2 className="lv2-display relative text-4xl text-[var(--paper)] sm:text-5xl">
          {title} {highlight && <span className="lv2-mint">{highlight}</span>}
        </h2>
        {subtitle && <p className="relative mt-5 text-lg lv2-soft">{subtitle}</p>}
        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={primaryHref} className="lv2-btn text-lg">
            {primaryLabel}
          </Link>
          <a
            href={CONTACT.whatsappUrl}
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
