import type { Metadata } from "next";
import SignUp from "./sign-up";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta en Tech Centre y accede a nuestros programas académicos en tecnología. Regístrate para comenzar tu formación profesional.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegistroPage() {
  return <SignUp />;
}
