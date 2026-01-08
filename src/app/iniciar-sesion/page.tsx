import type { Metadata } from "next"
import type React from "react"
import Login from "./login"

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en Tech Centre para acceder a tus programas académicos, cursos matriculados y perfil de usuario.",
  robots: {
    index: false,
    follow: false,
  },
};

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-5">
      <Login />
    </div>
  )
}

export default LoginPage

