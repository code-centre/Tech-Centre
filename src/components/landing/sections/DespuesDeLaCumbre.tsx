"use client";

import { Rocket, Lightbulb, HeartHandshake } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { DESPUES_CUMBRE } from "../rutas/data";

const ITEM_ICONS = [Rocket, Lightbulb, HeartHandshake];

/** Después de la cumbre: el aprendizaje conecta con el ecosistema Costa Digital. */
export default function DespuesDeLaCumbre() {
  return (
    <section
      id="ecosistema"
      className="relative py-24 md:py-28"
      aria-labelledby="ecosistema-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>{DESPUES_CUMBRE.eyebrow}</SparkEyebrow>
          <h2
            id="ecosistema-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            El aprendizaje te conecta{" "}
            <span className="lv2-mint">con el ecosistema</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg lv2-soft">{DESPUES_CUMBRE.intro}</p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DESPUES_CUMBRE.items.map((item, i) => {
            const Icon = ITEM_ICONS[i] ?? Rocket;
            return (
              <li key={item.title}>
                <Reveal delay={i * 0.08} className="h-full">
                  <article className="lv2-card group h-full p-6 transition-transform duration-300 hover:-translate-y-1 md:p-8">
                    <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(63,224,160,0.4)]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl font-bold text-[var(--paper)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 leading-relaxed lv2-soft">{item.body}</p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
