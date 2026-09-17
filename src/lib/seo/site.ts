import type { Metadata } from "next";
import { canonicalSiteUrl } from "@/lib/blog/siteUrl";

export const SITE_URL = canonicalSiteUrl();
export const SITE_NAME = "Tech Centre";
export const SITE_TAGLINE = "La academia de tecnología del Caribe";
export const SITE_SLOGAN = "Aprende tecnología alineada a la industria, de forma experiencial";

/** Preview por defecto (WhatsApp, LinkedIn, X, Facebook). */
export const DEFAULT_OG_PATH = "/og-image.jpg";
export const DEFAULT_OG_WIDTH = 1200;
export const DEFAULT_OG_HEIGHT = 630;
export const DEFAULT_OG_TYPE = "image/jpeg";
export const DEFAULT_OG_ALT =
  "Tech Centre · La academia de tecnología del Caribe. Formación experiencial con proyectos reales, mentores de industria y comunidad en Barranquilla.";

export const SITE_TITLE_DEFAULT = `${SITE_NAME} · ${SITE_TAGLINE}`;
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const SITE_DESCRIPTION =
  "Tech Centre es la academia de tecnología del Caribe. Formación experiencial alineada a la industria: proyectos reales, mentores activos, grupos pequeños y presencial en Casa Tech, Barranquilla. Agenda tu diagnóstico gratuito.";

export const HOME_TITLE =
  "Tech Centre | La academia de tecnología del Caribe · Barranquilla";

export const HOME_DESCRIPTION =
  "La academia de tecnología del Caribe. Aprendes haciendo, con mentores de industria, proyectos reales y grupos de máximo 12 personas. Rutas de AI Developer, Datos e ingeniería de agentes, presencial en Casa Tech, Barranquilla.";

export const SITE_KEYWORDS = [
  "academia de tecnología Caribe",
  "academia tecnología Barranquilla",
  "formación experiencial tecnología",
  "aprender tecnología Caribe",
  "cursos programación Barranquilla",
  "formación tech alineada a la industria",
  "cursos inteligencia artificial Caribe",
  "ruta AI Developer Barranquilla",
  "curso de datos y machine learning",
  "ingeniería de agentes IA",
  "Casa Tech Barranquilla",
  "Tech Centre",
  "Centro de Tecnología del Caribe",
];

export type SocialImage = {
  url: string;
  secureUrl: string;
  type: string;
  width: number;
  height: number;
  alt: string;
};

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export function defaultOgImages(alt: string = DEFAULT_OG_ALT): SocialImage[] {
  const url = toAbsoluteUrl(DEFAULT_OG_PATH);
  return [
    {
      url,
      secureUrl: url,
      type: DEFAULT_OG_TYPE,
      width: DEFAULT_OG_WIDTH,
      height: DEFAULT_OG_HEIGHT,
      alt,
    },
  ];
}

/** Usa la portada propia si existe; si no, la miniatura general del sitio. */
export function socialImages(
  image?: string | null,
  alt: string = DEFAULT_OG_ALT,
): SocialImage[] {
  if (!image) return defaultOgImages(alt);
  const url = toAbsoluteUrl(image);
  return [
    {
      url,
      secureUrl: url,
      type: image.match(/\.jpe?g($|\?)/i) ? "image/jpeg" : "image/png",
      width: DEFAULT_OG_WIDTH,
      height: DEFAULT_OG_HEIGHT,
      alt,
    },
  ];
}

export function defaultOpenGraph(
  overrides: Metadata["openGraph"] = {},
): NonNullable<Metadata["openGraph"]> {
  const images =
    overrides && "images" in overrides && overrides.images
      ? overrides.images
      : defaultOgImages();

  return {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    ...overrides,
    images,
  };
}

export function defaultTwitter(
  overrides: Metadata["twitter"] = {},
): NonNullable<Metadata["twitter"]> {
  const images =
    overrides && "images" in overrides && overrides.images
      ? overrides.images
      : [toAbsoluteUrl(DEFAULT_OG_PATH)];

  return {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    ...overrides,
    images,
  };
}
