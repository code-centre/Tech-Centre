/**
 * Copy y datos del Programa avanzado de ingeniería de agentes.
 * Regla de copy: nunca usar el guion largo. Usar comas, dos puntos o "·".
 */

import { whatsappWith } from "../data";

export const AGENTES_PATH = "/programas/ingenieria-de-agentes";
export const AGENTES_DEMO_PATH = `${AGENTES_PATH}/clase-demo`;

export const AGENTES_DIAGNOSTICO_WA = whatsappWith(
  "Hola, quiero agendar la sesión de diagnóstico del programa de ingeniería de agentes.",
);

export const AGENTES_DEMO_WA = whatsappWith(
  "Hola, quiero inscribirme a la clase demo gratuita de ingeniería de agentes.",
);

/** Página interna para capturar datos y notificar al equipo antes del calendario. */
export const AGENTES_DIAGNOSTICO_URL = "/agendar-diagnostico?programa=agentes";

export const AGENTES_LEGAL =
  "Programa de educación informal, con una intensidad de 64 horas. No conduce a título alguno ni a certificado de aptitud ocupacional. Al finalizar se expide constancia de asistencia y aprobación. Decreto 1075 de 2015, artículo 2.6.6.8.";

export const AGENTES_COHORT = {
  startLabel: "5 de septiembre",
  startIso: "2026-09-05",
  earlyUntilLabel: "Hasta el 22 de agosto",
} as const;

export const AGENTES_META = {
  title: "Programa avanzado de ingeniería de agentes de IA · Barranquilla · Tech Centre",
  description:
    "Ocho semanas presenciales para developers que ya programan en Python. Inicia el 5 de septiembre en Barranquilla. Agentes, MCP, RAG, evaluación y despliegue. Cohorte pequeña.",
  ogImage: "/community/manos-teclado.webp",
} as const;

export const AGENTES_HERO = {
  badge: "PROGRAMA AVANZADO · REQUIERE SABER PROGRAMAR",
  title: "Ya usas IA todos los días. Todavía no has construido nada con ella.",
  subtitle:
    "Programa avanzado de ingeniería de agentes de IA. Inicia el 5 de septiembre. Ocho semanas, presencial en Barranquilla, cohorte pequeña. Sales con un sistema tuyo desplegado, medible y listo para mostrar.",
  primaryCta: "Agendar sesión de diagnóstico",
  primaryNote: "20 min · sin examen · sin pago",
  secondaryCta: "Ver las 8 semanas",
  image: "/community/manos-teclado.webp",
  imageAlt: "Manos sobre un teclado en la sede de Tech Centre",
} as const;

export const AGENTES_STAT_BAR = [
  "INICIA 5 SEP",
  "8 SEMANAS",
  "SÁBADOS 9:00 A 1:00",
  "COHORTE PEQUEÑA · EL PRADO",
] as const;

export const AGENTES_UNCOMFORTABLE = {
  title: "El problema no es la IA. Es usarla como autocompletado.",
  closing:
    "Nada de esto significa que la IA no sirva. Significa que hay una diferencia entre pedirle código y diseñar un sistema. Este programa es sobre lo segundo.",
  stats: [
    {
      value: "66%",
      numeric: 66,
      suffix: "%",
      label: "de developers gasta más tiempo arreglando código generado por IA del que ahorra",
      source: "Google, DORA Report 2024 · Productividad y uso de IA en desarrollo",
      sourceUrl: "https://dora.dev/",
    },
    {
      value: "40% → 29%",
      numeric: null as number | null,
      suffix: "",
      label: "cayó la confianza en la precisión de la IA en un año",
      source: "Stack Overflow Developer Survey 2024 · Confianza en precisión de herramientas de IA",
      sourceUrl: "https://survey.stackoverflow.co/2024/",
    },
    {
      value: "19%",
      numeric: 19,
      suffix: "%",
      label:
        "más lentos fueron developers experimentados en un estudio controlado, mientras predecían ser 24% más rápidos",
      source: "METR, 2025 · Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity",
      sourceUrl: "https://metr.org/",
    },
  ],
} as const;

