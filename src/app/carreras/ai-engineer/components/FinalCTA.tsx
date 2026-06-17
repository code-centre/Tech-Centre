"use client";

import { ArrowRight, MessageCircle, Globe, MapPin } from "lucide-react";

interface FinalCTAProps {
  onEnroll: () => void;
}

const channels = [
  {
    icon: MessageCircle,
    label: "Escríbenos",
    value: "WhatsApp · +57 300 5523872",
    href: "https://wa.me/573005523872",
  },
  {
    icon: Globe,
    label: "Conoce las rutas",
    value: "techcentre.co",
    href: "https://techcentre.co",
  },
  {
    icon: MapPin,
    label: "Visítanos",
    value: "Barranquilla · Cra. 50 #72-126",
    href: "https://maps.google.com/?q=Cra.+50+%2372-126+Barranquilla",
  },
];

export default function FinalCTA({ onEnroll }: FinalCTAProps) {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl brand-gradient text-white shadow-2xl">
          <div className="absolute inset-0 brand-grid opacity-50" aria-hidden="true" />
          <div
            className="absolute -bottom-28 -right-20 w-[420px] h-[420px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(31,211,130,0.28), transparent 70%)" }}
            aria-hidden="true"
          />

          <div className="relative z-10 px-6 py-16 sm:px-12 md:py-20 text-center">
            <h2 className="font-highlight text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Empieza a <span className="text-gradient-brand">explorar</span>.
            </h2>
            <p className="text-lg text-white/80 mb-4 max-w-xl mx-auto">
              El viaje apenas comienza. No necesitas permiso, ni un título
              especial, ni saber programar. Necesitas atreverte a explorar.
            </p>
            <p className="text-base text-white/60 mb-10 max-w-lg mx-auto">
              6 meses. Dos rutas. De cero a Ingeniero de Aplicaciones de IA, aquí
              en el Caribe.
            </p>

            <button
              onClick={onEnroll}
              className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-lg font-bold rounded-xl"
            >
              Apartar mi cupo ahora
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>

            <ul className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[var(--secondary)] hover:bg-white/10 transition-colors text-center"
                  >
                    <channel.icon className="w-5 h-5 text-[var(--secondary)]" aria-hidden="true" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/55 font-mono">
                      {channel.label}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {channel.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-white/50">
              Centro de Tecnología del Caribe · Programas Ciclo 2026 · Cupos
              limitados
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
