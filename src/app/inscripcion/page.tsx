import type { Metadata } from "next";
import { Check } from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import { createClient } from "@/lib/supabase/server";
import InscripcionForm, { type InscripcionAccount } from "./InscripcionForm";

async function getAccount(): Promise<InscripcionAccount | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = profile as { first_name: string | null; last_name: string | null; phone: string | null } | null;
  return {
    nombre: `${row?.first_name ?? ""} ${row?.last_name ?? ""}`.trim(),
    email: user.email ?? "",
    telefono: row?.phone ?? "",
  };
}

export const metadata: Metadata = {
  title: "Inscripción · Empieza tu camino en Tech Centre",
  description:
    "Inscríbete en Tech Centre. Déjanos tus datos y te contactamos para coordinar tu cupo en la ruta Construye o Revela.",
};

const reassurance = [
  "Grupos pequeños y cupos limitados",
  "Clases presenciales en Barranquilla",
  "Acompañamiento de cero a contratable",
  "Programa de empleabilidad incluido",
];

export default async function InscripcionPage() {
  const account = await getAccount();

  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Inscripción"
        title={
          <>
            Empieza a{" "}
            <span className="lv2-mint">explorar.</span>
          </>
        }
        subtitle="El viaje apenas comienza. Déjanos tus datos y te acompañamos en cada paso."
      />

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr]">
          <Reveal>
            <div className="lv2-card h-full p-7">
              <h2 className="lv2-display text-2xl text-[var(--paper)]">
                Lo que recibes
              </h2>
              <ul className="mt-6 space-y-4">
                {reassurance.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mint)]" aria-hidden="true" />
                    <span className="lv2-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <InscripcionForm account={account} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
