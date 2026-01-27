"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "¿Qué metodología de enseñanza utilizan?",
    answer: "Nuestra metodología es 100% práctica y basada en proyectos reales. Combinamos sesiones teóricas con ejercicios prácticos y casos de estudio para asegurar que los conocimientos sean aplicables inmediatamente en el entorno laboral."
  },
  {
    question: "¿Pueden personalizar los contenidos para nuestra empresa?",
    answer: "¡Sí! Todos nuestros programas son personalizables según las necesidades específicas de su empresa. Trabajamos en estrecha colaboración con su equipo para adaptar los contenidos, ejemplos y casos de estudio a su industria y desafíos particulares."
  },
  {
    question: "¿Qué modalidades de formación ofrecen?",
    answer: "Ofrecemos diferentes modalidades para adaptarnos a sus necesidades: formación presencial en sus instalaciones, virtual en vivo, o una modalidad híbrida. También podemos grabar las sesiones para que su equipo pueda acceder al contenido posteriormente."
  },
  {
    question: "¿Qué requisitos técnicos se necesitan?",
    answer: "Para la formación virtual, solo se requiere conexión a internet estable y un computador con navegador web actualizado. En caso de que el curso incluya herramientas específicas, le proporcionaremos acceso a entornos en la nube o le indicaremos los requisitos con anticipación."
  },
  {
    question: "¿Entregan certificación al finalizar los cursos?",
    answer: "Sí, todos los participantes que completen satisfactoriamente el programa recibirán un certificado de participación. Además, en algunos cursos ofrecemos certificaciones oficiales de las tecnologías correspondientes."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-zuccini font-bold mb-4">Preguntas frecuentes</h2>
            <p className="text-white">
              Encuentra respuestas a las dudas más comunes sobre nuestros programas para empresas.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-bgCard rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-800/30 group  sm:rounded-lg p-2">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-bgCard rounded-xl hover:bg-white  transition-colors text-white hover:text-black "
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  {openIndex === index ? <ChevronUp className="h-5 w-5 text-zuccini" /> : <ChevronDown className="h-5 w-5 text-zuccini" />}
                </button>
                {openIndex === index && (
                  <div className="p-6 bg-bgCard">
                    <p className="text-white">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-zuccini mb-6">¿No encontraste lo que buscabas?</p>
              <button
                type="button"
                className=" inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-zuccini to-blue-600 hover:from-blue-600 hover:to-zuccini shadow-lg shadow-zuccini/20 hover:shadow-zuccini/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" 
              >
                <a href="#contacto">
                    Contáctanos
                </a>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
