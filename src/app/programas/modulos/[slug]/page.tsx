import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import CohorteBadge from "@/components/landing/CohorteBadge";
import CtaBand from "@/components/landing/CtaBand";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  MODULOS,
  RUTAS_COHORTE,
  RUTAS_DIAGNOSTICO_URL,
  RUTAS_PRECIOS,
  getModulo,
  moduloHref,
  precioModulo,
} from "@/components/landing/rutas/data";
import { checkoutHref, getOfferingCohortForCode } from "@/lib/cohorts/offering";

export function generateStaticParams() {
  return MODULOS.map(({ modulo }) => ({ slug: modulo.slug }));
}

// La cohorte abierta se lee en vivo; revalidamos cada hora para reflejar
// cambios (nuevas cohortes, cierres) sin necesidad de redeploy.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = getModulo(slug);
  if (!found) return {};

  const { modulo, ruta, numero } = found;
  const title = `${modulo.title} · Módulo ${numero} de la ${ruta.label} | Tech Centre`;
  const description = `${modulo.outcome} 8 semanas presenciales en Casa Tech, Barranquilla, con máximo 12 personas. Stack: ${modulo.stack}.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: moduloHref(slug) },
    openGraph: {
      title,
      description,
      url: moduloHref(slug),
      type: "website",
      images: [
        {
          url: "/og-image",
          width: 1200,
          height: 630,
          alt: "Tech Centre - Centro de Tecnología del Caribe",
        },
      ],
    },
  };
}

const FACTS = [
  { value: "8 semanas", detail: "de duración" },
  { value: "64 horas", detail: "de formación" },
  { value: "8 h / semana", detail: "4 presenciales, 4 guiadas" },
  { value: "12 personas", detail: "máximo por grupo" },
];

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = getModulo(slug);
  if (!found) notFound();

  const { modulo, ruta, numero } = found;
  // El slug del módulo coincide con el `code` del programa en la base de datos,
  // así que resolvemos su cohorte abierta (Batch_07 / offering=true) para armar
  // el enlace de inscripción hacia el checkout ya existente.
  const offering = await getOfferingCohortForCode(slug);
  const { precio, egresados } = precioModulo(modulo);
  const tone = ruta.tone === "cyan" ? "var(--cyan)" : "var(--mint)";
  const toneSoft =
    ruta.tone === "cyan" ? "rgba(116,186,255,0.28)" : "rgba(63,224,160,0.28)";
  const toneBg =
    ruta.tone === "cyan" ? "rgba(116,186,255,0.06)" : "rgba(63,224,160,0.06)";
  const otros = ruta.modules.filter((m) => m.slug !== modulo.slug);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co";
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: modulo.title,
    description: `${modulo.outcome} Módulo ${numero} de la ${ruta.label} (${ruta.name}). 8 semanas presenciales en Casa Tech, Barranquilla. Stack: ${modulo.stack}.`,
    url: `${baseUrl}${moduloHref(modulo.slug)}`,
    courseCode: modulo.slug,
    inLanguage: "es",
    provider: {
      "@type": "EducationalOrganization",
      name: "Tech Centre",
      url: baseUrl,
    },
    teaches: modulo.bullets,
    coursePrerequisites: modulo.requisito,
    timeRequired: "P8W",
    educationalCredentialAwarded: "Constancia de participación",
    offers: {
      "@type": "Offer",
      price: Number(precio.replace(/\D/g, "")),
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
      category: "Paid",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Onsite",
      courseWorkload: "PT64H",
      location: {
        "@type": "Place",
        name: "Casa Tech",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Cra. 50 #72-126, El Prado",
          addressLocality: "Barranquilla",
          addressRegion: "Atlántico",
          addressCountry: "CO",
        },
      },
    },
  };

  return (
    <div className="landing-v2">
      <StructuredData data={courseSchema} />
      {/* Hero del módulo */}
      <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 md:pb-20 md:pt-40 lg:px-8">
        <div
          aria-hidden="true"
          className="lv2-tex right-[10%] top-[22%] hidden h-32 w-32 md:block"
        />
        <div className="relative z-10 mx-auto max-w-5xl">
          <Link
            href="/#rutas"
            className="lv2-mono inline-flex items-center gap-2 !normal-case !tracking-normal hover:!text-[var(--mint)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a las rutas
          </Link>

          <div className="mt-6">
            <SparkEyebrow tone={ruta.tone}>{modulo.levelLabel}</SparkEyebrow>
          </div>

          <h1 className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl lg:text-6xl">
            {modulo.title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed lv2-soft">
            Módulo {numero} de la {ruta.label}: {ruta.name.toLowerCase()}.
            Presencial en Casa Tech, Barranquilla.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {modulo.stack.split(" · ").map((item) => (
              <li key={item} className="lv2-chip">
                {item}
              </li>
            ))}
          </ul>

          <div
            className="mt-8 max-w-2xl rounded-2xl border p-6"
            style={{ borderColor: toneSoft, background: toneBg }}
          >
            <p className="lv2-mono" style={{ color: tone }}>
              Con qué sales
            </p>
            <p className="mt-2 text-xl font-semibold leading-snug text-[var(--paper)]">
              {modulo.outcome}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4">
            <CohorteBadge />
            {offering ? (
              <>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={checkoutHref(offering.cohortId)}
                    className="lv2-btn px-7 py-4 text-lg"
                  >
                    Inscríbete a este módulo
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                  <a
                    href={RUTAS_DIAGNOSTICO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lv2-btn-secondary px-7 py-4 text-lg"
                  >
                    Agenda tu diagnóstico gratuito
                  </a>
                </div>
                <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
                  Reservas tu cupo y completas el pago en el checkout · cuotas sin
                  interés
                </p>
              </>
            ) : (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <a
                  href={RUTAS_DIAGNOSTICO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lv2-btn px-7 py-4 text-lg"
                >
                  Agenda tu diagnóstico gratuito
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
                <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
                  20 minutos · sin examen · sin pago
                </p>
              </div>
            )}
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-5 border-t border-[var(--line)] pt-7 sm:grid-cols-4">
            {FACTS.map((fact) => (
              <li key={fact.value}>
                <p className="lv2-display text-2xl" style={{ color: tone }}>
                  {fact.value}
                </p>
                <p className="mt-1 text-[13px] lv2-mute">{fact.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Temario y requisitos */}
      <section className="px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <Reveal>
              <SparkEyebrow tone={ruta.tone}>Qué vas a aprender</SparkEyebrow>
              <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
                El temario del módulo
              </h2>
            </Reveal>
            <ul className="mt-8 flex flex-col gap-4">
              {modulo.bullets.map((bullet, i) => (
                <Reveal key={bullet} delay={i * 0.06}>
                  <li className="lv2-card flex items-start gap-4 p-5">
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0"
                      style={{ color: tone }}
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed lv2-soft">{bullet}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <Reveal>
              <article className="lv2-card p-6">
                <p className="lv2-mono">Qué necesitas para entrar</p>
                <p className="mt-3 leading-relaxed lv2-soft">{modulo.requisito}</p>
              </article>
            </Reveal>

            <Reveal delay={0.08}>
              <article
                className="rounded-2xl border p-6"
                style={{ borderColor: toneSoft, background: toneBg }}
              >
                <p className="lv2-mono" style={{ color: tone }}>
                  Inversión de este módulo
                </p>
                <p className="lv2-display mt-3 text-4xl text-[var(--paper)]">
                  {precio}
                </p>
                <dl className="mt-5 flex flex-col gap-2.5 border-t border-[var(--line)] pt-5 text-[15px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="lv2-soft">Reserva de cupo</dt>
                    <dd className="font-bold text-[var(--paper)]">
                      {RUTAS_PRECIOS.reserva}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="lv2-soft">Cuotas sin interés</dt>
                    <dd className="font-bold text-[var(--paper)]">
                      Hasta {RUTAS_PRECIOS.cuotas}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="lv2-soft">Egresados</dt>
                    <dd className="font-bold" style={{ color: tone }}>
                      {egresados}
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 text-sm leading-relaxed lv2-mute">
                  {RUTAS_PRECIOS.sinRiesgo}
                </p>
              </article>
            </Reveal>

            <Reveal delay={0.14}>
              <article className="lv2-card p-6">
                <p className="lv2-mono">Qué incluye</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {RUTAS_PRECIOS.incluye.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: tone }}
                        aria-hidden="true"
                      />
                      <span className="text-[15px] leading-snug lv2-soft">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Los otros módulos de la ruta */}
      <section className="px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SparkEyebrow tone={ruta.tone}>Los otros módulos</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Sigue el recorrido de la {ruta.label}
            </h2>
            <p className="mt-4 max-w-2xl text-lg lv2-soft">
              Cada módulo se puede tomar de forma independiente. El diagnóstico
              gratuito te dice en cuál te conviene empezar.
            </p>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {otros.map((otro, i) => {
              const n = ruta.modules.findIndex((m) => m.slug === otro.slug) + 1;
              return (
                <li key={otro.slug}>
                  <Reveal delay={i * 0.08} className="h-full">
                    <Link
                      href={moduloHref(otro.slug)}
                      className="lv2-card group flex h-full flex-col gap-3 p-6 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <span className="lv2-mono" style={{ color: tone }}>
                        Módulo {n}
                      </span>
                      <span className="lv2-display text-2xl text-[var(--paper)]">
                        {otro.title}
                      </span>
                      <span className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
                        {otro.stack}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-2 pt-3 font-semibold" style={{ color: tone }}>
                        Ver el módulo
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand
        title={offering ? "Inscríbete a" : "Empieza en el módulo"}
        highlight={offering ? "este módulo." : "que te corresponde."}
        subtitle={`Cohorte del ${RUTAS_COHORTE.startDate} · ${RUTAS_COHORTE.seatsTotal} cupos por grupo · presencial en Casa Tech.`}
        primaryLabel={offering ? "Inscríbete a este módulo" : "Agenda tu diagnóstico gratuito"}
        primaryHref={offering ? checkoutHref(offering.cohortId) : RUTAS_DIAGNOSTICO_URL}
      />
    </div>
  );
}
