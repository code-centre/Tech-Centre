import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCareerBySlug } from "@/data/careers";
import AIEngineerLanding from "./AIEngineerLanding";

export async function generateMetadata(): Promise<Metadata> {
  const career = await getCareerBySlug("ai-engineer");

  if (!career) {
    return {
      title: "AI Engineer - Tech Centre",
      description:
        "Conviértete en AI Engineer. Programa de formación intensivo en inteligencia artificial aplicada.",
    };
  }

  return {
    title: career.metadata.title,
    description: career.metadata.description,
    keywords: career.metadata.keywords,
    openGraph: {
      title: career.metadata.title,
      description: career.metadata.description,
      type: "website",
      images: career.image
        ? [{ url: career.image, width: 1200, height: 630, alt: career.name }]
        : [],
    },
  };
}

export default async function AIEngineerPage() {
  const career = await getCareerBySlug("ai-engineer");

  if (!career) {
    notFound();
  }

  return <AIEngineerLanding career={career} />;
}
