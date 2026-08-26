import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS_FAQS_HOME } from "../rutas/data";

/**
 * Objeciones abiertas y escaneables, no en acordeón: quien llegó hasta aquí
 * quiere leerlas antes de agendar.
 */
export default function FaqHome() {
  return (
    <section
      id="faq"
      className="relative py-24 md:py-28"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Antes de agendar</SparkEyebrow>
          <h2
            id="faq-title"
            className="lv2-display mt-5 max-w-2xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Las dudas que <span className="lv2-mint">siempre nos hacen</span>
          </h2>
        </Reveal>

        <dl className="mt-12 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          {RUTAS_FAQS_HOME.map((item, i) => (
            <Reveal key={item.q} delay={(i % 2) * 0.06}>
              <div className="border-b border-[var(--line)] pb-5">
                <dt className="text-lg font-bold text-[var(--paper)]">{item.q}</dt>
                <dd className="mt-2.5 leading-relaxed lv2-soft">{item.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
