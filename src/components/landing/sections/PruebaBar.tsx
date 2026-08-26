import Image from "next/image";
import { Star } from "lucide-react";
import { ECOSYSTEM } from "../data";
import { CONTACT } from "../data";
import { getGooglePlaceReviews } from "@/lib/reviews/google-places";
import { RUTAS_GOOGLE_PLACE_ID } from "../rutas/data";

/**
 * Franja de prueba inmediatamente debajo del hero: calificación real de Google
 * y los aliados del ecosistema. Es lo primero que ve quien duda.
 */
export default async function PruebaBar() {
  const { rating, total } = await getGooglePlaceReviews(RUTAS_GOOGLE_PLACE_ID);

  return (
    <section
      aria-label="Calificación y ecosistema"
      className="border-y border-[var(--line)] bg-white/[0.015]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-7 sm:px-6 lg:flex-row lg:justify-between lg:gap-10 lg:px-8">
        {rating ? (
          <a
            href={CONTACT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-3"
          >
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-[var(--mint)] text-[var(--mint)]"
                />
              ))}
            </span>
            <span className="text-sm text-[var(--paper)]">
              <strong className="font-bold">{rating.toFixed(1)}</strong> en Google
              {total ? (
                <span className="lv2-mute">
                  {" · "}
                  <span className="underline decoration-transparent transition-colors group-hover:decoration-[var(--mint)]">
                    {total} reseñas
                  </span>
                </span>
              ) : null}
            </span>
          </a>
        ) : (
          <p className="lv2-mono shrink-0">Presencial en Barranquilla</p>
        )}

        <div className="flex flex-col items-center gap-5 lg:flex-row lg:gap-10">
          <p className="lv2-mono text-center">Parte del ecosistema Costa Digital</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {ECOSYSTEM.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={120}
                    height={40}
                    className="h-7 w-auto object-contain opacity-65 transition-opacity hover:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
