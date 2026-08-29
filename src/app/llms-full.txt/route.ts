import { NextResponse } from 'next/server';
import { CONTACT } from '@/components/landing/data';
import {
  COMO_FUNCIONA,
  RUTAS,
  RUTAS_COHORTE,
  RUTAS_COMO_ENTRAS,
  RUTAS_FAQS_HOME,
  RUTAS_FIT,
  RUTAS_HERO,
  RUTAS_LEGAL,
  RUTAS_PRECIOS,
  DESPUES_CUMBRE,
  moduloHref,
  precioModulo,
} from '@/components/landing/rutas/data';
import { AGENTES_META, AGENTES_PATH } from '@/components/landing/agentes/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co';

/**
 * Versión completa en markdown del contenido del sitio, pensada para agentes
 * de IA: una sola petición con todo lo importante, sin HTML. Se genera desde
 * los mismos datos que renderizan las páginas, así que siempre está al día.
 */
export const dynamic = 'force-static';

export async function GET() {
  const l: string[] = [];

  l.push('# Tech Centre · Centro de Tecnología del Caribe');
  l.push('');
  l.push(`> ${RUTAS_HERO.subtitle}`);
  l.push('');
  l.push(RUTAS_HERO.manifesto);
  l.push('');
  l.push('## Datos clave');
  l.push('');
  l.push('- Sede: Casa Tech · Cra. 50 #72-126, El Prado, Barranquilla, Colombia');
  l.push(`- Contacto: ${CONTACT.email} · WhatsApp ${CONTACT.phone}`);
  l.push(`- Web: ${BASE_URL}`);
  l.push(`- Próxima cohorte: ${RUTAS_COHORTE.startDate} · máximo ${RUTAS_COHORTE.seatsTotal} personas por grupo`);
  l.push(`- Admisión: diagnóstico gratuito de 20 minutos (${BASE_URL}/agendar-diagnostico), sin examen ni pago. Ubica a cada persona en el módulo que le corresponde.`);
  l.push('');

  l.push('## Cómo funciona');
  l.push('');
  l.push(COMO_FUNCIONA.intro);
  l.push('');
  for (const stat of COMO_FUNCIONA.stats) {
    l.push(`- ${stat.value}: ${stat.detail}`);
  }
  l.push('');
  for (const level of COMO_FUNCIONA.levels) {
    l.push(`- ${level.label} (${level.name}): ${level.description}`);
  }
  l.push('');
  for (const callout of COMO_FUNCIONA.callouts) {
    l.push(`- ${callout.title}: ${callout.body}`);
  }
  l.push('');

  for (const ruta of RUTAS) {
    l.push(`## ${ruta.label}: ${ruta.name}`);
    l.push('');
    l.push(`${ruta.headline}. ${ruta.description}`);
    l.push(`Stack: ${ruta.stackPills.join(', ')}.`);
    l.push('');
    for (const modulo of ruta.modules) {
      const numero = ruta.modules.indexOf(modulo) + 1;
      const { precio, egresados } = precioModulo(modulo);
      l.push(`### Módulo ${numero}: ${modulo.title}`);
      l.push('');
      l.push(`- URL: ${BASE_URL}${moduloHref(modulo.slug)}`);
      l.push(`- Nivel: ${modulo.levelLabel}`);
      l.push(`- Duración: 8 semanas, 64 horas de formación`);
      l.push(`- Precio: ${precio} COP (egresados: ${egresados} COP)`);
      l.push(`- Stack: ${modulo.stack}`);
      l.push(`- Resultado: ${modulo.outcome}`);
      l.push(`- Requisito de entrada: ${modulo.requisito}`);
      l.push('- Temario:');
      for (const bullet of modulo.bullets) {
        l.push(`  - ${bullet}`);
      }
      l.push('');
    }
  }

  l.push('## Programa avanzado de ingeniería de agentes de IA');
  l.push('');
  l.push(`- URL: ${BASE_URL}${AGENTES_PATH}`);
  l.push(`- ${AGENTES_META.description}`);
  l.push('');

  l.push('## Cómo entras');
  l.push('');
  l.push(RUTAS_COMO_ENTRAS.intro);
  l.push('');
  for (const step of RUTAS_COMO_ENTRAS.steps) {
    l.push(`- ${step.when} · ${step.title}: ${step.body}`);
  }
  l.push('');
  l.push(RUTAS_COMO_ENTRAS.note);
  l.push('');

  l.push('## Inversión');
  l.push('');
  l.push(`- ${RUTAS_PRECIOS.moduloLabel}: ${RUTAS_PRECIOS.modulo} COP`);
  l.push(`- ${RUTAS_PRECIOS.moduloAvanzadoLabel}: ${RUTAS_PRECIOS.moduloAvanzado} COP`);
  l.push(`- Reserva de cupo: ${RUTAS_PRECIOS.reserva}`);
  l.push(`- Pago: hasta ${RUTAS_PRECIOS.cuotas} cuotas sin interés`);
  l.push(`- Egresados: ${RUTAS_PRECIOS.descuentoEgresados} de descuento (módulos 1 y 2: ${RUTAS_PRECIOS.moduloEgresados}, módulo 3: ${RUTAS_PRECIOS.moduloAvanzadoEgresados})`);
  l.push('- Qué incluye cada módulo:');
  for (const item of RUTAS_PRECIOS.incluye) {
    l.push(`  - ${item}`);
  }
  l.push(`- Becas: ${RUTAS_PRECIOS.becas}`);
  l.push(`- ${RUTAS_PRECIOS.sinRiesgo}`);
  l.push('');

  l.push('## Para quién es');
  l.push('');
  l.push(RUTAS_FIT.intro);
  l.push('');
  l.push(`${RUTAS_FIT.yesLabel}`);
  for (const item of RUTAS_FIT.yes) {
    l.push(`- ${item.lead} ${item.body}`);
  }
  l.push('');
  l.push(`${RUTAS_FIT.noLabel}`);
  for (const item of RUTAS_FIT.no) {
    l.push(`- ${RUTAS_FIT.noPrefix} ${item.lead}. ${item.body}`);
  }
  l.push('');

  l.push('## Después de tu ruta');
  l.push('');
  l.push(DESPUES_CUMBRE.intro);
  l.push('');
  for (const item of DESPUES_CUMBRE.items) {
    l.push(`- ${item.title}: ${item.body}`);
  }
  l.push('');

  l.push('## Preguntas frecuentes');
  l.push('');
  for (const faq of RUTAS_FAQS_HOME) {
    l.push(`### ${faq.q}`);
    l.push('');
    l.push(faq.a);
    l.push('');
  }

  l.push('## Nota legal');
  l.push('');
  l.push(RUTAS_LEGAL);
  l.push('');

  return new NextResponse(l.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
