-- Email templates + send log for transactional emails (Resend)

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  sample_variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_slug text NOT NULL,
  recipient_email text NOT NULL,
  enrollment_id bigint REFERENCES public.enrollments(id) ON DELETE SET NULL,
  cohort_id bigint REFERENCES public.cohorts(id) ON DELETE SET NULL,
  dedupe_key text NOT NULL UNIQUE,
  resend_id text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_send_log_template_slug_idx ON public.email_send_log (template_slug);
CREATE INDEX IF NOT EXISTS email_send_log_sent_at_idx ON public.email_send_log (sent_at DESC);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage email templates" ON public.email_templates;
CREATE POLICY "Admins manage email templates"
  ON public.email_templates FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins read email send log" ON public.email_send_log;
CREATE POLICY "Admins read email send log"
  ON public.email_send_log FOR SELECT
  USING (public.is_admin());

-- Seeds (idempotent)
INSERT INTO public.email_templates (slug, name, description, subject, html_body, text_body, sample_variables)
VALUES
  (
    'enrollment_confirmed',
    'Inscripción confirmada',
    'Se envía al estudiante cuando su matrícula queda confirmada (status enrolled).',
    '¡Bienvenido/a a {{program_name}}! — Tech Centre',
    '<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b">¡Tu inscripción está confirmada!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Hola <strong>{{student_name}}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Tu matrícula en <strong>{{program_name}}</strong> (cohorte {{cohort_name}}) quedó confirmada. Las clases inician el <strong>{{start_date}}</strong>.</p>
<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#71717a"><strong>Sede:</strong> {{campus}} · <strong>Modalidad:</strong> {{modality}}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#71717a">Desde tu perfil puedes ver el detalle del curso, pagos y materiales cuando estén disponibles.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background-color:#0F5C4C"><a href="{{profile_url}}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">Ir a mi perfil</a></td></tr></table>',
    'Hola {{student_name}},

Tu inscripción en {{program_name}} (cohorte {{cohort_name}}) está confirmada.
Inicio de clases: {{start_date}}
Sede: {{campus}} · Modalidad: {{modality}}

Perfil: {{profile_url}}',
    '{"student_name":"María García","student_email":"maria@ejemplo.com","program_name":"Ingeniería de Producto","cohort_name":"Cohorte Sep 2026","start_date":"5 de septiembre de 2026","campus":"Casa Tech · El Prado","modality":"Presencial","profile_url":"https://www.techcentre.co/perfil","site_url":"https://www.techcentre.co"}'::jsonb
  ),
  (
    'cohort_starts_7d',
    'Inicio de clases en 7 días',
    'Recordatorio una semana antes del inicio de la cohorte.',
    'Faltan 7 días para iniciar {{program_name}} — Tech Centre',
    '<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b">Tu cohorte arranca pronto</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Hola <strong>{{student_name}}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Faltan <strong>{{days_until_start}} días</strong> para el inicio de <strong>{{program_name}}</strong> ({{cohort_name}}).</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Fecha de inicio: <strong>{{start_date}}</strong><br>Sede: {{campus}} · Modalidad: {{modality}}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#71717a">Te recomendamos revisar tu perfil y preparar tu equipo para la primera sesión.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background-color:#0F5C4C"><a href="{{profile_url}}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">Ver mi curso</a></td></tr></table>',
    'Hola {{student_name}},

Faltan {{days_until_start}} días para iniciar {{program_name}} ({{cohort_name}}).
Inicio: {{start_date}}
Sede: {{campus}} · Modalidad: {{modality}}

Perfil: {{profile_url}}',
    '{"student_name":"María García","student_email":"maria@ejemplo.com","program_name":"Ingeniería de Producto","cohort_name":"Cohorte Sep 2026","start_date":"5 de septiembre de 2026","days_until_start":"7","campus":"Casa Tech · El Prado","modality":"Presencial","profile_url":"https://www.techcentre.co/perfil","site_url":"https://www.techcentre.co"}'::jsonb
  ),
  (
    'cohort_starts_1d',
    'Inicio de clases mañana',
    'Recordatorio un día antes del inicio de la cohorte.',
    'Mañana empiezan tus clases — {{program_name}}',
    '<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b">¡Mañana es el gran día!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Hola <strong>{{student_name}}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Mañana <strong>{{start_date}}</strong> iniciamos <strong>{{program_name}}</strong> ({{cohort_name}}).</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#71717a">Te esperamos en <strong>{{campus}}</strong> ({{modality}}).</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#71717a">Si tienes dudas de último momento, escríbenos por WhatsApp o revisa la información en tu perfil.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background-color:#0F5C4C"><a href="{{profile_url}}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">Ir a mi perfil</a></td></tr></table>',
    'Hola {{student_name}},

Mañana {{start_date}} inician tus clases de {{program_name}} ({{cohort_name}}).
Sede: {{campus}} · Modalidad: {{modality}}

Perfil: {{profile_url}}',
    '{"student_name":"María García","student_email":"maria@ejemplo.com","program_name":"Ingeniería de Producto","cohort_name":"Cohorte Sep 2026","start_date":"5 de septiembre de 2026","days_until_start":"1","campus":"Casa Tech · El Prado","modality":"Presencial","profile_url":"https://www.techcentre.co/perfil","site_url":"https://www.techcentre.co"}'::jsonb
  ),
  (
    'diagnostico_admin',
    'Notificación diagnóstico (admin)',
    'Notifica al equipo cuando alguien solicita agendar un diagnóstico.',
    '[Tech Centre] Diagnóstico — {{name}} ({{program}})',
    '<h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#18181b">Nueva solicitud de diagnóstico</h1>
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
</table>',
    'Nueva solicitud de diagnóstico — Tech Centre

Nombre: {{name}}
Correo: {{email}}
Teléfono: {{phone}}
Programa: {{program}}
Mensaje: {{message}}
Origen: {{source}}
Referrer: {{referrer}}
Fecha: {{submitted_at}}',
    '{"name":"Juan Pérez","email":"juan@ejemplo.com","phone":"3001234567","program":"Rutas de aprendizaje (Producto)","message":"Quiero validar si entro directo al módulo 2.","source":"agendar-diagnostico","referrer":"https://www.techcentre.co/","submitted_at":"2026-03-28T00:00:00.000Z"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
