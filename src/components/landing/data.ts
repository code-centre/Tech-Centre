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

export type RouteTone = "mint" | "cyan";

export interface ModuleContent {
  n: number;
  title: string;
  topics: string;
  entry?: boolean;
}

export interface RouteData {
  slug: "construye" | "revela";
  label: string;
  name: string;
  tagline: string;
  subtitle: string;
  forWhom: string;
  build: string;
  stack: string[];
  profile: string;
  tone: RouteTone;
  modules: ModuleContent[];
}

export const ROUTES: Record<"construye" | "revela", RouteData> = {
  construye: {
    slug: "construye",
    label: "Ruta Web",
    name: "Construye",
    tagline: "Construye lo que se ve.",
    subtitle:
      "Aprende a construir apps y agentes de IA que la gente usa, de cero a desplegar.",
    forWhom:
      "Quieres construir productos con IA user-facing. Vienes del mundo web, o quieres entrar por esa puerta.",
    build:
      "Aplicaciones web modernas con agentes de IA embebidos: interfaces que conversan, asisten y deciden, desplegadas y reales.",
    stack: [
      "TypeScript",
      "React",
      "Next.js",
      "Vercel AI SDK",
      "SQL",
      "Docker",
      "agentes",
      "RAG",
      "evals",
    ],
    profile: "AI Product / Full-Stack Engineer",
    tone: "mint",
    modules: [
      {
        n: 1,
        title: "Fundamentos",
        topics:
          "Pensamiento computacional, terminal, Git, JavaScript e IA como copiloto desde el día 1.",
      },
      {
        n: 2,
        title: "Desarrollo web",
        topics:
          "HTML/CSS, JavaScript a TypeScript, React, Next.js, SQL y bases de datos, APIs, autenticación, Docker, despliegue y CI.",
      },
      {
        n: 3,
        title: "IA aplicada",
        topics:
          "Harness y context engineering, LLMs en la app y streaming UX, structured outputs, function calling, agentes con guardrails, RAG embebido, model routing, evals y observabilidad, prompt injection.",
        entry: true,
      },
      {
        n: 4,
        title: "Servidores y despliegue seguro",
        topics:
          "Deploy del agente, servicios vs nube vs servidor propio, modelos por API vs locales (Ollama, vLLM), contenedores y CI/CD, seguridad, monitoreo y costos.",
      },
    ],
  },
  revela: {
    slug: "revela",
    label: "Ruta de Datos",
    name: "Revela",
    tagline: "Revela el patrón.",
    subtitle:
      "Aprende a construir sistemas que razonan sobre datos, de cero a desplegar.",
    forWhom:
      "Te atrae entender los datos y construir sistemas que razonan sobre información.",
    build:
      "Agentes que razonan sobre datos y bases de conocimiento: pipelines, RAG y sistemas que convierten información en respuestas confiables.",
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "pandas",
      "RAG",
      "pgvector",
      "Pydantic AI",
      "LangGraph",
      "MLflow",
    ],
    profile: "AI Application Engineer · datos",
    tone: "cyan",
    modules: [
      {
        n: 1,
        title: "Fundamentos",
        topics:
          "Pensamiento computacional, terminal, Git, Python e IA como copiloto desde el día 1.",
      },
      {
        n: 2,
        title: "Ingeniería de datos",
        topics:
          "Python, SQL y PostgreSQL, Docker temprano, FastAPI y Pydantic, pipelines (Airflow, dbt, DuckDB/BigQuery), estadística, EDA y Streamlit.",
      },
      {
        n: 3,
        title: "IA aplicada",
        topics:
          "Harness y context engineering, LLMs y RAG primero (chunking, embeddings, hybrid search, reranking), pgvector y Qdrant, agentes con Pydantic AI/LangGraph/MCP, retrieval evals, evals con LLM-as-judge, observabilidad y costo, ML clásico después.",
        entry: true,
      },
      {
        n: 4,
        title: "Servidores y despliegue seguro",
        topics:
          "Deploy del agente, servicios vs nube vs servidor propio, modelos por API vs locales (Ollama, vLLM), contenedores y CI/CD, seguridad, monitoreo y costos.",
      },
    ],
  },
};

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
    a: "No. El Módulo 1 (Fundamentos) empieza desde cero: pensamiento computacional, terminal, Git y programación desde lo más básico. Solo necesitas computador, internet y disposición real de aprender.",
  },
  {
    category: "Requisitos",
    q: "¿Ya tengo experiencia, puedo saltarme lo básico?",
    a: "Sí. Si ya programas en web o datos, puedes unirte directamente en el Módulo 3 (IA aplicada), tras una breve validación de nivel.",
  },
  {
    category: "Horarios y modalidad",
    q: "¿Cuánto dura y cuántas horas a la semana?",
    a: "Cada ruta dura 6 meses, de cero al perfil. Son 18 horas a la semana: 6 horas presenciales en la Casa Tech (Barranquilla) más 12 horas virtuales de práctica y proyecto guiado. Cada ruta se cursa por separado.",
  },
  {
    category: "Horarios y modalidad",
    q: "¿Qué ruta debo elegir, Construye o Revela?",
    a: "Si quieres construir productos con IA que la gente usa todos los días (apps, interfaces), elige Construye (Ruta Web). Si te atrae entender los datos y construir sistemas que razonan sobre información, elige Revela (Ruta de Datos).",
  },
  {
    category: "Inversión y pagos",
    q: "¿Cuáles son las formas de pago?",
    a: "Puedes tomar la ruta completa o una etapa individual. Ofrecemos matrícula más cuotas mensuales, y contamos con becas y convenios. Escríbenos por WhatsApp y te orientamos según tu caso.",
  },
  {
    category: "Empleabilidad",
    q: "¿Hay acompañamiento después de certificarme?",
    a: "Sí. Un mes después de certificarte entras a nuestro programa de empleabilidad: portafolio, skills de industria, cómo venderte y networking con empresas en convenio. No te dejamos en la puerta del certificado.",
  },
  {
    category: "Cupos e inscripción",
    q: "¿Qué voy a tener al terminar?",
    a: "Un portafolio de productos reales desplegados, certificado de Tech Centre, acceso a la comunidad de egresados y el perfil que la industria busca: Ingeniero de Aplicaciones de IA.",
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
