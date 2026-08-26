/**
 * Copy y datos de las rutas de aprendizaje de Tech Centre.
 * Fuente: Rutas_Tech_Centre (Casa Tech · Barranquilla).
 * Regla de copy: nunca usar el guion largo. Usar comas, dos puntos o "·".
 */

/** Agenda de diagnóstico gratuito (Google Calendar Appointment Schedule). */
export const RUTAS_DIAGNOSTICO_URL =
  "https://calendar.app.google/WxyEJwqPhSsE9mpc9";

export const RUTAS_LEGAL =
  "Tech Centre · Centro de Tecnología del Caribe opera bajo Fundación Código Abierto y ofrece programas de educación informal conforme al Decreto 1075 de 2015, Artículo 2.6.6.8. Estos programas no conducen a título ni a certificado de aptitud ocupacional.";

export const RUTAS_HERO = {
  eyebrow: "Rutas de aprendizaje · Casa Tech · Barranquilla",
  title: "Dos rutas para entrar a la industria que define esta década",
  subtitle:
    "Tech Centre es el Centro de Tecnología del Caribe. Aquí no vienes solo a aprender, vienes a explorar: aprendes haciendo, con guía humana cercana, proyectos reales y una comunidad que avanza contigo.",
  manifesto:
    "La tecnología con IA es lo que viene para los próximos años, y la pregunta ya no es si te va a tocar, sino desde dónde la vas a vivir. Nosotros elegimos vivirla desde aquí: cambiar el chip, aprender en serio y convertir la costa Caribe en un epicentro tech de Latinoamérica.",
  primaryCta: "Agenda tu diagnóstico gratuito",
  primaryNote: "Gratis · te ubica en el módulo donde debes empezar",
  secondaryCta: "Ver las rutas",
} as const;

export type RutaTone = "mint" | "cyan";
export type RutaLevel = "Base" | "Ascenso" | "Cumbre";

export interface RutaModule {
  level: RutaLevel;
  levelLabel: string;
  title: string;
  stack: string;
  outcome: string;
  bullets: string[];
}

export interface Ruta {
  slug: "producto" | "datos";
  label: string;
  name: string;
  headline: string;
  description: string;
  stackPills: string[];
  tone: RutaTone;
  modules: RutaModule[];
}

export const RUTAS: Ruta[] = [
  {
    slug: "producto",
    label: "Ruta Producto",
    name: "Productos y agentes de IA",
    headline: "Aprende a construir productos y agentes de IA",
    description:
      "De cero a construir productos completos y agentes de IA. JavaScript, TypeScript y el stack agéntico moderno.",
    stackPills: ["JavaScript · TypeScript", "React · Node · PostgreSQL", "Claude API · MCP"],
    tone: "mint",
    modules: [
      {
        level: "Base",
        levelLabel: "Nivel inicial · Módulo 1",
        title: "Fundamentos de Programación",
        stack: "JavaScript · terminal · Git · HTTP · IA asistida",
        outcome: "Terminas con tu primera aplicación publicada en internet.",
        bullets: [
          "Programación desde cero: lógica, funciones, datos, resolución de problemas",
          "Las herramientas del oficio: terminal, Git y cómo funciona la web",
          "Desarrollo asistido por IA desde el día uno, con criterio sobre qué delegar y qué entender",
        ],
      },
      {
        level: "Ascenso",
        levelLabel: "Nivel intermedio · Módulo 2",
        title: "Ingeniería de Producto",
        stack: "TypeScript · React · Node · PostgreSQL · deploy",
        outcome:
          "Terminas con un producto completo desplegado, con usuarios de prueba reales.",
        bullets: [
          "Cómo se compone un producto completo: cliente, API, base de datos, arquitectura",
          "Entender al usuario y diseñar con criterio, no con plantillas",
          "Autenticación, seguridad de aplicación y datos bien modelados",
          "Despliegue, observability y costos como decisiones de diseño",
          "Tu proyecto puede ser tu propia idea de negocio: ideal si emprendes o lideras un equipo técnico",
        ],
      },
      {
        level: "Cumbre",
        levelLabel: "Nivel avanzado · Módulo 3",
        title: "Harness y Agentes de IA",
        stack: "Claude API · MCP · sandboxes · evals",
        outcome:
          "Terminas con un agente completo con harness propio, listo para producción.",
        bullets: [
          "Ingeniería de agentes: el loop agéntico, tools, permisos y context engineering",
          "Construcción de MCP servers y consumo seguro de herramientas",
          "Seguridad agéntica: prompt injection, sandboxing y aislamiento",
          "Evaluación automatizada y feedback loops de nivel producción",
        ],
      },
    ],
  },
  {
    slug: "datos",
    label: "Ruta Datos",
    name: "Datos y machine learning",
    headline: "Aprende a predecir con datos y machine learning",
    description:
      "De cero a predecir con datos y machine learning en producción. Python, SQL y el stack de datos moderno.",
    stackPills: ["Python · SQL", "pipelines · warehouse", "ML · forecasting · evals"],
    tone: "cyan",
    modules: [
      {
        level: "Base",
        levelLabel: "Nivel inicial · Módulo 1",
        title: "Fundamentos con Python",
        stack: "Python · SQL · terminal · Git · IA asistida",
        outcome: "Terminas con tu primer análisis de datos publicado.",
        bullets: [
          "Programación desde cero con Python, trabajando con datos reales desde la semana uno",
          "SQL básico, terminal y Git: las herramientas de todo perfil de datos",
          "Desarrollo asistido por IA desde el día uno, con criterio",
        ],
      },
      {
        level: "Ascenso",
        levelLabel: "Nivel intermedio · Módulo 2",
        title: "Ingeniería de Datos",
        stack: "SQL avanzado · pipelines · warehouse · orquestación",
        outcome: "Terminas con un pipeline completo funcionando en producción.",
        bullets: [
          "Pipelines de datos de punta a punta: extracción, transformación, carga",
          "Modelado de datos y warehouse según cómo se usa la información",
          "APIs como fuente de datos, calidad y testing de datos",
        ],
      },
      {
        level: "Cumbre",
        levelLabel: "Nivel avanzado · Módulo 3",
        title: "Machine Learning Aplicado",
        stack: "predicción · forecasting · despliegue · evals",
        outcome:
          "Terminas con un modelo desplegado resolviendo un problema real.",
        bullets: [
          "ML con criterio de producto: predicción, clasificación y forecasting sobre problemas reales",
          "Evaluación rigurosa: la disciplina de medir lo que los LLMs no pueden responder",
          "Despliegue y monitoreo de modelos en producción",
          "Evals para sistemas de IA: el perfil de datos dentro de los equipos de agentes",
        ],
      },
    ],
  },
];

