import type { Json } from '@/types/supabase';

export interface EmailTemplateDefinition {
  slug: string;
  name: string;
  description: string;
  subject: string;
  html_body: string;
  text_body: string;
  sample_variables: Record<string, string>;
}

const SITE = 'https://www.techcentre.co';

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  {
    slug: 'enrollment_confirmed',
    name: 'Inscripción confirmada',
    description: 'Se envía al estudiante cuando su matrícula queda confirmada (status enrolled).',
    subject: '¡Bienvenido/a a {{program_name}}! — Tech Centre',
    html_body: `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b">¡Tu inscripción está confirmada!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Hola <strong>{{student_name}}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Tu matrícula en <strong>{{program_name}}</strong> (cohorte {{cohort_name}}) quedó confirmada. Las clases inician el <strong>{{start_date}}</strong>.</p>
<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#71717a"><strong>Sede:</strong> {{campus}} · <strong>Modalidad:</strong> {{modality}}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#71717a">Desde tu perfil puedes ver el detalle del curso, pagos y materiales cuando estén disponibles.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background-color:#0F5C4C"><a href="{{profile_url}}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">Ir a mi perfil</a></td></tr></table>`,
    text_body: `Hola {{student_name}},

Tu inscripción en {{program_name}} (cohorte {{cohort_name}}) está confirmada.
Inicio de clases: {{start_date}}
Sede: {{campus}} · Modalidad: {{modality}}

Perfil: {{profile_url}}`,
    sample_variables: {
      student_name: 'María García',
      student_email: 'maria@ejemplo.com',
      program_name: 'Ingeniería de Producto',
      cohort_name: 'Cohorte Sep 2026',
      start_date: '5 de septiembre de 2026',
      campus: 'Casa Tech · El Prado',
      modality: 'Presencial',
      profile_url: `${SITE}/perfil`,
      site_url: SITE,
    },
  },
  {
    slug: 'cohort_starts_7d',
    name: 'Inicio de clases en 7 días',
    description: 'Recordatorio una semana antes del inicio de la cohorte.',
    subject: 'Faltan 7 días para iniciar {{program_name}} — Tech Centre',
    html_body: `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b">Tu cohorte arranca pronto</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Hola <strong>{{student_name}}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Faltan <strong>{{days_until_start}} días</strong> para el inicio de <strong>{{program_name}}</strong> ({{cohort_name}}).</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Fecha de inicio: <strong>{{start_date}}</strong><br>Sede: {{campus}} · Modalidad: {{modality}}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#71717a">Te recomendamos revisar tu perfil y preparar tu equipo para la primera sesión.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background-color:#0F5C4C"><a href="{{profile_url}}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">Ver mi curso</a></td></tr></table>`,
    text_body: `Hola {{student_name}},

Faltan {{days_until_start}} días para iniciar {{program_name}} ({{cohort_name}}).
Inicio: {{start_date}}
Sede: {{campus}} · Modalidad: {{modality}}

Perfil: {{profile_url}}`,
    sample_variables: {
      student_name: 'María García',
      student_email: 'maria@ejemplo.com',
      program_name: 'Ingeniería de Producto',
      cohort_name: 'Cohorte Sep 2026',
      start_date: '5 de septiembre de 2026',
      days_until_start: '7',
      campus: 'Casa Tech · El Prado',
      modality: 'Presencial',
      profile_url: `${SITE}/perfil`,
      site_url: SITE,
    },
  },
  {
    slug: 'cohort_starts_1d',
    name: 'Inicio de clases mañana',
    description: 'Recordatorio un día antes del inicio de la cohorte.',
    subject: 'Mañana empiezan tus clases — {{program_name}}',
    html_body: `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b">¡Mañana es el gran día!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Hola <strong>{{student_name}}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Mañana <strong>{{start_date}}</strong> iniciamos <strong>{{program_name}}</strong> ({{cohort_name}}).</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Te esperamos en <strong>{{campus}}</strong> ({{modality}}).</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#71717a">Si tienes dudas de último momento, escríbenos por WhatsApp o revisa la información en tu perfil.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background-color:#0F5C4C"><a href="{{profile_url}}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">Ir a mi perfil</a></td></tr></table>`,
    text_body: `Hola {{student_name}},

Mañana {{start_date}} inician tus clases de {{program_name}} ({{cohort_name}}).
Sede: {{campus}} · Modalidad: {{modality}}

Perfil: {{profile_url}}`,
    sample_variables: {
      student_name: 'María García',
      student_email: 'maria@ejemplo.com',
      program_name: 'Ingeniería de Producto',
      cohort_name: 'Cohorte Sep 2026',
      start_date: '5 de septiembre de 2026',
      days_until_start: '1',
      campus: 'Casa Tech · El Prado',
      modality: 'Presencial',
      profile_url: `${SITE}/perfil`,
      site_url: SITE,
    },
  },
  {
    slug: 'diagnostico_admin',
    name: 'Notificación diagnóstico (admin)',
    description: 'Notifica al equipo cuando alguien solicita agendar un diagnóstico.',
    subject: '[Tech Centre] Diagnóstico — {{name}} ({{program}})',
    html_body: `<h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#18181b">Nueva solicitud de diagnóstico</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Alguien solicitó agendar un diagnóstico. Revisa los datos y confirma la cita en Google Calendar si aún no quedó agendada.</p>
<table style="border-collapse:collapse;width:100%;font-size:14px;margin-top:8px">
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;width:180px">Nombre</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{name}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Correo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{email}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Teléfono</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{phone}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Programa</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{program}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Mensaje</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{message}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Origen</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{source}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Referrer</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{referrer}}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Fecha</td><td style="padding:8px 12px;border:1px solid #e5e7eb">{{submitted_at}}</td></tr>
</table>`,
    text_body: `Nueva solicitud de diagnóstico — Tech Centre

Nombre: {{name}}
Correo: {{email}}
Teléfono: {{phone}}
Programa: {{program}}
Mensaje: {{message}}
Origen: {{source}}
Referrer: {{referrer}}
Fecha: {{submitted_at}}`,
    sample_variables: {
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      phone: '3001234567',
      program: 'Rutas de aprendizaje (Producto)',
      message: 'Quiero validar si entro directo al módulo 2.',
      source: 'agendar-diagnostico',
      referrer: 'https://www.techcentre.co/',
      submitted_at: new Date().toISOString(),
    },
  },
];

export function getDefaultTemplate(slug: string): EmailTemplateDefinition | undefined {
  return DEFAULT_EMAIL_TEMPLATES.find((t) => t.slug === slug);
}

export function sampleVariablesToJson(vars: Record<string, string>): Json {
  return vars as Json;
}
