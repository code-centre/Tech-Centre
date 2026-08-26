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
  /** Identificador de la página del módulo: /programas/modulos/<slug> */
  slug: string;
  title: string;
  stack: string;
  outcome: string;
  /** Qué se necesita para entrar directo a este módulo. */
  requisito: string;
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
  /** Página de la ruta con el temario completo. */
  detailHref: string;
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
    detailHref: "/programas/construye",
    modules: [
      {
        level: "Base",
        levelLabel: "Nivel inicial · Módulo 1",
        slug: "fundamentos-de-programacion",
        title: "Fundamentos de Programación",
        stack: "JavaScript · terminal · Git · HTTP · IA asistida",
        outcome: "Terminas con tu primera aplicación publicada en internet.",
        requisito:
          "Nada. Este es el punto de entrada: empezamos desde cero, con computador, internet y ganas de aprender.",
        bullets: [
          "Programación desde cero: lógica, funciones, datos, resolución de problemas",
          "Las herramientas del oficio: terminal, Git y cómo funciona la web",
          "Desarrollo asistido por IA desde el día uno, con criterio sobre qué delegar y qué entender",
        ],
      },
      {
        level: "Ascenso",
        levelLabel: "Nivel intermedio · Módulo 2",
        slug: "ingenieria-de-producto",
        title: "Ingeniería de Producto",
        stack: "TypeScript · React · Node · PostgreSQL · deploy",
        outcome:
          "Terminas con un producto completo desplegado, con usuarios de prueba reales.",
        requisito:
          "Saber programar lo básico en JavaScript, o haber hecho el módulo 1. Si ya programas, el diagnóstico valida tu nivel y entras directo.",
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
        slug: "harness-y-agentes-de-ia",
        title: "Harness y Agentes de IA",
        stack: "Claude API · MCP · sandboxes · evals",
        outcome:
          "Terminas con un agente completo con harness propio, listo para producción.",
        requisito:
          "El nivel del módulo 2, o experiencia construyendo aplicaciones completas. Es el módulo más exigente de la ruta.",
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
    detailHref: "/programas/revela",
    modules: [
      {
        level: "Base",
        levelLabel: "Nivel inicial · Módulo 1",
        slug: "fundamentos-con-python",
        title: "Fundamentos con Python",
        stack: "Python · SQL · terminal · Git · IA asistida",
        outcome: "Terminas con tu primer análisis de datos publicado.",
        requisito:
          "Nada. Este es el punto de entrada: empezamos desde cero, con computador, internet y ganas de aprender.",
        bullets: [
          "Programación desde cero con Python, trabajando con datos reales desde la semana uno",
          "SQL básico, terminal y Git: las herramientas de todo perfil de datos",
          "Desarrollo asistido por IA desde el día uno, con criterio",
        ],
      },
      {
        level: "Ascenso",
        levelLabel: "Nivel intermedio · Módulo 2",
        slug: "ingenieria-de-datos",
        title: "Ingeniería de Datos",
        stack: "SQL avanzado · pipelines · warehouse · orquestación",
        outcome: "Terminas con un pipeline completo funcionando en producción.",
        requisito:
          "Python y SQL básicos, o haber hecho el módulo 1. Si ya trabajas con datos, el diagnóstico valida tu nivel y entras directo.",
        bullets: [
          "Pipelines de datos de punta a punta: extracción, transformación, carga",
          "Modelado de datos y warehouse según cómo se usa la información",
          "APIs como fuente de datos, calidad y testing de datos",
        ],
      },
      {
        level: "Cumbre",
        levelLabel: "Nivel avanzado · Módulo 3",
        slug: "machine-learning-aplicado",
        title: "Machine Learning Aplicado",
        stack: "predicción · forecasting · despliegue · evals",
        outcome:
          "Terminas con un modelo desplegado resolviendo un problema real.",
        requisito:
          "El nivel del módulo 2, o experiencia construyendo pipelines de datos. Es el módulo más exigente de la ruta.",
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

/* ==========================================================================
   Cohorte, precios y bloques de conversión de la home.
   Fuente editable: cambiar aquí actualiza hero, embudo, inversión y cierre.
   ========================================================================== */

/** Cohorte vigente. Actualizar al abrir la siguiente. */
export const RUTAS_COHORTE = {
  /** Fecha de inicio en texto, como se muestra al usuario. */
  startDate: "28 de septiembre",
  /** Cupos por grupo. */
  seatsTotal: 12,
  /**
   * Cupos que quedan. Poner un número para activar el mensaje de escasez
   * ("quedan 4 de 12 cupos"); dejar en null muestra solo "12 cupos por grupo".
   */
  seatsLeft: null as number | null,
} as const;

/** Precios por módulo. Un módulo son 8 semanas, 64 horas de formación. */
export const RUTAS_PRECIOS = {
  modulo: "$1.400.000",
  moduloLabel: "Módulos 1 y 2 · nivel inicial e intermedio",
  moduloAvanzado: "$1.600.000",
  moduloAvanzadoLabel: "Módulo 3 · nivel avanzado",
  reserva: "$100.000",
  cuotas: 3,
  descuentoEgresados: "10%",
  moduloEgresados: "$1.260.000",
  moduloAvanzadoEgresados: "$1.440.000",
  incluye: [
    "64 horas de formación con mentores activos en la industria",
    "Proyecto real desplegado y presentado en demo day",
    "Repos y biblioteca del módulo por 12 meses",
    "Créditos de API para tus proyectos, con clave propia",
    "Entrada a la comunidad, demo days y eventos del ecosistema",
    "Programa de empleabilidad y constancia de participación",
  ],
  becas:
    "Tenemos becas y convenios, como Becas Atlántico. Pregúntanos por las que están abiertas para tu caso.",
  sinRiesgo:
    "El diagnóstico es gratis y sin compromiso. Solo pagas si el nivel y el ritmo encajan contigo.",
} as const;

/** Calificador: a quién le sirve esto y a quién todavía no. */
export const RUTAS_FIT = {
  eyebrow: "Para quién es",
  title: "Esto funciona si vienes a construir, no a mirar clases",
  intro:
    "Preferimos decírtelo antes del diagnóstico: el salón es la mitad del método, y no todo el mundo necesita esto ahora.",
  yes: [
    {
      lead: "Nunca has programado",
      body: "y quieres entrar a tecnología con alguien que te corrija al lado, no con un video en pausa.",
    },
    {
      lead: "Ya programas",
      body: "y quieres el stack que se está pagando hoy: agentes, MCP, evals, machine learning en producción.",
    },
    {
      lead: "Tienes una idea de negocio",
      body: "y quieres salir del módulo 2 con tu producto desplegado y usuarios de prueba reales.",
    },
    {
      lead: "Trabajas",
      body: "y necesitas 8 horas a la semana que encajen: sábados o entre semana, y práctica guiada en casa.",
    },
  ],
  no: [
    {
      lead: "un curso 100% virtual y a tu ritmo",
      body: "Aquí las 4 horas presenciales son el corazón del método.",
    },
    {
      lead: "un título profesional",
      body: "Son programas de educación informal: te llevas portafolio y constancia, no diploma.",
    },
    {
      lead: "que el certificado te consiga el empleo",
      body: "sin construir nada. Lo que abre puertas aquí es lo que construyes.",
    },
  ],
  noClosing:
    "Si estás en esta columna, dilo en el diagnóstico. Te decimos con franqueza si te sirve o no, sin venderte nada.",
} as const;

/** Embudo explícito: qué pasa cuando el visitante hace clic. */
export const RUTAS_COMO_ENTRAS = {
  eyebrow: "Cómo entras",
  title: "Tres pasos, sin letra pequeña",
  intro:
    "No hay examen de admisión ni pago para empezar la conversación. El diagnóstico existe para que no pagues por repetir lo que ya sabes.",
  steps: [
    {
      when: "Paso 01 · hoy",
      title: "Agendas el diagnóstico",
      body: "20 minutos con un mentor, en la sede o por videollamada. Nos cuentas de dónde vienes y a dónde quieres llegar. Gratis y sin compromiso.",
    },
    {
      when: "Paso 02 · mismo día",
      title: "Te ubicamos en tu módulo",
      body: "Si nunca has programado, empiezas en el módulo 1. Si ya programas o trabajas con datos, entras directo al 2 o al 3, sin pagar lo que ya sabes.",
    },
    {
      when: "Paso 03 · cuando decidas",
      title: "Reservas tu cupo y empiezas",
      body: "Con la reserva aseguras uno de los cupos de la cohorte. El resto lo pagas en cuotas sin interés.",
    },
  ],
  note: "Cada módulo dura 8 semanas. La ruta completa son tres: unos seis meses en total, con compromisos cortos y avance visible cada dos meses.",
  cta: "Descubre en qué módulo empiezas",
} as const;

/** Preguntas de la home: las objeciones que frenan el clic. */
export const RUTAS_FAQS_HOME: { q: string; a: string }[] = [
  {
    q: "¿Necesito saber programar para entrar?",
    a: "No. El módulo 1 empieza desde cero: lógica, terminal, Git y programación desde lo más básico. Solo necesitas computador, internet y ganas reales de aprender.",
  },
  {
    q: "Ya programo, ¿puedo saltarme el módulo 1?",
    a: "Sí. El diagnóstico gratuito te ubica directo en el módulo 2 o en el 3, sin pagar ni repetir lo que ya sabes.",
  },
  {
    q: "¿Cuánto tiempo me toma a la semana?",
    a: "8 horas: 4 presenciales en Casa Tech, sábados o entre semana, y 4 de práctica guiada en casa. Está pensado para que puedas seguir trabajando.",
  },
  {
    q: "¿Puedo pagar a cuotas o hay becas?",
    a: "Sí a las dos. Reservas tu cupo y pagas el resto en hasta tres cuotas sin interés. Si ya hiciste un módulo con nosotros, tienes 10% de descuento. También tenemos becas y convenios, como Becas Atlántico.",
  },
  {
    q: "¿Esto me garantiza un empleo?",
    a: "No prometemos empleo. Te llevas un portafolio de proyectos desplegados, el programa de empleabilidad y una red que sí se refiere entre ella. Lo que abre puertas es lo que construyes.",
  },
  {
    q: "¿Qué me llevo al terminar?",
    a: "Un proyecto real desplegado y presentado en demo day, constancia de participación de Tech Centre, y acceso a la comunidad de egresados y al ecosistema Costa Digital.",
  },
];

/** Place ID de Google del que salen las reseñas de la home. */
export const RUTAS_GOOGLE_PLACE_ID = "ChIJv01Wyvot9I4RUtzmOXikbpM";

/**
 * Reseñas que se destacan junto al video, por nombre de autor.
 * Google devuelve las suyas por relevancia, no por qué tan bien venden: esta
 * lista deja elegir cuáles se muestran. Si queda vacía o no coinciden, se usan
 * las dos primeras que devuelva la API.
 */
export const RUTAS_RESENAS_DESTACADAS: string[] = [
  "Abis Rafael Figueredo Martinez",
  "Gabriel Landinez (Gabolandi)",
];

/* ==========================================================================
   Módulos como páginas propias: /programas/modulos/<slug>
   ========================================================================== */

export interface ModuloPagina {
  modulo: RutaModule;
  ruta: Ruta;
  /** Posición dentro de la ruta, empezando en 1. */
  numero: number;
}

/** Los seis módulos de las dos rutas, aplanados y con su contexto de ruta. */
export const MODULOS: ModuloPagina[] = RUTAS.flatMap((ruta) =>
  ruta.modules.map((modulo, i) => ({ modulo, ruta, numero: i + 1 })),
);

export function getModulo(slug: string): ModuloPagina | undefined {
  return MODULOS.find((m) => m.modulo.slug === slug);
}

export function moduloHref(slug: string): string {
  return `/programas/modulos/${slug}`;
}

/** Precio del módulo: el nivel avanzado vale más. */
export function precioModulo(modulo: RutaModule): {
  precio: string;
  egresados: string;
} {
  return modulo.level === "Cumbre"
    ? {
        precio: RUTAS_PRECIOS.moduloAvanzado,
        egresados: RUTAS_PRECIOS.moduloAvanzadoEgresados,
      }
    : {
        precio: RUTAS_PRECIOS.modulo,
        egresados: RUTAS_PRECIOS.moduloEgresados,
      };
}
