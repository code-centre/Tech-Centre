"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import useUserStore from "../../../store/useUserStore";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import SignInWithGoogle from "../../components/SignInWithGoogle";


const Login = () => {
  const { setUser } = useUserStore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [signInWithEmailAndPassword, user, loading, authError] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth()

    try {
      const res = await signInWithEmailAndPassword(email, password);

      if (res) {
        const user = res.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({ ...userData, id: user.uid });
          router.back();
        } else {
          setError("No se encontraron datos adicionales para este usuario.");
        }
      } else {
        setError(
          "Error al iniciar sesión. Por favor verifica tus credenciales."
        );
      }
    } catch (error) {
      setError("Error inesperado. Por favor, inténtalo de nuevo más tarde.");
    }
  };

  const getErrorMessage = (error: any) => {
    switch (error?.code) {
      case "auth/user-not-found":
        return "Usuario no encontrado. Por favor, verifica tu correo electrónico.";
      case "auth/wrong-password":
        return "Contraseña incorrecta. Por favor, inténtalo de nuevo.";
      case "auth/invalid-email":
        return "Correo electrónico inválido. Por favor, verifica el formato.";
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada. Contacta al soporte.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Por favor, inténtalo más tarde.";
      default:
        return "Error al iniciar sesión. Por favor verifica tu usuario y contraseña.";
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto border p-4 md:p-8 rounded-lg shadow-sm space-y-4">
      <h2 className="text-3xl font-bold text-blue-500">
        Iniciar Sesión
      </h2>
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
          {(error || authError) && (
            <p className="text-red-500 text-center">
              {error || getErrorMessage(authError)}
            </p>
          )}
        </label>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
      <SignInWithGoogle setError={setError} />
      <div className="h-1 border-b border-dashed border-gray-300"></div>
      <span className="text-sm mt-5 block text-center">¿No tienes una cuenta? - <Link href='/registro' className="text-blue-400 hover:text-blue-500">Crea una aquí</Link></span>
    </div>
  );
};

export default Login;


