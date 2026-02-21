import type { Metadata } from "next";
import RecoverPassword from "./RecoverPassword";

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description:
    "Recupera el acceso a tu cuenta de Tech Centre. Ingresa tu correo electrónico para recibir un enlace de restablecimiento.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RecuperarContrasenaPage() {
  return <RecoverPassword />;
}
