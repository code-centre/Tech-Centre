import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description: "Aviso de privacidad de Tech Centre. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function AvisoDePrivacidad() {
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
            Aviso de Privacidad
          </h1>
          <p className="text-text-muted text-sm">
            Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Contenido */}
        <div className="prose prose-lg max-w-none card-background p-8 rounded-xl border border-border-color">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Información que Recopilamos</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Tech Centre recopila información personal que usted nos proporciona directamente cuando:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li>Se registra en nuestro sitio web o plataforma</li>
              <li>Se inscribe en nuestros programas educativos</li>
              <li>Realiza pagos o transacciones</li>
              <li>Se comunica con nosotros por correo electrónico, teléfono o chat</li>
              <li>Participa en encuestas, eventos o actividades</li>
            </ul>
            <p className="text-text-primary leading-relaxed mt-4">
              La información que recopilamos puede incluir: nombre completo, documento de identidad, dirección de correo electrónico, 
              número de teléfono, dirección postal, información de pago, historial académico, y cualquier otra información que 
              voluntariamente nos proporcione.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">2. Cómo Usamos la Información</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Utilizamos la información recopilada para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li>Procesar y gestionar sus inscripciones a nuestros programas</li>
              <li>Proporcionar servicios educativos y de apoyo académico</li>
              <li>Procesar pagos y gestionar transacciones financieras</li>
              <li>Comunicarnos con usted sobre su cuenta, programas y servicios</li>
              <li>Enviar información sobre nuevos programas, eventos y oportunidades</li>
              <li>Mejorar nuestros servicios y experiencia del usuario</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Prevenir fraudes y garantizar la seguridad de nuestros servicios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Compartir Información con Terceros</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Tech Centre no vende ni alquila su información personal. Podemos compartir su información únicamente en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar nuestro negocio (procesadores de pago, 
              servicios de hosting, plataformas educativas) bajo estrictos acuerdos de confidencialidad</li>
              <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley, orden judicial o proceso legal</li>
              <li><strong>Protección de derechos:</strong> Para proteger los derechos, propiedad o seguridad de Tech Centre, nuestros estudiantes o terceros</li>
              <li><strong>Con su consentimiento:</strong> En cualquier otra situación con su consentimiento explícito</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">4. Seguridad de Datos</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal contra 
              acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li>Encriptación de datos sensibles en tránsito y en reposo</li>
              <li>Controles de acceso estrictos y autenticación</li>
              <li>Monitoreo regular de nuestros sistemas de seguridad</li>
              <li>Capacitación del personal sobre privacidad y seguridad</li>
            </ul>
            <p className="text-text-primary leading-relaxed mt-4">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos 
              por proteger su información, no podemos garantizar seguridad absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Derechos del Usuario</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              De acuerdo con la Ley 1581 de 2012 y otras normativas aplicables en Colombia, usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li><strong>Conocer:</strong> Acceder a su información personal que tenemos en nuestros registros</li>
              <li><strong>Actualizar:</strong> Solicitar la corrección de información inexacta o incompleta</li>
              <li><strong>Suprimir:</strong> Solicitar la eliminación de su información personal cuando ya no sea necesaria</li>
              <li><strong>Revocar:</strong> Revocar su consentimiento para el tratamiento de datos personales</li>
              <li><strong>Presentar quejas:</strong> Presentar quejas ante la Superintendencia de Industria y Comercio</li>
            </ul>
            <p className="text-text-primary leading-relaxed mt-4">
              Para ejercer estos derechos, puede contactarnos a través de los medios indicados en la sección de contacto.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Cookies y Tecnologías Similares</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Las cookies son pequeños 
              archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio.
            </p>
            <p className="text-text-primary leading-relaxed mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-primary">
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Analizar cómo utiliza nuestro sitio web</li>
              <li>Mejorar la funcionalidad y personalización</li>
              <li>Proporcionar contenido relevante</li>
            </ul>
            <p className="text-text-primary leading-relaxed mt-4">
              Puede controlar las cookies a través de la configuración de su navegador. Sin embargo, deshabilitar ciertas cookies 
              puede afectar la funcionalidad de nuestro sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Retención de Datos</h2>
            <p className="text-text-primary leading-relaxed">
              Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en este aviso, 
              cumplir con obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos. Una vez que la información ya no 
              sea necesaria, la eliminaremos de forma segura o la anonimizaremos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">8. Actualizaciones a esta Política</h2>
            <p className="text-text-primary leading-relaxed">
              Podemos actualizar este aviso de privacidad periódicamente para reflejar cambios en nuestras prácticas o por otras razones 
              operativas, legales o regulatorias. Le notificaremos sobre cambios significativos publicando el nuevo aviso en nuestro sitio 
              web y actualizando la fecha de "última actualización". Le recomendamos revisar este aviso periódicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">9. Menores de Edad</h2>
            <p className="text-text-primary leading-relaxed">
              Nuestros servicios están dirigidos a personas mayores de 18 años. Si un menor de edad desea inscribirse en nuestros programas, 
              requerimos el consentimiento de un padre, madre o tutor legal. No recopilamos intencionalmente información personal de menores 
              sin el consentimiento apropiado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">10. Contacto</h2>
            <p className="text-text-primary leading-relaxed mb-4">
              Si tiene preguntas, inquietudes o solicitudes relacionadas con este aviso de privacidad o el tratamiento de su información 
              personal, puede contactarnos a través de:
            </p>
            <ul className="list-none space-y-2 text-text-primary">
              <li><strong>Email:</strong> admisiones@techcentre.co</li>
              <li><strong>Teléfono:</strong> +57 300 552 3872</li>
              <li><strong>Dirección:</strong> Cra. 50 # 72-126, Centro Histórico, Barranquilla, Colombia</li>
            </ul>
            <p className="text-text-primary leading-relaxed mt-4">
              También puede presentar quejas ante la Superintendencia de Industria y Comercio (SIC) si considera que sus derechos de 
              protección de datos han sido vulnerados.
            </p>
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
