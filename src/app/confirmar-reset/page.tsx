import type { Metadata } from "next";
import ConfirmarReset from "./ConfirmarReset";

export const metadata: Metadata = {
  title: "Confirmar restablecimiento",
  description:
    "Confirma que deseas restablecer tu contraseña en Tech Centre. Haz clic en el botón para continuar.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmarResetPage() {
  return <ConfirmarReset />;
}
