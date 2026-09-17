import type { Metadata } from "next";
import { Hanken_Grotesk, Space_Mono } from "next/font/google";
import ProgramasHub from "@/components/programas/ProgramasHub";
import { getProgramsHub } from "@/data/programsHub";
import { defaultOpenGraph, defaultTwitter } from "@/lib/seo/site";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const TITLE = "Programas y rutas de formación | Tech Centre";
const DESCRIPTION =
  "Programas experienciales de la academia de tecnología del Caribe: rutas de AI Developer y Datos, más cursos con cohorte abierta, presenciales en Casa Tech, Barranquilla.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/programas" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: "/programas",
  }),
  twitter: defaultTwitter({
    title: TITLE,
    description: DESCRIPTION,
  }),
};

// La oferta cambia cuando se abren o cierran cohortes: se revalida cada hora
// para reflejarlo sin necesidad de redesplegar.
export const revalidate = 60;

/** Hub de programas: las rutas visibles y los cursos que no pertenecen a ninguna. */
export default async function ProgramasPage() {
  const hub = await getProgramsHub();

  return (
    <div className={`${hanken.variable} ${spaceMono.variable}`}>
      <ProgramasHub hub={hub} />
    </div>
  );
}
