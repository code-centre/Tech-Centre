import Image from "next/image";
import {
  Boxes,
  FolderGit2,
  Scale,
  Server,
} from "lucide-react";
import Reveal from "../Reveal";
import AgentesAnalytics from "./AgentesAnalytics";
import AgentesFaq from "./AgentesFaq";
import AgentesHero from "./AgentesHero";
import BigStat from "./BigStat";
import DemoClassBand from "./DemoClassBand";
import DiagnosticCta from "./DiagnosticCta";
import FitColumns from "./FitColumns";
import HonestyCallout from "./HonestyCallout";
import InlineDiagnosticCta from "./InlineDiagnosticCta";
import PriceTable from "./PriceTable";
import SaturdayTimeline from "./SaturdayTimeline";
import InstructorBio from "./InstructorBio";
import PathsCompare from "./PathsCompare";
import StackGrid from "./StackGrid";
import StickyDiagnosticCta from "./StickyDiagnosticCta";
import WeekAccordion from "./WeekAccordion";
import {
  AGENTES_BUILD,
  AGENTES_HYBRID,
  AGENTES_LEGAL,
  AGENTES_NEEDS,
  AGENTES_UNCOMFORTABLE,
} from "./data";

const deliverableIcons = [Server, Boxes, FolderGit2, Scale];

