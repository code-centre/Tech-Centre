"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Página intermedia para evitar que el prefetch de enlaces por parte de
 * escáneres de correo (Outlook Safe Links, filtros corporativos, etc.)
 * consuma el token de recuperación antes de que el usuario haga clic.
 * El correo enlaza aquí; el usuario debe hacer clic en el botón para
 * ir al enlace real de Supabase.
 */
function ConfirmarResetContent() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || type !== "recovery") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <p className="font-semibold mb-1">Enlace inválido</p>
              <p className="text-sm">
                Falta información en el enlace. Asegúrate de usar el enlace
                completo que recibiste por correo.
              </p>
            </div>
          </div>
          <Link
            href="/recuperar-contrasena"
            className="inline-block w-full btn-primary text-center"
          >
            Solicitar nuevo enlace
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const redirectTo = `${baseUrl}/auth/callback?next=/restablecer-contrasena`;
  const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;

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
              Restablecer contraseña
            </h1>
            <p className="text-text-muted dark:text-gray-400 text-sm">
              Haz clic en el botón de abajo para ir a la página donde podrás
              elegir tu nueva contraseña.
            </p>
          </div>

          <a
            href={verifyUrl}
            className="w-full flex items-center justify-center btn-primary"
          >
            Restablecer contraseña
          </a>

          <p className="text-sm text-text-muted dark:text-gray-400 text-center">
            <Link href="/iniciar-sesion" className="text-secondary hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmarReset() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          <div className="animate-pulse text-text-muted dark:text-gray-400">
            Cargando...
          </div>
        </div>
      }
    >
      <ConfirmarResetContent />
    </Suspense>
  );
}
