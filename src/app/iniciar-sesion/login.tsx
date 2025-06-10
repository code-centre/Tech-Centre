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
    <div className="min-h-[80vh] w-full max-w-md mx-auto flex items-center justify-center p-4">
      <div className="w-full relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-2xl 
        shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100/80
        space-y-8 animate-fade-in animate-duration-500">
        
        {/* Header with enhanced styling */}
        <div className="space-y-2 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-gray-800">
            <span className="relative inline-block pb-2">
              Iniciar Sesión
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-blue-600 rounded-full 
                animate-fade-in animate-delay-300"></span>
            </span>
          </h2>
          <p className="text-gray-600 text-sm">
            Bienvenido de nuevo a Tech-Centre
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Form fields with enhanced focus and hover states */}
          <div className="space-y-5">
            <label className="block space-y-2 animate-fade-in animate-delay-100">
              <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Correo electrónico</span>
              </span>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  transition-all duration-300 hover:border-blue-500/50"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4v16m8-8H4" />
                </svg>
                <span>Contraseña</span>
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  transition-all duration-300 hover:border-blue-500/50"
              />
            </label>
          </div>

          {(error || authError) && (
            <div className="animate-fade-in animate-duration-200">
              <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">
                {error || getErrorMessage(authError)}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg font-medium
              transform transition-all duration-300 hover:bg-blue-700 
              hover:scale-[1.02] active:scale-[0.98] 
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-md hover:shadow-lg
              animate-fade-in animate-duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
        </div>

        <div className="animate-fade-in animate-delay-150">
          <SignInWithGoogle setError={setError} />
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link 
              href="/registro" 
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200
                relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 
                after:bg-blue-600 after:transition-all hover:after:w-full"
            >
              Regístrate aquí
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;


