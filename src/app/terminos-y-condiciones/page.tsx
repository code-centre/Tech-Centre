import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de Tech Centre. Conoce las reglas y políticas que rigen el uso de nuestros servicios educativos.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function TerminosYCondiciones() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            Términos y Condiciones
          </h1>
          <p className="text-text-muted text-sm">
            Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Contenido */}
        <div className="prose prose-lg max-w-none card-background p-8 rounded-xl border border-border-color">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Aceptación de los Términos</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Al acceder y utilizar los servicios de Tech Centre, usted acepta estar sujeto a estos términos y condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
            <p className="text-text-primary leading-relaxed">
              Estos términos se aplican a todos los usuarios del sitio web, estudiantes inscritos, y cualquier persona 
              que acceda o utilice nuestros servicios educativos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">2. Uso del Servicio</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Tech Centre proporciona programas educativos, cursos y servicios relacionados con tecnología. Usted se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li>Proporcionar información veraz, precisa y completa al registrarse</li>
              <li>Mantener la confidencialidad de su cuenta y contraseña</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Utilizar nuestros servicios únicamente para fines legales y educativos</li>
              <li>No compartir su acceso con terceros sin autorización</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Inscripciones y Pagos</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Las inscripciones a nuestros programas están sujetas a disponibilidad y al cumplimiento de los requisitos establecidos. 
              Los pagos deben realizarse según las condiciones acordadas al momento de la inscripción.
            </p>
            <p className="text-text-primary leading-relaxed mb-4">
              <strong>Política de Reembolsos:</strong> Las solicitudes de reembolso deben realizarse dentro de los primeros 7 días 
              después del inicio del programa. Los reembolsos están sujetos a evaluación y pueden aplicar cargos administrativos.
            </p>
            <p className="text-text-primary leading-relaxed">
              <strong>Cancelaciones:</strong> Tech Centre se reserva el derecho de cancelar o posponer programas por razones 
              operativas. En caso de cancelación por parte de Tech Centre, se ofrecerá un reembolso completo o la opción de 
              transferir la inscripción a otra cohorte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">4. Propiedad Intelectual</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Todo el contenido proporcionado por Tech Centre, incluyendo pero no limitado a materiales de curso, videos, 
              documentos, software y recursos educativos, es propiedad de Tech Centre o de sus licenciantes y está protegido 
              por leyes de propiedad intelectual.
            </p>
            <p className="text-text-primary leading-relaxed">
              Usted no puede reproducir, distribuir, modificar, crear obras derivadas, mostrar públicamente o utilizar de 
              cualquier manera el contenido sin el consentimiento previo por escrito de Tech Centre.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Limitación de Responsabilidad</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Tech Centre se esfuerza por proporcionar servicios educativos de alta calidad, sin embargo:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li>No garantizamos resultados específicos de aprendizaje o empleo</li>
              <li>No somos responsables por decisiones tomadas basándose en la información proporcionada</li>
              <li>No garantizamos la disponibilidad ininterrumpida de nuestros servicios</li>
              <li>No somos responsables por daños indirectos, incidentales o consecuentes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Modificaciones a los Términos</h2>
            <p className="text-text-primary leading-relaxed">
              Tech Centre se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones 
              entrarán en vigor inmediatamente después de su publicación en el sitio web. Es su responsabilidad revisar periódicamente 
              estos términos. El uso continuado de nuestros servicios después de cualquier modificación constituye su aceptación 
              de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Ley Aplicable</h2>
            <p className="text-text-primary leading-relaxed">
              Estos términos y condiciones se rigen por las leyes de la República de Colombia. Cualquier disputa relacionada 
              con estos términos será resuelta en los tribunales competentes de Barranquilla, Colombia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">8. Contacto</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Si tiene preguntas sobre estos términos y condiciones, puede contactarnos a través de:
            </p>
            <ul className="list-none space-y-2 text-text-primary">
              <li><strong>Email:</strong> admisiones@techcentre.co</li>
              <li><strong>Teléfono:</strong> +57 300 552 3872</li>
              <li><strong>Dirección:</strong> Cra. 50 # 72-126, Centro Histórico, Barranquilla, Colombia</li>
            </ul>
          </section>
        </div>

        {/* Botón de regreso */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
