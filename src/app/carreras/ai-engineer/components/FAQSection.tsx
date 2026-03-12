"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Necesito saber programar para inscribirme?",
    a: "No. El programa está diseñado para aprender desde las bases. Eso sí: el ritmo es acelerado y exigente. Si nunca has programado, necesitarás dedicar más horas de práctica en las primeras semanas.",
  },
  {
    q: "¿Cuántas horas reales necesito por semana?",
    a: "Entre 9 y 12 horas: 4 de clase en vivo + 5 a 8 de práctica autónoma. Si no puedes comprometerte con al menos 8–9 horas semanales, recomendamos esperar a una cohorte donde puedas dedicarle el tiempo que merece.",
  },
  {
    q: "¿Las clases quedan grabadas?",
    a: "Sí. Todas las sesiones en vivo se graban y quedan disponibles para repaso. Sin embargo, la asistencia en vivo es fuertemente recomendada para aprovechar las interacciones, preguntas y ejercicios en tiempo real.",
  },
  {
    q: "¿Qué pasa si me atraso o me atasco en un tema?",
    a: "Es normal. La curva de aprendizaje es empinada a propósito — eso es lo que la hace valiosa. Tenemos sesiones semanales de Q&A, canal de soporte en Slack/Discord con mentores, grabaciones de todas las clases, acceso a la comunidad de Costa Digital, y si necesitas más tiempo en un módulo, puedes retomar con la siguiente cohorte sin costo adicional.",
  },
  {
    q: "¿Obtengo un certificado?",
    a: "Sí. Al completar todos los módulos y el proyecto final, recibes un certificado de finalización. Pero el verdadero diferenciador es tu portafolio en GitHub: proyectos funcionales, desplegados y documentados que demuestran lo que sabes hacer.",
  },
  {
    q: "¿Puedo pagar en cuotas?",
    a: "Sí. Ofrecemos pago de la carrera completa en 6 cuotas mensuales de $500,000 COP. También hay descuento por pago único ($2,400,000) y tarifa especial para estudiantes ($1,800,000 con carnet vigente).",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-[var(--card-background)]/50">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Preguntas frecuentes
          </h2>
        </header>

        <dl className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-border-color bg-background overflow-hidden"
              >
                <dt>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-text-primary">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </dt>
                <dd
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
