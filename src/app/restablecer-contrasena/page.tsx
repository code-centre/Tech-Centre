import type { Metadata } from "next";
import ResetPassword from "./ResetPassword";

export const metadata: Metadata = {
  title: "Restablecer Contraseña",
  description:
    "Establece una nueva contraseña para tu cuenta de Tech Centre. Usa el enlace que recibiste por correo electrónico.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RestablecerContrasenaPage() {
  return <ResetPassword />;
}
