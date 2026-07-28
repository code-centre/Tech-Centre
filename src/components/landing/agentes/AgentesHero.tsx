"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import AdvancedBadge from "./AdvancedBadge";
import StatBar from "./StatBar";
import {
  AGENTES_DIAGNOSTICO_URL,
  AGENTES_HERO,
} from "./data";
import { trackAgentes } from "./track";

export default function AgentesHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 48]);

  return (
    <header ref={sectionRef} className="agentes-hero">
      <motion.div className="agentes-hero-media" style={{ y }} aria-hidden={!reduce}>
        <Image
          src={AGENTES_HERO.image}
          alt={AGENTES_HERO.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="agentes-hero-scrim" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <AdvancedBadge>{AGENTES_HERO.badge}</AdvancedBadge>
          <h1 className="agentes-hero-title mt-5">{AGENTES_HERO.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
            {AGENTES_HERO.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-start gap-3">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={AGENTES_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="agentes-btn-amber"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", { section: "hero" })
                }
              >
                {AGENTES_HERO.primaryCta}
              </a>
              <a href="#temario" className="agentes-text-link">
                {AGENTES_HERO.secondaryCta}
              </a>
            </div>
            <p className="agentes-cta-note">{AGENTES_HERO.primaryNote}</p>
          </div>
        </motion.div>
        <div className="mt-12">
          <StatBar />
        </div>
      </div>
    </header>
  );
}
