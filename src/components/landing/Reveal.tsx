"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos (para stagger manual). */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  /** Muestra un destello menta detrás del bloque al revelarse. */
  glow?: boolean;
}

/**
 * Gesto central de la página: cada bloque entra con fade + y + glow menta.
 * Respeta prefers-reduced-motion dejando solo el fade.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  glow = false,
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`${glow ? "lv2-glow" : ""} relative ${className}`}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