export default function AgentesPage() {
  const [primaryStat, ...restStats] = AGENTES_UNCOMFORTABLE.stats;

  return (
    <div className="landing-v2 agentes-advanced">
      <AgentesAnalytics />
      <StickyDiagnosticCta />
      <AgentesHero />

      {/* Para quién primero: acelera el "es para mí" */}
      <section className="agentes-section" aria-labelledby="fit-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="fit-title" className="agentes-section-title">
              Para quién es y para quién no
            </h2>
          </Reveal>
          <div className="mt-10">
            <FitColumns />
          </div>
        </div>
      </section>

      {/* El dato incómodo: 1 cifra arriba en móvil, resto debajo */}
      <section
        className="agentes-section agentes-section-deep"
        aria-labelledby="uncomfortable-title"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="uncomfortable-title" className="agentes-section-title max-w-3xl">
              {AGENTES_UNCOMFORTABLE.title}
            </h2>
          </Reveal>
          <div className="mt-12">
            <Reveal>
              <BigStat
                value={primaryStat.value}
                numeric={primaryStat.numeric}
                suffix={primaryStat.suffix}
                label={primaryStat.label}
                source={primaryStat.source}
                sourceUrl={primaryStat.sourceUrl}
              />
            </Reveal>
            <div className="agentes-stats-secondary mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
              {restStats.map((stat, i) => (
                <Reveal key={stat.value} delay={i * 0.04}>
                  <BigStat
                    value={stat.value}
                    numeric={stat.numeric}
                    suffix={stat.suffix}
                    label={stat.label}
                    source={stat.source}
                    sourceUrl={stat.sourceUrl}
                  />
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.12}>
            <p className="mt-12 max-w-3xl text-lg leading-relaxed text-[var(--text-muted)]">
              {AGENTES_UNCOMFORTABLE.closing}
            </p>
          </Reveal>
        </div>
      </section>

      <InstructorBio />

      <PathsCompare />

      {/* Qué sales construyendo */}
      <section className="agentes-section" aria-labelledby="build-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Reveal>
                <h2 id="build-title" className="agentes-section-title">
                  {AGENTES_BUILD.title}
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">
                  {AGENTES_BUILD.intro}
                </p>
              </Reveal>
              <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {AGENTES_BUILD.deliverables.map((item, i) => {
                  const Icon = deliverableIcons[i];
                  return (
                    <Reveal key={item.title} delay={i * 0.04}>
                      <li className="agentes-deliverable">
                        <Icon className="h-5 w-5 text-[var(--accent-advanced)]" aria-hidden="true" />
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                      </li>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
            <Reveal delay={0.08}>
              <aside className="agentes-starters" aria-label="Proyectos de partida">
                <p className="agentes-mono-label">Si llegas sin caso propio</p>
                <ul>
                  {AGENTES_BUILD.starterProjects.map((p) => (
                    <li key={p.title}>
                      <h3>{p.title}</h3>
                      <p>{p.body}</p>
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Visual sede */}
      <section className="agentes-photo-strip" aria-label="La sede en El Prado">
        <div className="agentes-photo-strip-grid">
          {[
            { src: "/community/manos-teclado.webp", alt: "Manos en teclado en la sede" },
            { src: "/community/laboratorio-codigo.webp", alt: "Code review frente a un monitor" },
            { src: "/community/demo-herramientas.webp", alt: "Demo en vivo en la sede" },
          ].map((img) => (
            <div key={img.src} className="relative aspect-[4/3] overflow-hidden">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* Las 8 semanas */}
      <section id="temario" className="agentes-section" aria-labelledby="weeks-title">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="weeks-title" className="agentes-section-title">
              Las 8 semanas
            </h2>
            <p className="mt-4 text-lg text-[var(--text-muted)]">
              Construyes agentes que ejecutan acciones reales en tus sistemas.
              <span className="agentes-week-stack mt-2 block normal-case tracking-normal">
                Tool calling, servidores MCP propios con fastmcp, aprobación humana
              </span>
            </p>
          </Reveal>
          <div className="mt-10">
            <WeekAccordion />
          </div>
        </div>
      </section>

      {/* Híbrido */}
      <section className="agentes-section agentes-section-deep" aria-labelledby="hybrid-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="hybrid-title" className="agentes-section-title max-w-3xl">
              {AGENTES_HYBRID.title}
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal>
              <article className="agentes-hybrid-card">
                <h3>{AGENTES_HYBRID.saturday.title}</h3>
                <p>{AGENTES_HYBRID.saturday.body}</p>
              </article>
            </Reveal>
            <Reveal delay={0.04}>
              <article className="agentes-hybrid-card">
                <h3>{AGENTES_HYBRID.home.title}</h3>
                <p>{AGENTES_HYBRID.home.body}</p>
              </article>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="mt-10">
            <SaturdayTimeline />
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <HonestyCallout>{AGENTES_HYBRID.honesty}</HonestyCallout>
          </Reveal>
          <Reveal delay={0.12} className="mt-8">
            <InlineDiagnosticCta section="after_honesty" />
          </Reveal>
        </div>
      </section>

      {/* Stack */}
      <section className="agentes-section" aria-labelledby="stack-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="stack-title" className="agentes-section-title">
              El stack
            </h2>
          </Reveal>
          <Reveal delay={0.04} className="mt-10">
            <StackGrid />
          </Reveal>
        </div>
      </section>

      {/* Necesitas / incluido */}
      <section className="agentes-section" aria-labelledby="needs-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="needs-title" className="sr-only">
              Lo que necesitas y lo que está incluido
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal>
              <article className="agentes-needs-card">
                <h3>{AGENTES_NEEDS.needTitle}</h3>
                <ul>
                  {AGENTES_NEEDS.need.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
            <Reveal delay={0.04}>
              <article className="agentes-needs-card">
                <h3>{AGENTES_NEEDS.includedTitle}</h3>
                <ul>
                  {AGENTES_NEEDS.included.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <p className="agentes-needs-note mt-8">{AGENTES_NEEDS.note}</p>
          </Reveal>
        </div>
      </section>

      {/* Inversión */}
      <section className="agentes-section agentes-section-deep" aria-labelledby="price-title">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="price-title" className="agentes-section-title">
              Inversión
            </h2>
          </Reveal>
          <Reveal delay={0.04} className="mt-10">
            <PriceTable />
          </Reveal>
          <Reveal delay={0.08} className="mt-8">
            <InlineDiagnosticCta
              section="after_price"
              note="Primero el diagnóstico. El pago viene después."
            />
          </Reveal>
        </div>
      </section>

      <DemoClassBand />

      {/* FAQ */}
      <section className="agentes-section" aria-labelledby="faq-title">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="faq-title" className="agentes-section-title">
              Preguntas
            </h2>
          </Reveal>
          <div className="mt-10">
            <AgentesFaq />
          </div>
        </div>
      </section>

      <DiagnosticCta />

      <footer className="agentes-legal">
        <p>{AGENTES_LEGAL}</p>
      </footer>
    </div>
  );
}