export const AGENTES_FIT = {
  yesTitle: "Es para ti si",
  noTitle: "Todavía no es para ti si",
  yes: [
    "Escribes funciones y clases en Python sin buscar la sintaxis",
    "Ya consumiste una API HTTP desde código",
    "Usas git y te mueves en la terminal sin miedo",
    "Usas ChatGPT o Copilot a diario y quieres pasar al otro lado",
  ],
  no: [
    "Estás empezando a programar",
    "Buscas un certificado más que una capacidad",
    "No puedes asistir presencialmente los sábados",
  ],
  noClosing:
    "Si estás empezando, te lo decimos de frente: entrar aquí sin base no te sirve a ti ni al grupo. Cuando abramos rutas desde cero, te avisamos.",
  careersLabel: "Escríbenos y te avisamos",
  careersHref: "https://wa.me/573005523872?text=Hola%2C%20quiero%20que%20me%20avisen%20cuando%20abran%20rutas%20desde%20cero",
  pythonNote:
    "El piso es Python cómodo. Si vienes fuerte en JavaScript o TypeScript y Python lo usas para scripts, lo revisamos en el diagnóstico: a veces alcanza, a veces no.",
} as const;

export const AGENTES_INSTRUCTOR = {
  name: "Anuar Harb",
  role: "Fundador de Tech Centre · +10 años como developer y docente",
  href: "https://anuarharb.com",
  body: "Vas a hablar con alguien que construye y enseña, no con un closer. En el diagnóstico revisamos tu nivel, el ritmo real del grupo y si este es tu momento. Si no lo es, te lo decimos.",
  diagnosticSees: [
    "Tu piso en Python, APIs, git y terminal",
    "Si el caso que traes cabe en ocho semanas",
    "Si el horario de sábados es realista para ti",
  ],
} as const;

export const AGENTES_BUILD = {
  title: "No sales con apuntes. Sales con un sistema.",
  intro:
    "Un solo proyecto elegido en la semana 1 que crece cada semana, con tu propio caso: los documentos de tu empresa, un proceso que quieres automatizar, algo real. El repo es tuyo.",
  deliverables: [
    {
      title: "Sistema desplegado",
      body: "Docker, evaluación automatizada y trazas. Listo para mostrar y seguir iterando.",
    },
    {
      title: "Servidor MCP propio",
      body: "Hoy la habilidad de integración más pedida.",
    },
    {
      title: "Repo tuyo",
      body: "Código que puedes mostrar en una entrevista o llevar a tu trabajo.",
    },
    {
      title: "Criterio de diseño",
      body: "Cuándo un agente y cuándo bastaba una función.",
    },
  ],
  starterProjects: [
    {
      title: "Asistente documental interno",
      body: "Ingesta documentos (puedes anonimizar datos sensibles), responde con citas y deja rastro de cada decisión.",
    },
    {
      title: "Agente de operaciones",
      body: "Lee un ticket, consulta sistemas vía MCP y propone o ejecuta la acción con aprobación humana.",
    },
    {
      title: "Pipeline de evaluación",
      body: "Suite de tests, trazas con Langfuse y umbrales que frenan un despliegue malo.",
    },
  ],
} as const;

export interface WeekContent {
  n: number;
  title: string;
  subtitle?: string;
  objective: string;
  home: string;
  live: string;
  stack: string;
}

