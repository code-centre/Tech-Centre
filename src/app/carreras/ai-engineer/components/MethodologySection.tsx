"use client";

import Image from "next/image";
import { Target, Hammer, Users } from "lucide-react";

const principles = [
  {
    icon: Target,
    title: "De 0 a contratable",
    description:
      "Empiezas sin saber programar y sales con un perfil que la industria nombra y busca: Ingeniero de Aplicaciones de IA.",
    image: "/illustrations/sticker-keyboard.png",
    alt: "Ilustración de una mano escribiendo sobre teclas WASD",
  },
  {
    icon: Hammer,
    title: "Aprender haciendo",
    description:
      "Cada etapa entrega algo real y desplegado. Terminas con portafolio, no con apuntes. Construyes de verdad desde el primer día.",
    image: "/illustrations/sticker-ring-hand.png",
    alt: "Ilustración de una mano haciendo un gesto dentro del aro de la marca",
  },
  {
    icon: Users,
    title: "Acompañamiento real",
    description:
      "Presencial, con guía humana y una comunidad que no te suelta. Nadie nace sabiendo: aquí te acompañamos paso a paso.",
    image: "/illustrations/sticker-hands-loop.png",
    alt: "Ilustración de dos manos conectadas por el símbolo de Tech Centre",
  },
];

export default function MethodologySection() {
  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
            Cómo formamos el genio
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Tres principios que sostienen cada ruta. Un mismo viaje: de la duda
            inicial al orgullo de haberlo logrado.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {principles.map((p, i) => (
            <article
              key={p.title}
              className="flex flex-col rounded-2xl bg-[var(--card-background)] border border-border-color shadow-sm overflow-hidden"
            >
              <div className="relative flex items-center justify-center h-44 bg-gradient-to-br from-[#EAFBF2] to-[#CFF3E1]">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 brand-grid opacity-40"
                />
                <Image
                  src={p.image}
                  alt={p.alt}
                  width={400}
                  height={400}
                  className="relative h-32 w-auto object-contain drop-shadow-sm"
                />
                <span className="absolute top-3 right-4 text-3xl font-extrabold text-[var(--brand-green-deep)]/35 font-mono">
                  0{i + 1}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--primary)]/10 dark:bg-[var(--secondary)]/12 border border-[var(--primary)]/25 dark:border-[var(--secondary)]/30 shrink-0">
                    <p.icon
                      className="w-5 h-5 text-[var(--primary)] dark:text-[var(--secondary)]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {p.title}
                  </h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {p.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Format table */}
        <div className="rounded-2xl border border-border-color bg-[var(--card-background)] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border-color bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10">
            <h3 className="font-bold text-text-primary">
              Formato y dedicación
            </h3>
          </div>
          <div className="divide-y divide-border-color">
            {[
              ["Duración", "6 meses por ruta, de 0 al perfil"],
              ["Estructura", "4 etapas: Fundamentos · Especialidad · IA aplicada · Despliegue seguro"],
              ["Presenciales", "6 horas/semana en el centro (Barranquilla)"],
              ["Virtuales", "12 horas/semana de práctica y proyecto guiado"],
              ["Dedicación total semanal", "18 horas/semana (cada ruta se cursa por separado)"],
              ["Requisitos", "Computador + internet + compromiso real"],
              ["Modalidad", "Formación presencial en Barranquilla"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 px-6 py-4"
              >
                <span className="text-sm font-semibold text-text-primary sm:w-56 shrink-0">
                  {label}
                </span>
                <span className="text-sm text-text-muted">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
