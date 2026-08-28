'use server';

import { createClient } from '@/lib/supabase/server';
import { sendDiagnosticoBookingNotification } from '@/lib/email/diagnostico-notification';
import {
  getDiagnosticoProgramOptions,
  isAllowedDiagnosticoProgram,
} from '@/lib/diagnostico/program-options';
import { headers } from 'next/headers';

export interface DiagnosticoFormData {
  name: string;
  email: string;
  phone: string;
  program: string;
  message?: string;
  source?: string;
  company?: string;
}

export interface DiagnosticoActionResult {
  success: boolean;
  message?: string;
  error?: string;
  emailSent?: boolean;
}

async function validateForm(data: DiagnosticoFormData): Promise<{ valid: boolean; error?: string }> {
  if (data.company?.trim()) {
    return { valid: false };
  }

  if (!data.name?.trim()) {
    return { valid: false, error: 'El nombre es requerido' };
  }

  if (!data.email?.trim()) {
    return { valid: false, error: 'El correo es requerido' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return { valid: false, error: 'El correo no es válido' };
  }

  const phoneDigits = (data.phone ?? '').replace(/\D/g, '');
  if (phoneDigits.length < 8) {
    return { valid: false, error: 'El teléfono debe tener al menos 8 dígitos' };
  }

  const programOptions = await getDiagnosticoProgramOptions();

  if (!data.program?.trim() || !isAllowedDiagnosticoProgram(data.program, programOptions)) {
    return { valid: false, error: 'Selecciona un programa con cohorte activa u orientación' };
  }

  return { valid: true };
}

export async function submitDiagnosticoBooking(
  formData: DiagnosticoFormData,
): Promise<DiagnosticoActionResult> {
  try {
    const validation = await validateForm(formData);
    if (!validation.valid) {
      if (!validation.error) {
        return { success: true, message: 'Solicitud recibida' };
      }
      return { success: false, error: validation.error };
    }

    const headersList = await headers();
    const referrer = headersList.get('referer');
    const submittedAt = new Date().toISOString();
    const phoneDigits = formData.phone.replace(/\D/g, '');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: phoneDigits,
      program: formData.program.trim(),
      message: formData.message?.trim() || null,
      source: formData.source?.trim() || 'agendar-diagnostico',
      referrer,
      submittedAt,
    };

    const supabase = await createClient();
    const notesData = {
      program: payload.program,
      message: payload.message,
      source: payload.source,
      metadata: {
        referrer,
        submittedAt,
        type: 'diagnostico_booking',
      },
    };

    const { error: leadError } = await supabase.from('leads').insert({
      full_name: payload.name,
      email: payload.email,
      phone: payload.phone,
      source: 'diagnostico_booking',
      stage: 'diagnostico',
      notes: JSON.stringify(notesData),
    } as never);

    if (leadError) {
      console.error('[diagnostico] Error guardando lead:', leadError);
    }

    const emailResult = await sendDiagnosticoBookingNotification(payload);

    if (!emailResult.sent) {
      console.warn('[diagnostico] Lead guardado pero correo no enviado:', emailResult.error);
    }

    return {
      success: true,
      message: 'Solicitud enviada. Elige tu horario en el calendario.',
      emailSent: emailResult.sent,
    };
  } catch (error) {
    console.error('[diagnostico] Error inesperado:', error);
    return {
      success: false,
      error: 'No pudimos registrar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.',
    };
  }
}
