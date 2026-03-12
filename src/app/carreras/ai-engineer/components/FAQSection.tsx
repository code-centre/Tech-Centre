"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Necesito saber programar para entrar?",
    a: "No. El módulo 0 (Fundamentos Tech) empieza desde cero con Terminal, Git y entorno de desarrollo. El módulo 1 te enseña programación desde los conceptos más básicos. Solo necesitas computador, internet y disposición real de aprender.",
  },
  {
    q: "¿Qué ruta debo elegir, Python o JavaScript?",
    a: "Si tu objetivo es AI/ML Engineering, investigación o data science → elige Python. Si quieres ser Full Stack Developer que integra IA en productos web → elige JavaScript. Ambas rutas convergen en los módulos 3 y 4 donde aprenderás IA aplicada y cloud.",
  },
  {
    q: "¿Puedo trabajar mientras estudio?",
    a: "Sí, el programa está diseñado para personas que trabajan. Requiere ~9–12 horas/semana: 4 horas de clase presencial + 5–8 horas de práctica autónoma. Es exigente pero compatible con un empleo full-time.",
  },
  {
    q: "¿Puedo tomar un solo módulo?",
    a: "Sí, cada módulo funciona como un curso independiente con su propio proyecto y certificado. El módulo 3 (IA Aplicada) y el 4 (Cloud) requieren conocimientos previos de programación equivalentes a los módulos 1 y 2.",
  },
  {
    q: "¿Qué pasa si me atraso o no puedo asistir a una clase?",
    a: "Todas las clases se graban y están disponibles en la plataforma. Tienes acceso al canal de soporte y a sesiones semanales de Q&A para ponerte al día. Si necesitas pausar, puedes retomar en la siguiente cohorte.",
  },
  {
    q: "¿Qué voy a tener al terminar?",
    a: "Un portafolio en GitHub con proyectos reales desplegados, certificado de Tech Centre de Costa Digital, acceso permanente a la comunidad, y las habilidades técnicas para aplicar a roles de AI/ML Engineer, Full Stack AI Developer o empezar tu propio proyecto.",
  },
  {
    q: "¿Hay garantía de empleo?",
    a: "No ofrecemos garantía de empleo porque depende de factores como tu dedicación, portafolio y búsqueda activa. Lo que sí garantizamos: tendrás las skills técnicas, el portafolio y la red de contactos para competir por estos roles. El mercado tiene déficit de talento — las oportunidades están ahí.",
  },
  {
    q: "¿Cuáles son las formas de pago?",
    a: "Módulos individuales: pago único antes del inicio. Carrera completa ($2,500,000 COP): pago único, 3 cuotas o 6 cuotas. Aceptamos transferencia bancaria, tarjeta de crédito y Nequi/Daviplata.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
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