export const AGENTES_WEEKS: WeekContent[] = [
  {
    n: 1,
    title: "El nuevo paradigma y cómo trabajar con agentes de código",
    objective: "Entender el cambio de pedirle código a diseñar sistemas, y armar tu entorno de trabajo con un agente de código.",
    home: "Videos cortos sobre el paradigma agentico y setup del repo de inicio.",
    live: "Eliges tu caso, clonas el scaffold y haces la primera entrega con pair programming.",
    stack: "Python · Git · Docker · agente de código",
  },
  {
    n: 2,
    title: "Ingeniería alrededor del modelo",
    objective: "Tratar al modelo como un componente con contrato, validación y límites claros.",
    home: "Structured outputs, Pydantic y primeros flujos con FastAPI.",
    live: "Diseñas el contrato de tu sistema y lo conectas a un endpoint real.",
    stack: "Pydantic · Pydantic AI · FastAPI",
  },
  {
    n: 3,
    title: "Herramientas y MCP",
    objective: "Dar al agente herramientas reales y exponer capacidades propias vía MCP.",
    home: "Tool calling y fundamentos de servidores MCP con fastmcp.",
    live: "Construyes tu primer servidor MCP y lo conectas al agente.",
    stack: "MCP · fastmcp · tool calling",
  },
  {
    n: 4,
    title: "Agentes, estado y memoria",
    subtitle: "y cuándo NO usar un agente",
    objective: "Modelar estado, memoria y rutas de control. Aprender a decidir cuándo un agente no es la respuesta.",
    home: "Grafos, checkpoints y patrones de memoria de corto y largo plazo.",
    live: "Refactorizas tu sistema: estado explícito, memoria útil y un camino sin agente cuando no hace falta.",
    stack: "LangGraph · estado · memoria",
  },
  {
    n: 5,
    title: "Context engineering: ingesta y recuperación",
    objective: "Meter tus datos al sistema con un pipeline de ingesta y recuperación que se pueda medir.",
    home: "Chunking, embeddings y primer índice con pgvector.",
    live: "Conectas tus documentos reales y ves qué recupera el sistema.",
    stack: "PostgreSQL · pgvector · embeddings",
  },
  {
    n: 6,
    title: "Context engineering: precisión, orden y confianza",
    objective: "Mejorar relevancia, citas y confianza del contexto que llega al modelo.",
    home: "Hybrid search, reranking y citación de fuentes.",
    live: "Ajustas el retrieval hasta que las respuestas sean defendibles.",
    stack: "hybrid search · rerank · citas",
  },
  {
    n: 7,
    title: "Evaluación en el pipeline y observabilidad",
    objective: "Meter evaluación y trazas en el flujo de trabajo, no como un apéndice.",
    home: "Evals automatizados y primeros dashboards de trazas.",
    live: "Dejas el pipeline con umbrales y trazabilidad de extremo a extremo.",
    stack: "Langfuse · evals · CI",
  },
  {
    n: 8,
    title: "Privacidad, modelos locales y despliegue",
    objective: "Cerrar el sistema: privacidad, opción local y despliegue reproducible.",
    home: "Ollama, secretos, Docker final y checklist de release.",
    live: "Despliegas, ensayas la demo y dejas el repo listo para Demo Day.",
    stack: "Ollama · Docker · GitHub Actions",
  },
];

export const AGENTES_DEMO_DAY = "SÁBADO 9 · DEMO DAY";

export const AGENTES_HYBRID = {
  title: "Diseñado para alguien que trabaja de lunes a viernes",
  saturday: {
    title: "Sábados en la sede · 4 horas",
    body: "Construir en vivo, pair programming, debugging real, code review cara a cara. Nada de teoría nueva: eso ya lo viste en casa.",
  },
  home: {
    title: "En casa · 3 a 4 horas",
    body: "Videos de 6 a 10 minutos, un concepto cada uno. Repo de inicio, tests que corres solo para saber si vas bien, y una entrega pequeña.",
  },
  honesty:
    "Son cerca de siete horas semanales durante ocho semanas. Es real y no lo endulzamos. Si faltas un sábado tienes el resumen escrito, el repo en su estado final y una hora de consulta a mitad de semana.",
  timeline: [
    { time: "9:00", label: "Warm-up y meta del día" },
    { time: "9:20", label: "Build en pareja" },
    { time: "10:40", label: "Code review" },
    { time: "11:20", label: "Debugging guiado" },
    { time: "12:20", label: "Cierre y siguiente entrega" },
  ],
} as const;

