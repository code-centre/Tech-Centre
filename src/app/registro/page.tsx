import type { Metadata } from "next";
import SignUp from "./sign-up";
import { signupPrefillFromSearchParams } from "@/lib/signupPrefill";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta en Tech Centre y accede a nuestros programas académicos en tecnología. Regístrate para comenzar tu formación profesional.",
  robots: {
    index: false,
    follow: false,
  },
};

interface RegistroPageProps {
  searchParams: Promise<{
    email?: string;
    firstName?: string;
    lastName?: string;
    nombre?: string;
    phone?: string;
    telefono?: string;
  }>;
}

export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const params = await searchParams;
  const prefill = signupPrefillFromSearchParams(params);
  const hasPrefill = Boolean(prefill.email || prefill.firstName || prefill.lastName);

  return <SignUp initialValues={prefill} fromInscripcion={hasPrefill} />;
}
