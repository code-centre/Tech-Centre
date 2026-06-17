"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SparkEyebrowProps {
  children: string;
  className?: string;
  /** Color de la chispa: menta (default) o cyan para la ruta de datos. */
  tone?: "mint" | "cyan";
}

/** Eyebrow en mono mayúsculas con una chispa que se dibuja al revelarse. */
export default function SparkEyebrow({
  children,
  className = "",
  tone = "mint",
}: SparkEyebrowProps) {
  const reduce = useReducedMotion();
  const color = tone === "cyan" ? "var(--cyan)" : "var(--mint)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <motion.span
        aria-hidden="true"
        className="lv2-spark"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        initial={{ scaleX: reduce ? 1 : 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <span className="lv2-mono">{children}</span>
    </span>
  );
}