export const AGENTES_STACK = [
  "Python",
  "FastAPI",
  "Pydantic",
  "Pydantic AI",
  "LangGraph",
  "MCP",
  "fastmcp",
  "PostgreSQL",
  "pgvector",
  "Langfuse",
  "Docker",
  "GitHub Actions",
  "Ollama",
] as const;

export const AGENTES_STACK_CLOSING =
  "Las herramientas cambian. El criterio para elegirlas, no. Por eso el programa enseña las dos cosas.";

export const AGENTES_NEEDS = {
  needTitle: "Lo que necesitas",
  need: [
    "Un portátil con 8 GB de RAM que corra Docker",
    "Nada más. No necesitas GPU en ninguna sesión",
  ],
  includedTitle: "Incluido en el precio",
  included: [
    "Créditos de API, con clave propia entregada por Tech Centre",
    "Repos de trabajo y biblioteca de video con acceso por 12 meses",
    "Demo day y entrada a la comunidad",
  ],
  note: "Incluimos los créditos de API porque conseguir una tarjeta habilitada para cobros internacionales no debería ser el obstáculo para aprender esto.",
} as const;

export const AGENTES_PRICING = {
  list: { label: "Precio de lista", amount: "$1.800.000" },
  early: {
    label: "Pronto pago",
    detail: AGENTES_COHORT.earlyUntilLabel,
    amount: "$1.450.000",
  },
  alumni: {
    label: "Egresados de Construye o Revela",
    amount: "$1.260.000",
  },
  reserve: { label: "Reserva de cupo", amount: "$150.000" },
  installments: "Hasta dos cuotas sin interés.",
  includes: [
    "Créditos de API con clave propia",
    "64 horas de formación + repos y biblioteca 12 meses",
    "Demo day y entrada a la comunidad",
  ],
  note: "Primero agenda el diagnóstico. Si no es tu momento, no hay cobro. El pago viene después, solo si el nivel y el ritmo encajan.",
} as const;

export const AGENTES_PATHS = {
  title: "Dos puertas. Elige según dónde estás.",
  diagnostic: {
    label: "Diagnóstico",
    detail: "20 minutos. Para decidir si entras a la cohorte del 5 de septiembre.",
  },
  demo: {
    label: "Clase demo",
    detail: "90 minutos el 15 de agosto. Para probar el ritmo sin compromiso, si aún no estás seguro.",
  },
} as const;

export const AGENTES_DEMO_BAND = {
  title: "¿Aún no estás seguro? Ven a la clase demo",
  body: "Noventa minutos gratis en la sede el 15 de agosto. Sales con un agente funcionando en tu computador. Sin pitch de ventas. Si después quieres entrar a la cohorte, agendas el diagnóstico.",
  cta: "Reservar clase demo",
} as const;

/** Fecha editable de la próxima clase demo. Actualizar al publicar. */
export const AGENTES_DEMO_EVENT = {
  title: "Clase demo · Ingeniería de agentes",
  dateLabel: "Sábado 15 de agosto · 10:00 a.m.",
  dateShort: "15 ago · 10:00 a.m.",
  timeLabel: "90 minutos",
  place: "Casa Tech · El Prado, Barranquilla",
  summary:
    "Construyes un agente pequeño en tu computador, con herramientas reales. Sales con algo funcionando y con criterio para decidir si el programa es tu siguiente paso.",
} as const;

