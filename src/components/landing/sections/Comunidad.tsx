import Image from "next/image";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

const COMMUNITY_PHOTO = {
  src: "/techcentre-hero.jpg",
  alt: "Comunidad de Tech Centre reunida en el escenario durante la graduación en Barranquilla",
  caption: "Comunidad Tech Centre · Barranquilla",
} as const;

/**
 * Identidad y pertenencia, justo después del hero.
 * Responde qué es Tech Centre y por qué existe este lugar.
 */
export default function Comunidad() {
  return (
    <section
      id="lugar"
      className="lv2-paper-band relative scroll-mt-24 overflow-hidden py-28 md:py-36"
      aria-labelledby="lugar-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10">
          <header className="lg:col-span-5">
            <Reveal>
              <SparkEyebrow tone="mint">Desde Barranquilla</SparkEyebrow>
              <h2
                id="lugar-title"
                className="lv2-display mt-6 text-[2.35rem] text-[var(--paper)] sm:text-5xl lg:text-[3.15rem]"
              >
                Tecnología se aprende
                <br />
                construyendo.
                <br />
                Y se construye mejor{" "}
                <span className="lv2-mint">acompañado.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-7 max-w-md space-y-5 text-lg leading-relaxed lv2-soft">
                <p>Tech Centre es un lugar para aprender tecnología haciendo cosas reales.</p>
                <p>
                  Aquí vienes a programar, experimentar, equivocarte, construir
                  proyectos y conocer personas que están recorriendo el mismo
                  camino que tú.
                </p>
              </div>
            </Reveal>
          </header>

          <Reveal
            delay={0.1}
            className="lg:col-span-7 lg:row-span-2 lg:-mr-12 xl:-mr-20"
          >
            <figure>
              <div className="relative aspect-[16/11] overflow-hidden rounded-2xl ring-1 ring-[rgba(20,32,27,0.12)] sm:aspect-[16/10] lg:aspect-[5/4] lg:min-h-[34rem]">
                <Image
                  src={COMMUNITY_PHOTO.src}
                  alt={COMMUNITY_PHOTO.alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover object-[center_42%]"
                />
              </div>
              <figcaption className="mt-3 lv2-mono">
                {COMMUNITY_PHOTO.caption}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.16} className="lg:col-span-5">
            <p className="lv2-display max-w-md text-2xl leading-snug text-[var(--paper)] sm:text-[1.75rem]">
              Estamos construyendo{" "}
              <span className="lv2-mint">el talento tech del Caribe.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
