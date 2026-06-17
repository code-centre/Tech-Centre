import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import EventCard, { type EventItem } from "@/components/landing/EventCard";
import PhotoGallery from "@/components/landing/PhotoGallery";
import CtaBand from "@/components/landing/CtaBand";
import { COMMUNITY_FORMATS, GALLERY_MOSAIC, GALLERY_MARQUEE } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Comunidad · La agenda del ecosistema",
  description:
    "La tecnología se vive en comunidad. Eventos organizados por Costa Digital, el centro de innovación del Caribe del que Tech Centre hace parte: Tech Nights, hackatones y más.",
};

const COSTA_AGENDA = "https://www.codigoabierto.tech/eventos";

// Listado editable de próximos eventos (agenda Costa Digital).
const upcomingEvents: EventItem[] = [
  { name: "Tech Nights", date: "Mensual", place: "Casa Tech · El Prado", href: COSTA_AGENDA },
  { name: "Café Cursor · Meetup", date: "Próximamente", place: "Casa Tech · El Prado", href: COSTA_AGENDA },
  { name: "Build with AI", date: "Gira universitaria", place: "Universidades del Caribe", href: COSTA_AGENDA },
  { name: "Barranqui-IA · Hackatón", date: "Próximamente", place: "Barranquilla", href: COSTA_AGENDA },
];

export default function ComunidadPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Comunidad"
        title={
          <>
            La tecnología se vive{" "}
            <span className="lv2-mint">en comunidad.</span>
          </>
        }
        subtitle="Los eventos de esta sección son organizados por Costa Digital, el centro de innovación del Caribe operado por la Fundación Código Abierto, del que Tech Centre hace parte. Aquí vive la agenda del ecosistema."
      />

      {/* Próximos eventos */}
      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="eventos-title">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>Próximos eventos</SparkEyebrow>
            <h2 id="eventos-title" className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Lo que viene en el ecosistema
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingEvents.map((event, i) => (
              <Reveal key={event.name} delay={i * 0.07}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Formatos recurrentes */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>Formatos recurrentes</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Espacios que se repiten
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITY_FORMATS.map((format, i) => (
              <Reveal key={format.name} delay={i * 0.06}>
                <article className="lv2-card h-full p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="lv2-display text-xl text-[var(--paper)]">{format.name}</h3>
                    <span className="lv2-chip">{format.cadence}</span>
                  </div>
                  <p className="mt-3 lv2-soft">{format.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Galería de eventos */}
      <section className="py-12">
        <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SparkEyebrow>En vivo</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Así se ve la comunidad
            </h2>
          </Reveal>
        </div>
        <PhotoGallery mosaic={GALLERY_MOSAIC} marquee={GALLERY_MARQUEE} />
      </section>

      {/* Banda Costa Digital */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="lv2-card flex flex-col items-start justify-between gap-5 p-8 md:flex-row md:items-center">
              <div>
                <p className="lv2-mono">Ecosistema</p>
                <h2 className="lv2-display mt-2 text-2xl text-[var(--paper)]">
                  Esta comunidad es parte de Costa Digital
                </h2>
              </div>
              <a
                href="https://costadigital.org"
                target="_blank"
                rel="noopener noreferrer"
                className="lv2-btn shrink-0"
              >
                Ver toda la agenda en Costa Digital
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Súmate a la comunidad."
        highlight="Te esperamos."
        primaryLabel="Ver programas"
        primaryHref="/programas"
      />
    </div>
  );
}