export const AGENTES_FAQS = [
  {
    q: "¿Cuánto tiempo real necesito?",
    a: "Ocho sábados de 9 a 1 más unas tres horas en casa por semana. Está pensado para alguien con trabajo de tiempo completo.",
    category: "Tiempo",
  },
  {
    q: "¿Qué pasa si falto un sábado o dos?",
    a: "Si faltas un sábado tienes el resumen escrito, el repo en su estado final y una hora de consulta a mitad de semana. Si faltas dos o más, el ritmo del grupo te deja atrás: mejor lo hablamos en el diagnóstico antes de entrar.",
    category: "Tiempo",
  },
  {
    q: "¿Hay grabación de las sesiones?",
    a: "La sesión presencial no se reemplaza con video. Lo que sí queda es el resumen escrito, el repo actualizado y la biblioteca de videos cortos de la parte en casa.",
    category: "Formato",
  },
  {
    q: "Hay cursos de esto en Udemy por 30 dólares. ¿Por qué esto?",
    a: "Y sirven para saber que el tema existe. El problema es que casi todos son video pasivo sobre frameworks que uno nunca toca. Aquí construyes tu propio sistema, con tus datos, y alguien te revisa el código a la cara.",
    category: "Formato",
  },
  {
    q: "¿Estoy en nivel? Vengo más de JavaScript que de Python.",
    a: "El piso es Python cómodo, APIs, git y terminal. Si vienes fuerte en JS o TypeScript y Python lo usas para scripts, lo vemos en veinte minutos. A veces alcanza. Si no, te lo decimos sin cobrarte.",
    category: "Nivel",
  },
  {
    q: "Ya uso ChatGPT y Copilot todos los días. ¿Me sirve?",
    a: "Eso es usar IA. Aquí aprendes a construir sistemas que otros usan y a responder por ellos cuando fallan.",
    category: "Nivel",
  },
  {
    q: "¿Puedo traer datos de mi empresa?",
    a: "Sí, y es lo ideal. Si hay datos sensibles, trabajamos con una muestra anonimizada o documentos que puedas compartir. El repo del proyecto es tuyo.",
    category: "Proyecto",
  },
  {
    q: "¿El código del proyecto es mío?",
    a: "Sí. Sales con tu repositorio. Nosotros aportamos scaffolds, reviews y la biblioteca del programa; tu caso y tu código te pertenecen.",
    category: "Proyecto",
  },
  {
    q: "¿Qué nivel tiene el grupo?",
    a: "Cohorte pequeña de gente que ya programa. El diagnóstico existe justo para no mezclar niveles que no se ayudan entre sí.",
    category: "Grupo",
  },
  {
    q: "¿Qué diferencia hay entre la clase demo y el diagnóstico?",
    a: "La demo del 15 de agosto es para construir algo en 90 minutos y sentir el ritmo, sin compromiso. El diagnóstico es la conversación de 20 minutos para decidir si entras a la cohorte del 5 de septiembre.",
    category: "Proceso",
  },
  {
    q: "¿Y si en tres meses todo esto cambió?",
    a: "Las herramientas cambian, los criterios no. Cómo diseñar contexto, cómo evaluar, cómo decidir entre arquitecturas. Además tienes acceso a la biblioteca actualizada por doce meses.",
    category: "Contenido",
  },
  {
    q: "¿Necesito GPU?",
    a: "No. Ni una sola sesión la necesita.",
    category: "Requisitos",
  },
] as const;

export const AGENTES_CLOSING = {
  title: "Veinte minutos, sin examen y sin compromiso",
  body: "Conversamos sobre tu nivel, te mostramos el ritmo real del grupo y decidimos juntos si este es tu momento.",
  cta: "Agendar sesión de diagnóstico",
  whatsappNote: "También puedes escribirnos por WhatsApp.",
} as const;

export const AGENTES_COURSE_SCHEMA = {
  name: "Programa avanzado de ingeniería de agentes de IA",
  description: AGENTES_META.description,
  provider: { name: "Tech Centre", url: "https://techcentre.co" },
  image: `https://techcentre.co${AGENTES_META.ogImage}`,
  courseCode: "IA-AGENTES-ADV",
  educationalCredentialAwarded: "Constancia de asistencia y aprobación",
  teaches: [
    "ingeniería de agentes de IA",
    "MCP",
    "RAG",
    "LangGraph",
    "evaluación de agentes",
    "despliegue con Docker",
  ],
  timeRequired: "P8W",
  coursePrerequisites: "Programación en Python, APIs HTTP, git y terminal",
  url: `https://techcentre.co${AGENTES_PATH}`,
  price: 1800000,
  currency: "COP",
  startDate: AGENTES_COHORT.startIso,
} as const;
