import type { Metadata } from 'next';
import PageHero from '@/components/landing/PageHero';
import Reveal from '@/components/landing/Reveal';
import DiagnosticoBookingForm from './DiagnosticoBookingForm';
import { createClient } from '@/lib/supabase/server';
import {
  getDiagnosticoProgramOptions,
  resolveDiagnosticoDefaultProgram,
} from '@/lib/diagnostico/program-options';

export const metadata: Metadata = {
  title: 'Agendar diagnóstico gratuito',
  description:
    'Agenda tu diagnóstico gratuito en Tech Centre. Te ubicamos en el módulo o programa correcto según tu nivel.',
  robots: { index: true, follow: true },
};

const PROGRAM_BY_QUERY: Record<string, string> = {
  producto: 'Rutas de aprendizaje (Producto)',
  datos: 'Rutas de aprendizaje (Datos)',
  agentes: 'Ingeniería de agentes',
  'ingenieria-agentes': 'Ingeniería de agentes',
  'ia-engineer': 'Carrera IA Engineer',
  modulo: 'Módulo específico',
};

interface PageProps {
  searchParams: Promise<{
    programa?: string;
    origen?: string;
  }>;
}

export default async function AgendarDiagnosticoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const programKey = params.programa?.toLowerCase() ?? '';
  const source = params.origen?.trim() || 'agendar-diagnostico';

  const supabase = await createClient();
  const programOptions = await getDiagnosticoProgramOptions(supabase);
  const defaultProgram = resolveDiagnosticoDefaultProgram(programKey, programOptions, PROGRAM_BY_QUERY);

  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Diagnóstico gratuito"
        title={
          <>
            Agenda tu{' '}
            <span className="lv2-mint">diagnóstico</span>
          </>
        }
        subtitle="20 minutos, sin examen y sin pago. Te decimos en qué módulo o programa debes empezar."
      />

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <DiagnosticoBookingForm
              programOptions={programOptions}
              defaultProgram={defaultProgram}
              source={source}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
