import type { Metadata } from "next";
import { Hanken_Grotesk, Space_Mono } from "next/font/google";
import ProgramasHub from "@/components/programas/ProgramasHub";
import { getProgramsHub } from "@/data/programsHub";

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
  "Dos rutas de seis meses y cursos cortos, presenciales en Casa Tech, Barranquilla. Aquí solo aparece lo que tiene cohorte abierta.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/programas" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/programas",
    type: "website",
  },
};

// La oferta cambia cuando se abren o cierran cohortes: se revalida cada hora
// para reflejarlo sin necesidad de redesplegar.
export const revalidate = 3600;

/** Hub de programas: las rutas visibles y los cursos que no pertenecen a ninguna. */
export default async function ProgramasPage() {
  const hub = await getProgramsHub();

  return (
    <div className={`${hanken.variable} ${spaceMono.variable}`}>
      <ProgramasHub hub={hub} />
    </div>
  );
}
