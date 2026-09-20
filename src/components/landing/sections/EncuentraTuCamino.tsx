"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { trackAgentes } from "../agentes/track";
import type { HubProgram, HubRoute } from "@/data/programsHub";
import {
  AI_DEVELOPER_MODULE_CODES,
  AI_DEVELOPER_ROUTE_FALLBACK,
  DATOS_MODULE_CODES,
  DATOS_ROUTE_FALLBACK,
  ejecutivoHref,
  routePageHref,
} from "@/lib/programs/entryPaths";

interface PathCard {
  n: string;
  label: string;
  name: string;
  statement: string;
  description: string;
  meta: string;
  cta: string;
  href: string;
  path: "ai_developer" | "datos" | "ejecutivo";
  executive?: boolean;
}

function buildPaths(routes: HubRoute[], loose: HubProgram[]): PathCard[] {
  return [
    {
      n: "01",
      label: "Ruta técnica",
      name: "AI Developer",
      statement: "Quiero construir productos con tecnología e IA.",
      description:
        "De los fundamentos de programación a productos completos y agentes de IA.",
      meta: "JavaScript · React · Node · Agentes",
      cta: "Explorar ruta",
      href: routePageHref(routes, AI_DEVELOPER_MODULE_CODES, AI_DEVELOPER_ROUTE_FALLBACK),
      path: "ai_developer",
    },
    {
      n: "02",
      label: "Ruta técnica",
      name: "Datos + Machine Learning",
      statement: "Quiero convertir datos en decisiones y sistemas inteligentes.",
      description:
        "De Python y SQL a ingeniería de datos y machine learning en producción.",
      meta: "Python · SQL · Data Engineering · ML",
      cta: "Explorar ruta",
      href: routePageHref(routes, DATOS_MODULE_CODES, DATOS_ROUTE_FALLBACK),
      path: "datos",
    },
    {
      n: "03",
      label: "Programa ejecutivo",
      name: "IA Aplicada para Líderes",
      statement:
        "Quiero usar IA para transformar cómo trabajo y cómo opera mi equipo.",
      description:
        "Aprende a rediseñar procesos, delegar mejor a la IA y construir agentes sin necesidad de programar.",
      meta: "6 semanas · Presencial · Sin código",
      cta: "Conocer Programa Ejecutivo",
      href: ejecutivoHref(loose),
      path: "ejecutivo",
      executive: true,
    },
  ];
}

export default function EncuentraTuCamino({
  routes = [],
  loose = [],
}: {
  routes?: HubRoute[];
  loose?: HubProgram[];
}) {
  const paths = buildPaths(routes, loose);

  return (
    <section
      id="caminos"
      className="relative scroll-mt-24 py-20 md:py-24"
      aria-labelledby="caminos-title"
    >
      <div id="programas" className="sr-only" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Encuentra tu camino</SparkEyebrow>
          <h2
            id="caminos-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            ¿Qué quieres lograr
            <br />
            con <span className="lv2-mint">tecnología e IA?</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed lv2-soft">
            No todos llegan a Tech Centre buscando lo mismo. Puedes aprender a
            construir tecnología, trabajar con datos o aplicar IA para
            transformar la forma en que trabajas.
          </p>
        </Reveal>

        <ol className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {paths.map((path, index) => (
            <li key={path.path}>
              <Reveal delay={index * 0.06} className="h-full">
                <article
                  className={`lv2-card flex h-full flex-col p-6 md:p-7 ${
                    path.executive
                      ? "!border-[rgba(63,224,160,0.42)] bg-[rgba(63,224,160,0.04)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`lv2-mono ${
                        path.executive ? "!text-[var(--mint)]" : ""
                      }`}
                    >
                      {path.label}
                    </p>
                    <span
                      className="lv2-display text-2xl text-[rgba(63,224,160,0.28)]"
                      aria-hidden="true"
                    >
                      {path.n}
                    </span>
                  </div>

                  <h3 className="lv2-display mt-5 text-2xl text-[var(--paper)] sm:text-[1.75rem]">
                    {path.name}
                  </h3>
                  <p className="mt-3 text-[17px] font-semibold leading-snug text-[var(--paper)]">
                    {path.statement}
                  </p>
                  <p className="mt-3 flex-1 leading-relaxed lv2-soft">
                    {path.description}
                  </p>
                  <p className="lv2-mono mt-5 !normal-case !tracking-normal !text-[var(--mute)]">
                    {path.meta}
                  </p>

                  <Link
                    href={path.href}
                    className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--mint-cta)] transition-colors hover:text-[var(--mint)]"
                    onClick={() =>
                      trackAgentes("click_cta_path", {
                        path: path.path,
                        section: "home_caminos",
                      })
                    }
                  >
                    {path.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
