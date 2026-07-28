import Link from "next/link";
import Reveal from "../Reveal";
import { AGENTES_PATH } from "./data";

/** Banda de reinscripción en páginas de Construye y Revela. */
export default function AlumniNextStep() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="alumni-next-title">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="rounded-2xl border border-[rgba(255,180,84,0.35)] bg-[rgba(255,180,84,0.06)] p-7 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <p className="lv2-mono !text-[var(--accent-advanced,#FFB454)]">
                ¿Y después de la carrera?
              </p>
              <h2
                id="alumni-next-title"
                className="lv2-display mt-3 text-2xl text-[var(--paper)] sm:text-3xl"
              >
                El siguiente nivel es ingeniería de agentes
              </h2>
              <p className="mt-3 max-w-xl lv2-soft">
                Ocho semanas avanzadas para egresados que ya programan y quieren
                construir sistemas con IA, no solo usarlas.
              </p>
            </div>
            <Link
              href={AGENTES_PATH}
              className="mt-6 inline-flex shrink-0 items-center justify-center rounded-full bg-[#FFB454] px-6 py-3 font-bold text-[#07100D] transition hover:brightness-105 md:mt-0"
            >
              Ver programa avanzado
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
