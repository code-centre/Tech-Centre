import type { Metadata } from "next";
import Link from "next/link";
import { Hanken_Grotesk, Space_Mono } from "next/font/google";
import { MessageCircle } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import AdvancedBadge from "@/components/landing/agentes/AdvancedBadge";
import {
  AGENTES_DEMO_EVENT,
  AGENTES_DEMO_PATH,
  AGENTES_DEMO_WA,
  AGENTES_PATH,
} from "@/components/landing/agentes/data";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clase demo · Ingeniería de agentes de IA",
  description:
    "Noventa minutos gratis en la sede. Sales con un agente funcionando en tu propio computador. Sin pitch de ventas.",
  alternates: { canonical: AGENTES_DEMO_PATH },
};

export default function ClaseDemoPage() {
  return (
    <div className={`${hanken.variable} ${spaceMono.variable}`}>
      <div className="landing-v2 agentes-advanced min-h-[80vh]">
        <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <AdvancedBadge>CLASE DEMO · COMUNIDAD</AdvancedBadge>
              <h1 className="agentes-hero-title mt-5">
                Antes de decidir, ven a construir algo
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-[var(--text-muted)]">
                {AGENTES_DEMO_EVENT.summary}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <dl className="agentes-demo-meta mt-10">
                <div>
                  <dt>Fecha</dt>
                  <dd>{AGENTES_DEMO_EVENT.dateLabel}</dd>
                </div>
                <div>
                  <dt>Duración</dt>
                  <dd>{AGENTES_DEMO_EVENT.timeLabel}</dd>
                </div>
                <div>
                  <dt>Lugar</dt>
                  <dd>{AGENTES_DEMO_EVENT.place}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href={AGENTES_DEMO_WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agentes-btn-amber"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Reservar mi cupo
                </a>
                <Link href={AGENTES_PATH} className="agentes-text-link">
                  Ver el programa completo
                </Link>
              </div>
              <p className="mt-6 text-sm text-[var(--text-muted)]">
                Gratis. Presencial. Sin pitch de ventas. Si después quieres
                entrar a la cohorte del 5 de septiembre, agendas el diagnóstico.
              </p>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}
