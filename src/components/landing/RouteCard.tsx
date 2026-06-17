"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { RouteData } from "./data";

interface RouteCardProps {
  route: RouteData;
  fromLeft?: boolean;
}

export default function RouteCard({ route, fromLeft = true }: RouteCardProps) {
  const reduce = useReducedMotion();
  const accent = route.tone === "mint" ? "var(--mint)" : "var(--cyan)";

  return (
    <motion.article
      className="lv2-card relative flex h-full flex-col overflow-hidden p-7 md:p-9"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
      initial={{ opacity: 0, x: reduce ? 0 : fromLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />
      <span className="lv2-mono" style={{ color: accent, letterSpacing: "0.28em" }}>
        {route.label}
      </span>
      <h3 className="lv2-display mt-3 text-4xl" style={{ color: accent }}>
        {route.name}
      </h3>
      <p className="mt-1 text-lg font-medium text-[var(--paper)]">{route.tagline}</p>
      <p className="mt-4 lv2-soft">{route.forWhom}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {route.stack.map((tech) => (
          <li key={tech} className="lv2-chip">
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <p className="lv2-mono mb-3">Perfil al egresar</p>
        <p className="mb-6 font-semibold text-[var(--paper)]">{route.profile}</p>
        <Link
          href={`/programas/${route.slug}`}
          className="lv2-btn-secondary w-full"
          style={{ borderColor: accent, color: accent }}
        >
          Ver ruta {route.name}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
