"use client"

import type React from "react"
import { useState } from "react"
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth, db } from "@/../firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import useUserStore from "@/../store/useUserStore"
import Link from "next/link"
import AlertModal from "./AlertModal"
import SignInWithGoogle from "./SignInWithGoogle"
import type { User } from "@/types/supabase"

interface LoginEventFormProps {
  onLogin: () => void
  onClose?: () => void
}

const LoginEventForm: React.FC<LoginEventFormProps> = ({ onLogin, onClose }) => {
  const { setUser } = useUserStore()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [signInWithEmailAndPassword, user, loading, authError] = useSignInWithEmailAndPassword(auth)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await signInWithEmailAndPassword(email, password)

      if (res) {
        const user = res.user
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data() as User
          setUser({ ...userData, id: user.uid })
          if (user) {
            onLogin()
          } else {
            setError("Error al autenticar usuario. Por favor, inténtalo de nuevo.")
          }
        } else {
          setError("No se encontraron datos adicionales para este usuario.")
        }
      } else {
        setError("Error al iniciar sesión. Por favor verifica tus credenciales.")
      }
    } catch (error) {
      setError("Error inesperado. Por favor, inténtalo de nuevo más tarde.")
    }
  };


  const getErrorMessage = (error: any) => {
    switch (error?.code) {
      case "auth/user-not-found":
        return "Usuario no encontrado. Por favor, verifica tu correo electrónico."
      case "auth/wrong-password":
        return "Contraseña incorrecta. Por favor, inténtalo de nuevo."
      case "auth/invalid-email":
        return "Correo electrónico inválido. Por favor, verifica el formato."
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada. Contacta al soporte."
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Por favor, inténtalo más tarde."
      default:
        return "Error al iniciar sesión. Por favor verifica tu usuario y contraseña."
    }
  }

  return (
    <>
      <div className="w-full space-y-4 text-white">
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Correo
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Contraseña
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {(error || authError) && <p className="text-red-500 text-center">{error || getErrorMessage(authError)}</p>}
          </label>
          <button
            type="submit"
            className="w-full py-2 bg-blueApp text-white font-bold rounded-md hover:bg-blue-600 transition duration-300"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>
        <SignInWithGoogle onLogin={onLogin} onClose={onClose} setError={setError} isInModal={true} />
        <span className="text-sm mt-5 block text-center">
          ¿No tienes una cuenta? -{" "}
          <Link href={`/registro`} className="text-blue-400 hover:text-blue-500">
            Crea una aquí
          </Link>
        </span>
      </div>
    </>
  )
}

export default LoginEventForm

