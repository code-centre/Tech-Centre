import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import VideoDestacado from "./VideoDestacado";
import { CONTACT } from "../data";
import {
  RUTAS_GOOGLE_PLACE_ID,
  RUTAS_RESENAS_DESTACADAS,
} from "../rutas/data";
import { getGooglePlaceReviews } from "@/lib/reviews/google-places";

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

const MOSAIC: Photo[] = [
  {
    src: "/community/sesion-fca.webp",
    alt: "Sesión presencial frente a la proyección",
    caption: "Sesión presencial",
  },
  {
    src: "/community/practica-laptops.webp",
    alt: "Práctica en vivo programando sobre laptops",
    caption: "Práctica en vivo",
  },
  {
    src: "/community/laboratorio-codigo.webp",
    alt: "Laboratorio de programación con proyección de código",
    caption: "Laboratorio",
  },
  {
    src: "/community/charla-noche.webp",
    alt: "Charla nocturna al aire libre en la sede",
    caption: "Tech Nights",
  },
];

function Estrellas({ value = 5, size = 14 }: { value?: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i < value
              ? "fill-[var(--mint)] text-[var(--mint)]"
              : "text-[var(--line)]"
          }
        />
      ))}
    </span>
  );
}

/**
 * Prueba social compacta: video, reseñas de Google y un collage corto.
 */
export default async function PruebaSocial() {
  const { rating, total, reviews } = await getGooglePlaceReviews(
    RUTAS_GOOGLE_PLACE_ID,
  );
  const elegidas = RUTAS_RESENAS_DESTACADAS.map((name) =>
    reviews.find((r) => r.author_name === name),
  ).filter((r): r is (typeof reviews)[number] => Boolean(r));
  const destacadas = (elegidas.length ? elegidas : reviews).slice(0, 3);

  return (
    <section
      id="prueba"
      className="relative py-20 md:py-24"
      aria-labelledby="prueba-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Genios de aquí</SparkEyebrow>
          <h2
            id="prueba-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Personas reales.{" "}
            <span className="lv2-mint">Aprendizajes reales.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Antes de decidir, mira lo que cuentan quienes ya pasaron por el
            salón.
            {rating ? (
              <>
                {" "}
                <span className="font-semibold text-[var(--mint)]">
                  {rating.toFixed(1).replace(".", ",")} sobre 5
                  {total ? ` en ${total} reseñas de Google.` : "."}
                </span>
              </>
            ) : null}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Reveal glow>
            <VideoDestacado />
          </Reveal>

          {destacadas.length ? (
            <div className="flex h-full flex-col gap-4">
              {destacadas.map((review, i) => (
                <Reveal key={review.author_name} delay={i * 0.06}>
                  <article className="lv2-card flex flex-col justify-between gap-4 p-5">
                    <div>
                      <Estrellas value={review.rating} />
                      <p className="mt-2 line-clamp-5 leading-relaxed text-[var(--paper)]">
                        “{review.text}”
                      </p>
                    </div>
                    <footer className="flex items-center gap-3">
                      {review.profile_photo_url ? (
                        <Image
                          src={review.profile_photo_url}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[var(--paper)]">
                          {review.author_name}
                        </p>
                        <p className="lv2-mono !text-[10px]">
                          Reseña en Google · {review.relative_time_description}
                        </p>
                      </div>
                    </footer>
                  </article>
                </Reveal>
              ))}
              <Reveal delay={0.16}>
                <a
                  href={CONTACT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agentes-mint-link inline-flex items-center gap-2 text-[15px] font-semibold"
                >
                  Ver todas las reseñas en Google Maps
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Reveal>
            </div>
          ) : null}
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {MOSAIC.map((photo, i) => (
            <li key={photo.src}>
              <Reveal delay={(i % 4) * 0.05}>
                <figure className="relative m-0 h-36 overflow-hidden rounded-2xl border border-[var(--line)] sm:h-44">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 45vw, 25vw"
                    className="object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(7,16,13,0.85))]"
                  />
                  <figcaption className="lv2-mono absolute bottom-3 left-3 !text-[var(--mint)]">
                    {photo.caption}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
