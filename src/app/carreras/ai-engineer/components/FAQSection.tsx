"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Necesito saber programar para entrar?",
    a: "No. La Etapa 1 (Fundamentos) empieza desde cero: pensamiento computacional, terminal, Git y programación desde los conceptos más básicos. Solo necesitas computador, internet y disposición real de aprender.",
  },
  {
    q: "¿Qué ruta debo elegir, Web o Datos?",
    a: "Si quieres construir productos con IA que la gente usa todos los días (interfaces, apps) → Ruta Web · Construye, con TypeScript, React y Next.js. Si te atrae entender los datos y construir sistemas que razonan sobre información → Ruta de Datos · Revela, con Python, FastAPI y pipelines. Ambas rutas son independientes y completas, y comparten las etapas de IA aplicada y despliegue seguro.",
  },
  {
    q: "¿Ya tengo experiencia en web o datos, puedo saltarme lo básico?",
    a: "Sí. Si ya programas, puedes unirte directamente en la Etapa 3 · IA aplicada tras una breve validación de nivel, y enfocarte en agentes, RAG, evals y despliegue.",
  },
  {
    q: "¿Cuánto tiempo me toma y cuántas horas a la semana?",
    a: "Cada ruta dura 6 meses, de cero al perfil. Son 18 horas a la semana: 6 horas presenciales en el centro (Barranquilla) + 12 horas virtuales de práctica y proyecto guiado. Cada ruta se cursa por separado.",
  },
  {
    q: "¿Puedo tomar una sola etapa?",
    a: "Sí, cada etapa entrega algo real y desplegado. La Etapa 3 (IA aplicada) y la Etapa 4 (Despliegue seguro) requieren conocimientos previos equivalentes a las etapas 1 y 2 de tu ruta.",
  },
  {
    q: "¿Qué voy a tener al terminar?",
    a: "Un portafolio de productos reales desplegados, certificado de Tech Centre, acceso a la comunidad de egresados, y el perfil que la industria busca: Ingeniero de Aplicaciones de IA (AI Product / Full-Stack Engineer en Web, o AI Application Engineer · datos).",
  },
  {
    q: "¿Hay garantía de empleo?",
    a: "No ofrecemos garantía de empleo porque depende de factores como tu dedicación, portafolio y búsqueda activa. Lo que sí garantizamos: tendrás las skills técnicas, el portafolio y la red de contactos para competir por estos roles. El mercado tiene déficit de talento — las oportunidades están ahí.",
  },
  {
    q: "¿Cuáles son las formas de pago?",
    a: "Etapas individuales: pago único antes del inicio. Ruta completa ($3,600,000 COP): pago único, 3 cuotas de $1,200,000 o 6 cuotas de $600,000. Aceptamos transferencia bancaria, tarjeta de crédito y Nequi/Daviplata.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
            Preguntas frecuentes
          </h2>
        </header>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <article
                key={i}
                className="rounded-xl border border-border-color bg-[var(--card-background)] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-text-primary">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
