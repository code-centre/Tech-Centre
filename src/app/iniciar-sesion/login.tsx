"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const showVerificationMessage = searchParams.get('verification') === 'email-sent';

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${baseUrl}/auth/callback` },
      });
      if (oauthError) throw oauthError;
      if (data?.url) window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

          {showVerificationMessage && (
            <div className="p-4 bg-primary dark:bg-secondary/20 border border-secondary/30 text-primary dark:text-blue-400 rounded-lg flex items-start gap-3">
              <Mail className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">¡Cuenta creada exitosamente!</p>
                <p className="text-sm">
                  Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta antes de iniciar sesión.
                </p>
              </div>
            </div>
          )}

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
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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

            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-bg-primary dark:bg-transparent text-text-muted dark:text-gray-400">
                  o continúa con
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-text-primary dark:text-gray-300 hover:bg-bg-secondary/80 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}
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
