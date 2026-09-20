import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS } from "../rutas/data";

/**
 * TODO: galería de proyectos reales de estudiantes.
 * Faltan: nombre del estudiante, título del proyecto, captura o enlace,
 * categoría verificada y permiso para publicar.
 * Mientras tanto esta sección solo describe el tipo de entrega de cada ruta,
 * usando los outcomes del currículo. No inventa proyectos, métricas ni nombres.
 */
const PROJECT_TYPES = [
  {
    category: "Producto",
    title: RUTAS[0].modules[1].title,
    body: RUTAS[0].modules[1].outcome,
  },
  {
    category: "Datos / ML",
    title: RUTAS[1].modules[2].title,
    body: RUTAS[1].modules[2].outcome,
  },
  {
    category: "IA / Agentes",
    title: RUTAS[0].modules[2].title,
    body: RUTAS[0].modules[2].outcome,
  },
] as const;

export default function LoQueConstruyes() {
  return (
    <section
      id="construyes"
      className="lv2-paper-band relative py-20 md:py-24"
      aria-labelledby="construyes-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow tone="mint">Lo que construyes</SparkEyebrow>
          <h2
            id="construyes-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Esto es lo que vas a construir.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed lv2-soft">
            Cada módulo cierra con una entrega concreta. Aquí el tipo de
            proyecto, no una galería inventada.
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PROJECT_TYPES.map((item, index) => (
            <li key={item.category}>
              <Reveal delay={index * 0.06} className="h-full">
                <article className="flex h-full flex-col rounded-2xl border border-[rgba(20,32,27,0.1)] bg-[rgba(255,253,248,0.72)] p-6 md:p-7">
                  <p className="lv2-mono">{item.category}</p>
                  <h3 className="lv2-display mt-4 text-2xl text-[var(--paper)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed lv2-soft">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