export const RUTAS_MODULOS_NOTE =
  "Puedes tomar cualquier módulo de forma independiente.";

export const COMO_FUNCIONA = {
  eyebrow: "Cómo funciona",
  title: "Tres módulos, un mismo viaje",
  intro:
    "Cada ruta se recorre en tres módulos independientes de 8 semanas: la ruta completa toma 24 semanas, unos seis meses. Cada módulo se puede tomar de forma independiente. Empiezas donde estás, avanzas a tu ritmo y cada módulo termina con un proyecto real que puedes mostrar.",
  stats: [
    { value: "8 semanas", detail: "por módulo. Compromisos cortos, avance visible." },
    {
      value: "8 horas / semana",
      detail:
        "4 horas presenciales en Casa Tech, los sábados o entre semana, y 4 horas de práctica guiada en casa. Compatible con tu trabajo actual.",
    },
    { value: "12 personas", detail: "máximo por curso. Guía cercana, no auditorios." },
    {
      value: "1 proyecto",
      detail:
        "real al cierre de cada módulo, presentado en demo day y con constancia de participación.",
    },
  ],
  levels: [
    {
      name: "Nivel inicial",
      label: "Módulo 1",
      description:
        "Para personas nuevas en tecnología. Aquí aprendes a programar desde cero y a trabajar con IA desde el primer día. No necesitas experiencia previa, solo curiosidad.",
    },
    {
      name: "Nivel intermedio",
      label: "Módulo 2",
      description:
        "Para quienes ya programan. Aquí pasas de escribir código a construir sistemas completos con criterio profesional.",
    },
    {
      name: "Nivel avanzado",
      label: "Módulo 3",
      description:
        "La especialidad que el mercado está pagando hoy. Terminas con un perfil que casi nadie más está formando en la región.",
    },
  ],
  callouts: [
    {
      title: "Entra donde estás",
      body: "Si ya programas o trabajas con datos, no empiezas desde cero: un diagnóstico gratuito te ubica directo en el módulo 2 o en el módulo 3, sin pagar ni repetir lo que ya sabes.",
    },
    {
      title: "Las rutas se cruzan",
      body: "La ruta Producto termina construyendo agentes de IA, la ruta Datos termina midiendo y prediciendo lo que los agentes no pueden. Al terminar tu ruta puedes cruzar a la otra.",
    },
  ],
} as const;

export const DESPUES_CUMBRE = {
  eyebrow: "Después de tu ruta",
  title: "El aprendizaje te conecta con el ecosistema",
  intro:
    "Tech Centre es la puerta de entrada al ecosistema Costa Digital. Terminar tu ruta no es el final del viaje: es el momento en que empiezas a aplicar lo que sabes en proyectos reales del Caribe.",
  items: [
    {
      title: "Prácticas con Ciudad Inmersiva",
      body: "Los mejores perfiles de cada cohorte pueden acceder a prácticas y proyectos reales con Ciudad Inmersiva, aplicando lo aprendido en productos que ya están en el mercado.",
    },
    {
      title: "Centro de Innovación de Costa Digital",
      body: "Participa en retos, proyectos e iniciativas del Centro de Innovación, donde la tecnología se pone al servicio de la región y su industria.",
    },
    {
      title: "Comunidad que sigue contigo",
      body: "Demo days, eventos mensuales, mentorías y una red de egresados que se refiere, se contrata y se apoya. Al cierre de cada ciclo conectamos egresados con oportunidades reales del ecosistema. Aquí nadie aprende solo.",
    },
  ],
} as const;

export const RUTAS_CTA_FINAL = {
  title: "El viaje apenas comienza",
  body: "Agenda tu diagnóstico gratuito y descubre en qué módulo empiezas. O ven primero a un demo day y mira con tus propios ojos lo que construyen nuestros estudiantes. No tienes que saberlo todo para empezar, solo dar el primer paso.",
  cta: "Agenda tu diagnóstico gratuito",
  note: "Gratis · sin compromiso · te ubica en tu módulo",
  empresas:
    "¿Buscas formar a tu equipo? También llevamos estos programas dentro de empresas. Escríbenos.",
} as const;
