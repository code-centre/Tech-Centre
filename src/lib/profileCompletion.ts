/**
 * Qué le falta a un perfil, y para qué sirve cada cosa.
 *
 * Antes esto era un porcentaje al lado de tres beneficios genéricos, que no
 * decía qué hacer ni por qué. Aquí cada pendiente nombra el dato que falta y la
 * consecuencia concreta de no tenerlo — que es lo único que hace que alguien lo
 * complete.
 */

export interface ProfileFields {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  id_number?: string | null;
  address?: string | null;
  profile_image?: string | null;
  professional_title?: string | null;
}

export interface CompletionItem {
  id: 'contacto' | 'emergencia' | 'facturacion' | 'profesional';
  label: string;
  why: string;
  done: boolean;
  /** Ancla de la tarjeta donde se completa. */
  anchor: string;
}

function filled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim() !== '');
}

export function completionItems(profile: ProfileFields): CompletionItem[] {
  return [
    {
      id: 'contacto',
      label: 'Nombre, apellidos y WhatsApp',
      why: 'Es por donde te escribimos si se mueve una clase.',
      done: filled(profile.first_name) && filled(profile.last_name) && filled(profile.phone),
      anchor: 'datos-basicos',
    },
    {
      id: 'emergencia',
      label: 'Contacto de emergencia',
      why: 'Para las clases presenciales.',
      done: filled(profile.emergency_contact_name) && filled(profile.emergency_contact_phone),
      anchor: 'emergencia',
    },
    {
      id: 'facturacion',
      label: 'Documento y dirección',
      why: 'Sin esto tu factura no puede salir a tu nombre.',
      done: filled(profile.id_number) && filled(profile.address),
      anchor: 'facturacion',
    },
    {
      id: 'profesional',
      label: 'Foto y título profesional',
      why: 'Es lo que ven tus compañeros y los instructores.',
      done: filled(profile.profile_image) && filled(profile.professional_title),
      anchor: 'profesional',
    },
  ];
}

export interface CompletionSummary {
  items: CompletionItem[];
  done: number;
  total: number;
  missing: number;
  /** Encabezado honesto: «Te faltan dos cosas», «Ya está todo». */
  headline: string;
}

const SPELLED = ['cero', 'una', 'dos', 'tres', 'cuatro'];

export function completionSummary(profile: ProfileFields): CompletionSummary {
  const items = completionItems(profile);
  const done = items.filter((item) => item.done).length;
  const missing = items.length - done;

  return {
    items,
    done,
    total: items.length,
    missing,
    headline:
      missing === 0
        ? 'Tu perfil está completo'
        : missing === 1
          ? 'Te falta una cosa'
          : `Te faltan ${SPELLED[missing] ?? missing} cosas`,
  };
}
