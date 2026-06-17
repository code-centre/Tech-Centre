"use client";

import Image from "next/image";
import { ECOSYSTEM } from "./data";
import Reveal from "./Reveal";

export default function EcosistemaStrip() {
  return (
    <section
      aria-labelledby="ecosistema-title"
      className="border-y border-[var(--line)] bg-[var(--panel)] py-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p
            id="ecosistema-title"
            className="lv2-mono mb-8 text-center"
          >
            Tech Centre hace parte del ecosistema Costa Digital
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-16">
            {ECOSYSTEM.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 text-center"
                  aria-label={`${item.name} (${item.role})`}
                >
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={120}
                    height={48}
                    className="h-9 w-auto object-contain opacity-60 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <span className="lv2-mono !text-[10px] opacity-70 transition-opacity group-hover:opacity-100">
                    {item.role}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
