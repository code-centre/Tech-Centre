"use client";

import { Clock, MapPin, Wifi } from "lucide-react";
import Reveal from "./Reveal";
import Counter from "./Counter";
import { INTENSITY } from "./data";

const items = [
  { icon: Clock, value: INTENSITY.months, suffix: " meses", label: "Duración" },
  { icon: MapPin, value: INTENSITY.presencial, suffix: " h/semana", label: "Presenciales" },
  { icon: Wifi, value: INTENSITY.virtual, suffix: " h/semana", label: "Virtuales" },
];

export default function IntensityCards() {
  return (
    <Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="lv2-card flex items-center gap-4 p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="lv2-display text-2xl text-[var(--paper)]">
                  <Counter to={item.value} suffix={item.suffix} />
                </p>
                <p className="lv2-mono">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm lv2-mute">
        {INTENSITY.total} h/semana en total · cada ruta se cursa por separado.
      </p>
    </Reveal>
  );
}
