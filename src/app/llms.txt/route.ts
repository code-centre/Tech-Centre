import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';
import { CONTACT } from '@/components/landing/data';
import {
  MODULOS,
  RUTAS_COHORTE,
  RUTAS_PRECIOS,
  moduloHref,
  precioModulo,
} from '@/components/landing/rutas/data';
import { AGENTES_META, AGENTES_PATH } from '@/components/landing/agentes/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co';

export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const posts = (data ?? []) as Array<{ title: string; slug: string; excerpt: string | null }>;
  const lines: string[] = [];

  lines.push('# Tech Centre');
  lines.push('');
  lines.push(
    '> Centro de Tecnología del Caribe. Formación presencial en tecnología e IA en Barranquilla, Colombia: dos rutas de aprendizaje (Producto y Datos) compuestas por módulos independientes de 8 semanas, con mentores activos en la industria, grupos de máximo 12 personas y proyectos reales desplegados.',
  );
  lines.push('');
  lines.push('Datos clave:');
  lines.push('- Sede: Casa Tech · Cra. 50 #72-126, El Prado, Barranquilla, Colombia');
  lines.push(`- Contacto: ${CONTACT.email} · WhatsApp ${CONTACT.phone}`);
  lines.push('- Modalidad: presencial, 8 horas a la semana (4 en sede + 4 de práctica guiada), 64 horas por módulo');
  lines.push(`- Precios: módulos 1 y 2 ${RUTAS_PRECIOS.modulo} COP, módulo 3 avanzado ${RUTAS_PRECIOS.moduloAvanzado} COP. Reserva de cupo ${RUTAS_PRECIOS.reserva}, hasta ${RUTAS_PRECIOS.cuotas} cuotas sin interés, ${RUTAS_PRECIOS.descuentoEgresados} de descuento para egresados`);
  lines.push(`- Próxima cohorte: ${RUTAS_COHORTE.startDate} · ${RUTAS_COHORTE.seatsTotal} cupos por grupo`);
  lines.push('- La admisión empieza con un diagnóstico gratuito de 20 minutos que ubica a cada persona en el módulo que le corresponde, sin examen ni pago');
  lines.push('- Educación informal conforme al Decreto 1075 de 2015 (Colombia): se entrega constancia de participación, no título profesional');
  lines.push('');
  lines.push(`Versión completa del contenido del sitio en un solo archivo markdown: [llms-full.txt](${BASE_URL}/llms-full.txt)`);
  lines.push('');

  lines.push('## Programas');
  lines.push('');
  for (const { modulo, ruta, numero } of MODULOS) {
    const { precio } = precioModulo(modulo);
    lines.push(
      `- [${modulo.title}](${BASE_URL}${moduloHref(modulo.slug)}): Módulo ${numero} de la ${ruta.label} (${ruta.name}). ${modulo.outcome} Stack: ${modulo.stack}. 8 semanas, ${precio} COP.`,
    );
  }
  lines.push(
    `- [Programa avanzado de ingeniería de agentes de IA](${BASE_URL}${AGENTES_PATH}): ${AGENTES_META.description}`,
  );
  lines.push('');

  lines.push('## Páginas principales');
  lines.push('');
  lines.push(`- [Inicio: rutas de aprendizaje](${BASE_URL}/): las dos rutas, precios, método y preguntas frecuentes`);
  lines.push(`- [Agendar diagnóstico gratuito](${BASE_URL}/agendar-diagnostico): primer paso de admisión, 20 minutos, sin costo`);
  lines.push(`- [Metodología](${BASE_URL}/metodologia): cómo se aprende en Tech Centre`);
  lines.push(`- [Preguntas frecuentes](${BASE_URL}/faq)`);
  lines.push(`- [Comunidad](${BASE_URL}/comunidad): demo days, eventos y ecosistema Costa Digital`);
  lines.push(`- [Nosotros](${BASE_URL}/nosotros): quiénes somos y quiénes enseñan`);
  lines.push(`- [Empresas](${BASE_URL}/empresas): formación para equipos dentro de empresas`);
  lines.push(`- [Contacto](${BASE_URL}/contacto)`);
  lines.push('');

  if (posts.length > 0) {
    lines.push('## Blog');
    lines.push('');
    for (const post of posts) {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const desc = post.excerpt?.trim() || post.title;
      lines.push(`- [${post.title}](${url}): ${desc}`);
    }
    lines.push('');
  }

  const content = lines.join('\n');

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
