"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(!!user);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        const msg = updateError.message.toLowerCase();
        if (msg.includes("session") || msg.includes("expired")) {
          throw new Error(
            "El enlace ha expirado. Solicita uno nuevo desde la página de recuperar contraseña."
          );
        }
        if (msg.includes("weak") || msg.includes("password")) {
          throw new Error(
            "La contraseña es muy débil. Usa al menos 6 caracteres con letras y números."
          );
        }
        throw new Error(
          "No pudimos actualizar la contraseña. Por favor, inténtalo de nuevo."
        );
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/iniciar-sesion");
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al restablecer la contraseña."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (hasSession === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="animate-pulse text-text-muted dark:text-gray-400">
          Cargando...
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <p className="font-semibold mb-1">Enlace inválido o expirado</p>
              <p className="text-sm">
                El enlace para restablecer tu contraseña ha expirado o ya fue
                utilizado. Solicita uno nuevo desde la página de recuperar
                contraseña.
              </p>
            </div>
          </div>
          <Link
            href="/recuperar-contrasena"
            className="inline-block w-full btn-primary text-center"
          >
            Recuperar contraseña
          </Link>
          <p className="text-sm text-text-muted dark:text-gray-400">
            <Link href="/iniciar-sesion" className="text-secondary hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

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
              Nueva Contraseña
            </h1>
            <p className="text-text-muted dark:text-gray-400 text-sm">
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>
          </div>

          {isSuccess ? (
            <div
              className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg flex items-start gap-3"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Contraseña actualizada</p>
                <p className="text-sm">
                  Tu contraseña se ha restablecido correctamente. Serás
                  redirigido a iniciar sesión en unos segundos.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                    placeholder="Repite tu contraseña"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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
                {isLoading ? "Actualizando..." : "Restablecer contraseña"}
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
              <Link
                href="/iniciar-sesion"
                className="font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
