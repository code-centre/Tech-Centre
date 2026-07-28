import type { Metadata } from "next";
import { Hanken_Grotesk, Space_Mono } from "next/font/google";
import AgentesCourseSchema from "@/components/landing/agentes/AgentesCourseSchema";
import AgentesPage from "@/components/landing/agentes/AgentesPage";
import { AGENTES_META, AGENTES_PATH } from "@/components/landing/agentes/data";

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

export const metadata: Metadata = {
  title: { absolute: AGENTES_META.title },
  description: AGENTES_META.description,
  alternates: { canonical: AGENTES_PATH },
  openGraph: {
    title: AGENTES_META.title,
    description: AGENTES_META.description,
    url: AGENTES_PATH,
    type: "website",
    images: [
      {
        url: AGENTES_META.ogImage,
        width: 1200,
        height: 630,
        alt: "Programa avanzado de ingeniería de agentes de IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: AGENTES_META.title,
    description: AGENTES_META.description,
    images: [AGENTES_META.ogImage],
  },
};

export default function IngenieriaDeAgentesPage() {
  return (
    <>
      <AgentesCourseSchema />
      <div className={`${hanken.variable} ${spaceMono.variable}`}>
        <AgentesPage />
      </div>
    </>
  );
}
