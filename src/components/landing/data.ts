/**
 * Contenido centralizado del sitio Tech Centre v2.
 * Una sola fuente de verdad para copy, contacto, ecosistema y temarios.
 * Regla de copy: nunca usar el guion largo. Usar comas, dos puntos o "·".
 */

export const CONTACT = {
  whatsapp: "573005523872",
  whatsappUrl:
    "https://wa.me/573005523872?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20programas%20de%20Tech%20Centre",
  email: "admisiones@techcentre.co",
  phone: "+57 300 552 3872",
  address: "Casa Tech · Cra. 50 #72-126, El Prado, Barranquilla",
  addressShort: "Cra. 50 #72-126, El Prado, Barranquilla",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=ChIJv01Wyvot9I4RUtzmOXikbpM",
  embedMapUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3916.538907882707!2d-74.8045491!3d10.9981343!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d0ad033385b%3A0x326de6a0f5244065!2sCra.%2050%20%2372-126%2C%20Nte.%20Centro%20Historico%2C%20Barranquilla%2C%20Atl%C3%A1ntico!5e0!3m2!1ses-419!2sco!4v1736454294702!5m2!1ses-419!2sco",
  social: {
    instagram: "https://www.instagram.com/techcentre.co/",
    linkedin: "https://www.linkedin.com/company/tech-centrebaq/",
    facebook: "https://www.facebook.com/profile.php?id=100092748068869",
  },
} as const;

