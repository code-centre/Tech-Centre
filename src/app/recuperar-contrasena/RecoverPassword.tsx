"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, AlertCircle } from "lucide-react";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const redirectTo = `${baseUrl}/auth/callback?next=/restablecer-contrasena`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );

      if (resetError) {
        const msg = resetError.message.toLowerCase();
        if (msg.includes("rate limit") || msg.includes("too many")) {
          throw new Error(
            "Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente."
          );
        }
        if (msg.includes("invalid") || msg.includes("email")) {
          throw new Error("Por favor, ingresa un correo electrónico válido.");
        }
        if (msg.includes("network") || msg.includes("fetch")) {
          throw new Error(
            "Problema de conexión. Verifica tu internet e intenta nuevamente."
          );
        }
        throw new Error(
          "No pudimos enviar el correo. Por favor, inténtalo de nuevo."
        );
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al enviar el correo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <section
        className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
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
      </section>

      <main className="flex-1 lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="w-full max-w-md space-y-8">
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
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">
              Recuperar Contraseña
            </h1>
            <p className="text-text-muted dark:text-gray-400 text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para
              restablecer tu contraseña.
            </p>
          </div>

          {isSuccess ? (
            <div
              className="p-4 bg-primary dark:bg-secondary/20 border border-secondary/30 text-primary dark:text-blue-400 rounded-lg flex items-start gap-3"
              role="status"
              aria-live="polite"
            >
              <Mail className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Correo enviado</p>
                <p className="text-sm">
                  Si existe una cuenta con ese correo, recibirás un enlace para
                  restablecer tu contraseña. Revisa tu bandeja de entrada y la
                  carpeta de spam.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1"
                >
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
                  autoComplete="email"
                />
              </div>

              {error && (
                <div
                  className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-lg text-sm flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color dark:border-gray-700" />
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-text-muted dark:text-gray-400">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/iniciar-sesion"
                className="font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                Iniciar sesión
              </Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecoverPassword;
