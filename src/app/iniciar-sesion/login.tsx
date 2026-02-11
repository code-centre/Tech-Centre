"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        switch (signInError.message) {
          case 'Invalid login credentials':
            throw new Error('Correo o contraseña incorrectos');
          case 'Email not confirmed':
            throw new Error('Por favor verifica tu correo electrónico antes de iniciar sesión');
          case 'Email rate limit exceeded':
            throw new Error('Demasiados intentos. Por favor, inténtalo más tarde');
          default:
            throw new Error('Error al iniciar sesión. Por favor, inténtalo de nuevo');
        }
      }

      window.location.href = '/';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Panel imagen - oculto en mobile */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <Image
          src="/background-texture.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <Image
            src="/tech-center-logos/TechCentreLogoBlanco.png"
            alt="Tech Centre"
            width={220}
            height={60}
            className="mb-6"
          />
          <p className="text-white/90 text-lg font-medium max-w-xs">
            Impulsa tu carrera en tecnología
          </p>
        </div>
      </div>

      {/* Panel formulario */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="w-full max-w-md space-y-8">
          {/* Header - visible solo en mobile cuando no hay imagen */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/tech-center-logos/TechCentreLogoColor.png"
              alt="Tech Centre"
              width={180}
              height={48}
              className="mx-auto mb-4"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-text-primary dark:text-white">
              Iniciar Sesión
            </h2>
            <p className="text-text-muted dark:text-gray-400 text-sm">
              Bienvenido de nuevo a Tech-Centre
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary dark:text-gray-300">
                    Contraseña
                  </label>
                  <Link href="/recuperar-contrasena" className="text-sm text-secondary hover:text-secondary/80 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color dark:border-gray-700"></div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-text-muted dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/registro"
                className="font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                Regístrate aquí
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
