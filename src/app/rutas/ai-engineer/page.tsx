import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRouteBySlug } from "@/data/routes";
import AIEngineerLanding from "./AIEngineerLanding";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteBySlug("ai-engineer");

  if (!route) {
    return {
      title: "AI Engineer - Tech Centre",
      description:
        "Conviértete en AI Engineer. Programa de formación intensivo en inteligencia artificial aplicada.",
    };
  }

  return {
    title: route.metadata.title,
    description: route.metadata.description,
    keywords: route.metadata.keywords,
    openGraph: {
      title: route.metadata.title,
      description: route.metadata.description,
      type: "website",
      images: route.image
        ? [{ url: route.image, width: 1200, height: 630, alt: route.name }]
        : [],
    },
  };
}

export default async function AIEngineerPage() {
  const route = await getRouteBySlug("ai-engineer");

  if (!route) {
    notFound();
  }

  return <AIEngineerLanding route={route} />;
}
