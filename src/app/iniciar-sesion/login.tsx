"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// import React, { useState, useEffect } from "react";
// import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
// import { auth, db } from "../../../firebase";
// import { useRouter } from "next/navigation";
// import useUserStore from "../../../store/useUserStore";
// import { doc, getDoc } from "firebase/firestore";
// import Link from "next/link";
// import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
// import SignInWithGoogle from "../../components/SignInWithGoogle";


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Mapeo de errores de Supabase a mensajes amigables
      switch (signInError.message) {
        case 'Invalid login credentials':
          throw new Error('Correo o contraseña incorrectos');
        case 'Email not confirmed':
          throw new Error('Por favor verifica tu correo electrónico antes de iniciar sesión');
        case 'Email rate limit exceeded':
          throw new Error('Demasiados intentos. Por favor, inténtalo más tarde');
        default:
          console.error('Error de autenticación:', signInError);
          throw new Error('Error al iniciar sesión. Por favor, inténtalo de nuevo');
      }
    }

    // Forzar recarga completa de la página para asegurar que todos los datos se actualicen
    window.location.href = '/';
    // Alternativa si prefieres usar el router:
    // router.replace('/');
    // router.refresh();

  } catch (err: any) {
    console.error('Error en inicio de sesión:', err);
    setError(err.message || 'Error al iniciar sesión');
  } finally {
    setIsLoading(false);
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
    <div className="min-h-[80vh] w-full max-w-md mx-auto flex items-center justify-center p-4 mt-25">
      <div className="w-full relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-2xl 
        shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100/80
        space-y-8 animate-fade-in animate-duration-500 ">
        
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
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <a href="/recuperar-contrasena" className="text-sm text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
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


