"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CohorteBadge from "../CohorteBadge";
import { RUTAS_DIAGNOSTICO_URL } from "../rutas/data";
import { trackAgentes } from "../agentes/track";

const HERO_POSTER = "/techcentre-hero.jpg";
const HERO_VIDEO_WEBM = "/videos/hero-video.webm";
const HERO_VIDEO_MP4 = "/videos/hero-video.mp4";

function shouldLoadHeroVideo(reduceMotion: boolean): boolean {
  if (reduceMotion || typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
    return false;
  }
  return true;
}

function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [loadVideo, setLoadVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setLoadVideo(shouldLoadHeroVideo(Boolean(reduce)));
  }, [reduce]);

  useEffect(() => {
    const video = videoRef.current;
    if (!loadVideo || !video) return;

    let visible = false;

    const syncPlayback = () => {
      if (visible && !document.hidden) {
        const play = video.play();
        if (play) play.catch(() => {});
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [loadVideo]);

  return (
    <>
      <Image
        src={HERO_POSTER}
        alt="Estudiantes de Tech Centre en una clase presencial en Barranquilla"
        fill
        priority
        sizes="100vw"
        className="scale-[1.06] object-cover"
      />
      {loadVideo ? (
        <video
          ref={videoRef}
          className={`pointer-events-none absolute inset-0 h-full w-full scale-[1.06] object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_POSTER}
          aria-hidden="true"
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setPlaying(true)}
        >
          <source src={HERO_VIDEO_WEBM} type="video/webm" />
          <source src={HERO_VIDEO_MP4} type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,16,13,0.92)_0%,rgba(7,16,13,0.62)_46%,rgba(7,16,13,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(110%_85%_at_90%_8%,rgba(28,90,73,0.32)_0%,transparent_62%)]" />
    </>
  );
}

/** Cifras de la oferta que sostienen la promesa del titular. */
const FACTS = [
  { value: "12 personas", detail: "máximo por grupo" },
  { value: "8 semanas", detail: "por módulo, no dos años" },
  { value: "8 h / semana", detail: "compatible con tu trabajo" },
  { value: "1 proyecto", detail: "en demo day, al cierre" },
];

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
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: reduce ? 0 : imageY }}
      >
        <HeroMedia />
      </motion.div>

      <div aria-hidden="true" className="lv2-tex right-[8%] top-[14%] hidden h-40 w-40 md:block" />
      <div aria-hidden="true" className="lv2-tex right-[22%] bottom-[12%] hidden h-24 w-56 md:block" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-start gap-5">
          <motion.span
            className="inline-flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span aria-hidden="true" className="lv2-spark" />
            <span className="lv2-mono !text-[var(--mint)]">
              Casa Tech · Barranquilla · 100% presencial
            </span>
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <CohorteBadge />
          </motion.div>

          <motion.h1
            id="hero-title"
            className="lv2-display max-w-[46rem] text-[2.5rem] leading-[1.02] text-[var(--paper)] sm:text-6xl lg:text-[4.25rem]"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            En 8 semanas sales con un proyecto real{" "}
            <span className="lv2-mint">funcionando</span>
          </motion.h1>

          <motion.p
            className="max-w-xl text-lg leading-relaxed lv2-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Dos rutas para construir con tecnología e IA: AI Developer y Datos.
            Aprende en grupos pequeños, con mentores cerca y proyectos reales.
          </motion.p>

          <motion.div
            className="flex flex-col items-start gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <a
                href={RUTAS_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lv2-btn px-7 py-4 text-lg"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", { section: "home_hero" })
                }
              >
                Agenda tu diagnóstico gratuito
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="#rutas"
                className="border-b border-white/20 pb-0.5 text-[15px] lv2-soft transition-colors hover:border-[var(--mint)] hover:text-[var(--mint)]"
              >
                Explora las rutas
              </a>
            </div>
            <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
              20 minutos · sin examen · sin pago · te ubica en el módulo donde
              debes empezar
            </p>
          </motion.div>

          <motion.ul
            className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-5 border-t border-[var(--line)] pt-7 sm:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            {FACTS.map((fact) => (
              <li key={fact.value}>
                <p className="lv2-display text-2xl text-[var(--mint)]">
                  {fact.value}
                </p>
                <p className="mt-1 text-[13px] lv2-mute">{fact.detail}</p>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
