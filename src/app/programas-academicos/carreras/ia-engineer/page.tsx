import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Award, 
  CheckCircle2, 
  BrainCircuit, 
  Target, 
  TrendingUp,
  MessageCircle,
  Calendar
} from "lucide-react";

export const metadata: Metadata = {
  title: "Carrera IA Engineer - Tech Centre",
  description: "Conviértete en un especialista en Inteligencia Artificial. Formación integral de 12 meses en Machine Learning, Deep Learning, NLP y MLOps. Carrera tecnológica de vanguardia en Barranquilla.",
  keywords: [
    "carrera inteligencia artificial",
    "IA Engineer",
    "machine learning carrera",
    "deep learning formación",
    "carrera IA Barranquilla",
    "MLOps Colombia",
    "especialista IA",
    "carrera tecnología",
    "inteligencia artificial Colombia"
  ],
  openGraph: {
    title: "Carrera IA Engineer - Tech Centre",
    description: "Conviértete en un especialista en Inteligencia Artificial con nuestra carrera integral de 12 meses.",
    type: "website",
  },
};

const WHATSAPP_URL = 'https://wa.me/573005523872?text=Hola%2C%20quiero%20información%20sobre%20la%20carrera%20IA%20Engineer';

export default function IAEngineerCareer() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-background">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              href="/programas-academicos"
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Programas Académicos
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <span className="text-purple-400 font-semibold">Carrera Tecnológica</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
                IA Engineer
              </h1>
              
              <p className="text-xl text-text-muted mb-8 leading-relaxed">
                Formación integral para convertirte en un especialista en Inteligencia Artificial, 
                dominando desde los fundamentos de Machine Learning hasta el despliegue de modelos a escala.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">12 meses</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Award className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">Intermedio-Avanzado</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">Híbrido</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-5 w-5" />
                  Iniciar conversación
                </a>
                <Link
                  href="#programa"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border-color text-text-primary font-medium rounded-lg hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
                >
                  Ver programa detallado
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/courses/iaengineerpics.png"
                  alt="IA Engineer Career"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programa Detallado */}
      <section id="programa" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Programa de Formación
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Un viaje completo por el ecosistema de Inteligencia Artificial, desde los conceptos fundamentales hasta aplicaciones avanzadas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Módulo 1: Fundamentos de Machine Learning",
                topics: [
                  "Algoritmos de clasificación y regresión",
                  "Árboles de decisión y ensemble methods",
                  "Validación cruzada y métricas de evaluación",
                  "Feature engineering y selección de variables"
                ],
                duration: "8 semanas"
              },
              {
                title: "Módulo 2: Deep Learning y Redes Neuronales",
                topics: [
                  "Perceptrones y arquitecturas básicas",
                  "Redes neuronales convolucionales (CNN)",
                  "Redes neuronales recurrentes (RNN, LSTM)",
                  "Transfer learning y fine-tuning"
                ],
                duration: "10 semanas"
              },
              {
                title: "Módulo 3: Procesamiento de Lenguaje Natural",
                topics: [
                  "Tokenización y embeddings",
                  "Modelos transformer (BERT, GPT)",
                  "Análisis de sentimiento y clasificación de texto",
                  "Generación de texto y chatbots"
                ],
                duration: "8 semanas"
              },
              {
                title: "Módulo 4: Computer Vision",
                topics: [
                  "Procesamiento de imágenes básico",
                  "Detección de objetos y segmentación",
                  "Reconocimiento facial",
                  "Aplicaciones en tiempo real"
                ],
                duration: "8 semanas"
              },
              {
                title: "Módulo 5: MLOps y Despliegue",
                topics: [
                  "Containerización con Docker",
                  "Orquestación con Kubernetes",
                  "CI/CD para modelos de ML",
                  "Monitorización y mantenimiento"
                ],
                duration: "8 semanas"
              },
              {
                title: "Módulo 6: Ética y Responsabilidad en IA",
                topics: [
                  "Sesgos en algoritmos de ML",
                  "IA explicable (XAI)",
                  "Privacidad y protección de datos",
                  "Regulaciones y cumplimiento"
                ],
                duration: "4 semanas"
              }
            ].map((module, index) => (
              <div key={index} className="bg-bg-card border border-border-color rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">{module.title}</h3>
                  <span className="text-sm text-purple-400 font-medium">{module.duration}</span>
                </div>
                <ul className="space-y-2">
                  {module.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-text-muted">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfil del Egresado */}
      <section className="py-20 px-4 bg-bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6">Perfil del Egresado</h2>
              <p className="text-text-muted mb-6">
                Al finalizar la carrera, serás capaz de liderar proyectos de Inteligencia Artificial 
                desde la concepción hasta el despliegue en producción.
              </p>
              
              <div className="space-y-4">
                {[
                  "Diseñar y implementar modelos de Machine Learning y Deep Learning",
                  "Optimizar algoritmos para mejorar rendimiento y eficiencia",
                  "Desplegar soluciones de IA a escala con MLOps",
                  "Evaluar y mitigar sesgos en modelos de IA",
                  "Comunicar resultados técnicos a stakeholders no técnicos",
                  "Liderar equipos de desarrollo de IA"
                ].map((skill, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                    <span className="text-text-secondary">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6">Oportunidades Laborales</h2>
              <p className="text-text-muted mb-6">
                La demanda de especialistas en IA sigue creciendo exponencialmente. 
                Nuestros egresados se posicionan en roles clave del mercado tecnológico.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  "Machine Learning Engineer",
                  "Data Scientist",
                  "AI Researcher",
                  "MLOps Engineer",
                  "Computer Vision Engineer",
                  "NLP Specialist"
                ].map((role, index) => (
                  <div key={index} className="bg-background border border-border-color rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-text-primary">{role}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-purple-400">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Salario promedio: $8M - $15M COP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Admisión */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-6">Proceso de Admisión</h2>
          <p className="text-lg text-text-muted mb-12">
            Únete a la próxima cohorte de IA Engineers y transforma tu carrera profesional.
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { step: "1", title: "Aplicación", desc: "Completa el formulario de admisión" },
              { step: "2", title: "Entrevista", desc: "Evaluación de perfil y motivación" },
              { step: "3", title: "Selección", desc: "Notificación de resultados" },
              { step: "4", title: "Matrícula", desc: "Formaliza tu inscripción" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">{item.step}</div>
                  <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border-color -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Calendar className="h-5 w-5" />
              Agendar entrevista
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border-color text-text-primary font-medium rounded-lg hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              Más información
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
