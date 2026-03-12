import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  Award,
  CheckCircle2,
  BrainCircuit,
  Target,
  TrendingUp,
  MessageCircle,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { getCareerBySlug } from "@/data/careers";

interface CareerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CareerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);

  if (!career) {
    return {
      title: "Carrera no encontrada - Tech Centre",
      description: "La carrera que buscas no está disponible.",
    };
  }

  return {
    title: career.metadata.title,
    description: career.metadata.description,
    keywords: career.metadata.keywords,
    openGraph: {
      title: career.metadata.title,
      description: career.metadata.description,
      type: "website",
      images: career.image
        ? [
            {
              url: career.image,
              width: 1200,
              height: 630,
              alt: career.name,
            },
          ]
        : [],
    },
  };
}

const WHATSAPP_URL =
  "https://wa.me/573005523872?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20carreras%20de%20Tech%20Centre";

export default async function CareerPage({ params }: CareerPageProps) {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);

  if (!career) {
    notFound();
  }

  const whatsappCareerUrl = `${WHATSAPP_URL}&text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20la%20carrera%20${encodeURIComponent(career.name)}`;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/15 via-secondary/5 to-background">
        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="mb-8" aria-label="Breadcrumb">
            <Link
              href="/programas-academicos"
              className="inline-flex items-center gap-2 text-text-muted hover:text-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Programas Académicos
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <header>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <span className="text-secondary font-semibold">
                  Carrera Tecnológica
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
                {career.name}
              </h1>

              <p className="text-xl text-text-muted mb-8 leading-relaxed">
                {career.long_description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="h-5 w-5 text-secondary" />
                  <span className="font-medium">{career.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Award className="h-5 w-5 text-secondary" />
                  <span className="font-medium">{career.level}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="font-medium">{career.modality}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={whatsappCareerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5" />
                  Iniciar conversación
                </a>
                <Link
                  href="#programa"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border-color text-text-primary font-medium rounded-lg hover:border-secondary/50 hover:bg-secondary/10 transition-all duration-300"
                >
                  Ver programa detallado
                </Link>
              </div>
            </header>

            <figure className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/2] bg-bg-secondary">
                {career.hero_image ? (
                  <Image
                    src={career.hero_image}
                    alt={career.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/20 to-secondary/10">
                    <GraduationCap className="w-20 h-20 text-secondary/40" />
                    <span className="text-text-muted text-sm">
                      Imagen de portada
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* Programa Detallado */}
      <section id="programa" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Programa de Formación
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Un viaje completo por el ecosistema de {career.name}, desde los
              conceptos fundamentales hasta aplicaciones avanzadas.
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {career.learning_points.map(
              (point: { title: string; url?: string }, index: number) => (
                <article
                  key={index}
                  className="bg-[var(--card-background)] border border-border-color rounded-xl p-6 hover:border-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-sm text-text-muted leading-relaxed">
                      {point.title}
                    </span>
                  </div>
                  {point.url && (
                    <a
                      href={`/programas-academicos/${point.url}`}
                      className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                    >
                      Explorar curso
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Perfil del Egresado + Oportunidades */}
      <section className="py-20 px-4 bg-[var(--card-background)]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6">
                Perfil del Egresado
              </h2>
              <p className="text-text-muted mb-6">
                Al finalizar la carrera, serás capaz de liderar proyectos de{" "}
                {career.name} desde la concepción hasta el despliegue en
                producción.
              </p>

              <ul className="space-y-4">
                {career.graduate_profile.map(
                  (skill: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                      <span className="text-text-muted">{skill}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6">
                Oportunidades Laborales
              </h2>
              <p className="text-text-muted mb-6">
                La demanda de especialistas en {career.name} sigue creciendo
                exponencialmente. Nuestros egresados se posicionan en roles clave
                del mercado tecnológico.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {career.opportunities.map(
                  (
                    opportunity: { title: string; salaryRange?: string },
                    index: number,
                  ) => (
                    <article
                      key={index}
                      className="bg-background border border-border-color rounded-lg p-4"
                    >
                      <h4 className="font-medium text-text-primary mb-1">
                        {opportunity.title}
                      </h4>
                      {opportunity.salaryRange && (
                        <p className="text-sm text-secondary">
                          {opportunity.salaryRange}
                        </p>
                      )}
                    </article>
                  ),
                )}
              </div>

              <div className="flex items-center gap-2 text-secondary">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">
                  Alta demanda en el mercado laboral
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Admisión */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Proceso de Admisión
          </h2>
          <p className="text-lg text-text-muted mb-12">
            Únete a la próxima cohorte de {career.name} y transforma tu carrera
            profesional.
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {career.admission_process.map(
              (
                step: { step: string; title: string; description: string },
                index: number,
              ) => (
                <div key={index} className="relative">
                  <article className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-secondary mb-2">
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {step.description}
                    </p>
                  </article>
                  {index < career.admission_process.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border-color -translate-y-1/2" />
                  )}
                </div>
              ),
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={whatsappCareerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Calendar className="h-5 w-5" />
              Agendar entrevista
            </a>
            <a
              href={whatsappCareerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border-color text-text-primary font-medium rounded-lg hover:border-secondary/50 hover:bg-secondary/10 transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              Más información
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
