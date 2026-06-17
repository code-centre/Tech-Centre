"use client";

import Reveal from "./Reveal";

interface TimelineItem {
  n: number;
  title: string;
  detail: string;
  entry?: boolean;
}

interface ModuleTimelineProps {
  items: readonly TimelineItem[];
  tone?: "mint" | "cyan";
}

export default function ModuleTimeline({ items, tone = "mint" }: ModuleTimelineProps) {
  const accent = tone === "mint" ? "var(--mint)" : "var(--cyan)";

  return (
    <Reveal>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m, i) => (
          <li
            key={m.n}
            className="lv2-card relative p-6"
            style={m.entry ? { borderColor: "rgba(63,224,160,0.4)" } : undefined}
          >
            <span
              className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${
                m.entry ? "lv2-ring text-[var(--ink)]" : "border border-[var(--line)]"
              }`}
              style={
                m.entry
                  ? { background: accent }
                  : { color: accent }
              }
              aria-hidden="true"
            >
              {m.n}
            </span>
            <h3 className="font-bold text-[var(--paper)]">{m.title}</h3>
            <p className="mt-1 text-sm lv2-mute">{m.detail}</p>
            {m.entry && (
              <span className="lv2-mono mt-3 block !text-[var(--mint)]">
                Entrada para experimentados
              </span>
            )}
            {i < items.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute right-[-12px] top-1/2 hidden h-px w-6 bg-[var(--line)] lg:block"
              />
            )}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
