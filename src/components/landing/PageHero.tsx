"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import SparkEyebrow from "./SparkEyebrow";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  tone?: "mint" | "cyan";
  bgImage?: string;
  bgAlt?: string;
  children?: ReactNode;
}

/** Hero reutilizable para páginas internas: eyebrow + título + subtítulo, sobre oscuro. */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  tone = "mint",
  bgImage,
  bgAlt = "",
  children,
}: PageHeroProps) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40 lg:px-8">
      {bgImage && (
        <div className="absolute inset-0 -z-10">
          <Image src={bgImage} alt={bgAlt} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,16,13,0.94)_0%,rgba(7,16,13,0.8)_55%,rgba(7,16,13,0.55)_100%)]" />
        </div>
      )}
      <div aria-hidden="true" className="lv2-tex right-[10%] top-[20%] hidden h-32 w-32 md:block" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SparkEyebrow tone={tone}>{eyebrow}</SparkEyebrow>
          <h1 className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed lv2-soft">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}
