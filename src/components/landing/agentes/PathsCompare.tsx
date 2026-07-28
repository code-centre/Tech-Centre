"use client";

import Link from "next/link";
import Reveal from "../Reveal";
import {
  AGENTES_DEMO_PATH,
  AGENTES_DIAGNOSTICO_URL,
  AGENTES_PATHS,
} from "./data";
import { trackAgentes } from "./track";

/** Aclara diagnóstico vs clase demo. */
export default function PathsCompare() {
  return (
    <section className="agentes-section" aria-labelledby="paths-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 id="paths-title" className="agentes-section-title">
            {AGENTES_PATHS.title}
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Reveal>
            <article className="agentes-path-card">
              <p className="agentes-mono-label">{AGENTES_PATHS.diagnostic.label}</p>
              <p className="agentes-path-detail">{AGENTES_PATHS.diagnostic.detail}</p>
              <a
                href={AGENTES_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="agentes-btn-amber mt-6"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", { section: "paths_compare" })
                }
              >
                Agendar diagnóstico
              </a>
            </article>
          </Reveal>
          <Reveal delay={0.04}>
            <article className="agentes-path-card agentes-path-card-secondary">
              <p className="agentes-mono-label">{AGENTES_PATHS.demo.label}</p>
              <p className="agentes-path-detail">{AGENTES_PATHS.demo.detail}</p>
              <Link
                href={AGENTES_DEMO_PATH}
                className="lv2-btn-secondary mt-6"
                onClick={() =>
                  trackAgentes("click_cta_clase_demo", { section: "paths_compare" })
                }
              >
                Ver clase demo
              </Link>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
