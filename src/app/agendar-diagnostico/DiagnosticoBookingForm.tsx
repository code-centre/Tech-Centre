'use client';

import { useState, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarDays, CheckCircle, Loader2 } from 'lucide-react';
import { submitDiagnosticoBooking } from './actions';
import { GOOGLE_CALENDAR_DIAGNOSTICO_URL } from '@/components/landing/rutas/data';

const PROGRAM_OPTIONS = [
  'Rutas de aprendizaje (Producto)',
  'Rutas de aprendizaje (Datos)',
  'Ingeniería de agentes',
  'Carrera IA Engineer',
  'Módulo específico',
  'Aún no lo sé, quiero orientación',
] as const;

interface DiagnosticoBookingFormProps {
  defaultProgram?: string;
  source?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  program: string;
  message: string;
  company: string;
}

export default function DiagnosticoBookingForm({
  defaultProgram,
  source = 'agendar-diagnostico',
}: DiagnosticoBookingFormProps) {
  const initialProgram = useMemo(() => {
    if (defaultProgram && PROGRAM_OPTIONS.includes(defaultProgram as (typeof PROGRAM_OPTIONS)[number])) {
      return defaultProgram;
    }
    return PROGRAM_OPTIONS[0];
  }, [defaultProgram]);

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    program: initialProgram,
    message: '',
    company: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fieldClass =
    'mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--paper)] placeholder:text-[var(--mute)] focus:border-[var(--mint)] focus:outline-none focus:ring-1 focus:ring-[var(--mint)]';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitDiagnosticoBooking({
      ...form,
      source,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'No pudimos enviar tu solicitud.');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <section className="lv2-card p-8 text-center" aria-live="polite">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(63,224,160,0.15)] text-[var(--mint)]">
          <CheckCircle className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-[var(--paper)]">
          Solicitud recibida
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed lv2-soft">
          Ya notificamos al equipo. El último paso es elegir el horario que te quede mejor en el calendario.
        </p>
        <a
          href={GOOGLE_CALENDAR_DIAGNOSTICO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lv2-btn mt-6 inline-flex"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Elegir horario en el calendario
        </a>
        <p className="mt-4 text-xs lv2-soft">
          Si no se abre el calendario,{' '}
          <Link href="/contacto" className="text-[var(--mint)] hover:underline">
            contáctanos
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lv2-card p-7">
      <p className="mb-6 text-sm leading-relaxed lv2-soft">
        Cuéntanos sobre ti y te enviamos al calendario para confirmar la fecha. El diagnóstico es gratuito y dura unos 20 minutos.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="lv2-mono">Nombre completo</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={fieldClass}
            placeholder="Tu nombre"
          />
        </label>

        <label className="block">
          <span className="lv2-mono">Correo</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={fieldClass}
            placeholder="tu@correo.com"
          />
        </label>

        <label className="block">
          <span className="lv2-mono">WhatsApp / teléfono</span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={fieldClass}
            placeholder="300 123 4567"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="lv2-mono">¿Qué te interesa?</span>
          <select
            name="program"
            required
            value={form.program}
            onChange={(e) => setForm({ ...form, program: e.target.value })}
            className={fieldClass}
          >
            {PROGRAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="lv2-mono">Mensaje (opcional)</span>
          <textarea
            name="message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={fieldClass}
            placeholder="Cuéntanos tu nivel, dudas o qué módulo te interesa"
          />
        </label>
      </div>

      <input
        type="text"
        name="company"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {error && (
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="lv2-btn mt-6 w-full disabled:opacity-60">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          <>
            Continuar al calendario
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
