import type { Metadata } from "next"
import LoginWrapper from "./LoginWrapper"

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en Tech Centre para acceder a tus programas académicos, cursos matriculados y perfil de usuario.",
  robots: {
    index: false,
    follow: false,
  },
};

const LoginPage = () => {
  return <LoginWrapper />
}

export default LoginPage