export function whatsappWith(message: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const ECOSYSTEM = [
  {
    name: "Fundación Código Abierto",
    href: "https://codigoabierto.tech",
    logo: "/logos/logo-fca.webp",
    role: "Comunidad",
  },
  {
    name: "Costa Digital",
    href: "https://costadigital.org",
    logo: "/logos/Logo-costa-digital.png",
    role: "Innovación",
  },
  {
    name: "Ciudad Inmersiva",
    href: "https://ciudadinmersiva.com",
    logo: "/logos/logo-c-i.png",
    role: "Innovación",
  },
  {
    name: "Caribe Ventures",
    href: "https://caribe.ventures",
    logo: "/logos/LogoCaribeVentures.webp",
    role: "Capital",
  },
] as const;

export const SHARED_MODULES = [
  { n: 1, title: "Fundamentos", detail: "Construye: JavaScript · Revela: Python" },
  { n: 2, title: "Especialidad", detail: "Construye: Desarrollo web · Revela: Ingeniería de datos" },
  { n: 3, title: "IA aplicada", detail: "Agentes, RAG y evals", entry: true },
  { n: 4, title: "Servidores y despliegue seguro", detail: "Deploy, modelos locales, nube vs. propio" },
] as const;

export const INTENSITY = {
  months: 6,
  presencial: 6,
  virtual: 12,
  total: 18,
};

export interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export const FAQS: FaqItem[] = [
  {
    category: "Requisitos",
    q: "¿Necesito saber programar para entrar?",
    a: "No. El módulo 1 empieza desde cero: lógica, terminal, Git y programación desde lo más básico. Solo necesitas computador, internet y ganas reales de aprender.",
  },
  {
    category: "Requisitos",
    q: "Ya programo, ¿puedo saltarme el módulo 1?",
    a: "Sí. El diagnóstico gratuito te ubica directo en el módulo 2 o en el módulo 3, sin pagar ni repetir lo que ya sabes.",
  },
  {
    category: "Horarios y modalidad",
    q: "¿Cuánto dura y cuántas horas a la semana?",
    a: "Cada módulo dura 8 semanas y te toma 8 horas a la semana: 4 presenciales en Casa Tech, los sábados o entre semana, y 4 de práctica guiada en casa. La ruta completa son tres módulos, unos seis meses en total.",
  },
  {
    category: "Horarios y modalidad",
    q: "¿Puedo tomar un solo módulo?",
    a: "Sí. Cada módulo es independiente y termina con un proyecto real que puedes mostrar. No tienes que comprometerte con la ruta completa desde el inicio: el diagnóstico te dice dónde empezar.",
  },
  {
    category: "Rutas",
    q: "¿Qué ruta debo elegir, Producto o Datos?",
    a: "Si quieres construir productos y agentes de IA que la gente usa (apps, interfaces), elige la ruta Producto: JavaScript, TypeScript y el stack agéntico moderno. Si te atrae entender los datos y predecir con machine learning, elige la ruta Datos: Python, SQL y el stack de datos moderno. Al terminar una ruta puedes cruzar a la otra.",
  },
  {
    category: "Inversión y pagos",
    q: "¿Cuánto cuesta y cómo puedo pagar?",
    a: "Los módulos 1 y 2 cuestan $1.400.000 COP y el módulo 3 avanzado $1.600.000 COP. Reservas tu cupo con $100.000 y pagas el resto en hasta tres cuotas sin interés. Si ya hiciste un módulo con nosotros, tienes 10% de descuento.",
  },
  {
    category: "Inversión y pagos",
    q: "¿Hay becas o convenios?",
    a: "Sí. Tenemos becas y convenios, como Becas Atlántico. Escríbenos y te contamos cuáles están abiertas para tu caso.",
  },
  {
    category: "Empleabilidad",
    q: "¿Hay acompañamiento al terminar?",
    a: "Sí. Te llevas el programa de empleabilidad, los demo days y una comunidad de egresados que se refiere, se contrata y se apoya. No prometemos empleo: lo que abre puertas es el portafolio de proyectos reales que construyes.",
  },
  {
    category: "Al terminar",
    q: "¿Qué me llevo al terminar?",
    a: "Un proyecto real desplegado y presentado en demo day, constancia de participación de Tech Centre, y acceso a la comunidad de egresados y al ecosistema Costa Digital.",
  },
];

export interface CommunityFormat {
  name: string;
  cadence: string;
  description: string;
}

export const COMMUNITY_FORMATS: CommunityFormat[] = [
  { name: "Tech Nights", cadence: "Mensual", description: "Charlas nocturnas de tecnología y comunidad." },
  { name: "Café Cursor", cadence: "Cursor Meetup", description: "Encuentro para construir con IA en vivo." },
  { name: "Build with AI", cadence: "Gira universitaria", description: "Talleres de IA por las universidades del Caribe." },
  { name: "Barranqui-IA", cadence: "Hackatón", description: "El hackatón de inteligencia artificial del Caribe." },
  { name: "TechCaribe Fest", cadence: "Anual", description: "El gran festival tecnológico del Caribe." },
  { name: "GDG Barranquilla", cadence: "Comunidad", description: "Google Developer Group de la ciudad." },
];

export interface MentorData {
  name: string;
  role: string;
  href?: string;
}

export const MENTORS: MentorData[] = [
  { name: "Anuar Harb", role: "Fundador · +10 años como dev y docente", href: "https://anuarharb.com" },
  { name: "Equipo docente", role: "Profesionales activos en la industria tech" },
  { name: "Mentores invitados", role: "Líderes del ecosistema Costa Digital" },
];

export const GALLERY_MOSAIC = [
  { src: "/community/sesion-fca.webp", alt: "Sesión presencial frente a la proyección", caption: "Sesión presencial", w: 1024, h: 768 },
  { src: "/community/manos-teclado.webp", alt: "Manos sobre el teclado escribiendo código", caption: "Manos que crean", w: 768, h: 1024 },
  { src: "/community/laboratorio-codigo.webp", alt: "Laboratorio de programación con proyección de código", caption: "Laboratorio", w: 1024, h: 768 },
  { src: "/community/equipo-selfie.webp", alt: "Estudiantes construyendo en equipo", caption: "Comunidad", w: 768, h: 1024 },
  { src: "/community/demo-herramientas.webp", alt: "Demostración en vivo de herramientas de IA", caption: "Demo day", w: 768, h: 1024 },
  { src: "/community/audiencia-clase.webp", alt: "Asistentes atentos durante una clase presencial", caption: "En clase", w: 768, h: 1024 },
  { src: "/community/practica-laptops.webp", alt: "Práctica en vivo programando sobre laptops", caption: "Práctica en vivo", w: 768, h: 1024 },
  { src: "/community/trabajo-datos.webp", alt: "Trabajando con datos reales en clase", caption: "Trabajo con datos", w: 768, h: 1024 },
];

export const GALLERY_MARQUEE = [
  { src: "/community/charla-noche.webp", alt: "Charla nocturna al aire libre", caption: "Charla nocturna", w: 768, h: 1024 },
  { src: "/community/evento-aire-libre.webp", alt: "Evento comunitario nocturno al aire libre", caption: "Evento", w: 768, h: 1024 },
  { src: "/community/sede-codigo-abierto.webp", alt: "Fachada de la sede en Barranquilla", caption: "Casa Tech", w: 768, h: 1024 },
  { src: "/community/sesion-presencial.webp", alt: "Comunidad reunida en una sesión presencial", caption: "Sesión presencial", w: 768, h: 1024 },
  { src: "/community/comunidad-dos.webp", alt: "Miembros de la comunidad Tech Centre en clase", caption: "Comunidad", w: 768, h: 1024 },
];
