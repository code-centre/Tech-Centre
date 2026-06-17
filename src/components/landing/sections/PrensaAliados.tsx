"use client";

import Image from "next/image";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import noticias from "../../../../data/noticias.json";
import aliados from "../../../../data/aliados.json";

export default function PrensaAliados() {
  const prensaLoop = [...noticias, ...noticias];
  const aliadosLoop = [...aliados.allies, ...aliados.allies];

  return (
    <section
      id="prueba-social"
      className="relative overflow-hidden py-24 md:py-28"
      aria-labelledby="prueba-social-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <SparkEyebrow>Reconocimiento</SparkEyebrow>
          </div>
          <h2
            id="prueba-social-title"
            className="lv2-display mx-auto mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Impulsando el ecosistema tech del Caribe
          </h2>
        </Reveal>
      </div>

      {/* Marquee de prensa */}
      <Reveal className="mt-14">
        <p className="lv2-mono mb-5 px-4 text-center">
          Reconocidos por impulsar el ecosistema
        </p>
        <div className="lv2-marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]">
          <ul className="lv2-marquee-track" style={{ ["--lv2-marquee-duration" as string]: "60s" }}>
            {prensaLoop.map((n, i) => (
              <li key={`${n.id}-${i}`}>
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-24 w-72 shrink-0 items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 transition-colors hover:border-[rgba(63,224,160,0.4)]"
                >
                  <span className="relative h-full w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={n.image}
                      alt={`Prensa: ${n.titulo}`}
                      fill
                      sizes="96px"
                      className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[var(--paper)]">
                      {n.titulo}
                    </span>
                    <span className="line-clamp-2 text-xs lv2-mute">
                      {n.descripcion}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* Marquee de aliados (dirección opuesta) */}
      <Reveal className="mt-10">
        <p className="lv2-mono mb-5 px-4 text-center">Aliados que confían</p>
        <div className="lv2-marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]">
          <ul
            className="lv2-marquee-track"
            style={{
              ["--lv2-marquee-duration" as string]: "45s",
              ["--lv2-marquee-direction" as string]: "reverse",
            }}
          >
            {aliadosLoop.map((ally, i) => (
              <li
                key={`${ally.name}-${i}`}
                className="flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6"
              >
                <Image
                  src={ally.logo}
                  alt={ally.name}
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
