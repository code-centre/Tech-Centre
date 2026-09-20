"use client";

import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { DESPUES_CUMBRE } from "../rutas/data";

/** Ecosistema más allá del salón, sin promesas de empleo. */
export default function DespuesDeLaCumbre() {
  return (
    <section
      id="ecosistema"
      className="relative py-20 md:py-24"
      aria-labelledby="ecosistema-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>{DESPUES_CUMBRE.eyebrow}</SparkEyebrow>
          <h2
            id="ecosistema-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Tu aprendizaje no termina{" "}
            <span className="lv2-mint">en el salón.</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg lv2-soft">{DESPUES_CUMBRE.intro}</p>
        </Reveal>

        <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DESPUES_CUMBRE.items.map((item, i) => (
            <li key={item.title}>
              <Reveal delay={i * 0.06} className="h-full">
                <article className="lv2-card flex h-full flex-col p-6 md:p-7">
                  <p className="lv2-mono !text-[var(--mint)]">
                    {String(i + 1).padStart(2, "0")} · {item.verb}
                  </p>
                  <h3 className="lv2-display mt-4 text-2xl text-[var(--paper)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed lv2-soft">{item.body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
