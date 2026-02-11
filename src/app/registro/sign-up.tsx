"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  [key: string]: string;
}

const getErrorMessage = (error: unknown): string => {
  const errorMessage = (error as Error)?.message?.toLowerCase() || "";

  if (errorMessage.includes("email") && errorMessage.includes("already")) {
    return "Este correo electrónico ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.";
  }

  if (errorMessage.includes("email") || errorMessage.includes("invalid")) {
    return "Por favor, ingresa un correo electrónico válido.";
  }

  if (errorMessage.includes("password") && errorMessage.includes("weak")) {
    return "La contraseña es muy débil. Usa al menos 6 caracteres con letras y números.";
  }

  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    return "Problema de conexión. Por favor, verifica tu internet e intenta nuevamente.";
  }

  if (errorMessage.includes("rate limit") || errorMessage.includes("too many")) {
    return "Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.";
  }

  if (errorMessage.includes("profile") || errorMessage.includes("perfil")) {
    return "Tu cuenta se creó, pero hubo un problema al guardar tu información. Por favor, contacta al soporte.";
  }

  if (errorMessage.includes("duplicate") || errorMessage.includes("duplicado") || errorMessage.includes("ya existe")) {
    return (error as Error).message || "Ya existe un perfil con estos datos.";
  }

  return "Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta al soporte si el problema persiste.";
};

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor, ingresa un correo electrónico válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Por favor, confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setResendStatus({ type: null, message: "" });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData?.user) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const profileData = {
          user_id: authData.user.id,
          email: formData.email.trim().toLowerCase(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: "",
          id_type: "CC" as const,
          id_number: "",
          birthdate: "1990-01-01",
          address: null,
          role: "student" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .insert([profileData]);

        if (profileError) {
          if (profileError.code === "23505") {
            throw new Error("Ya existe un perfil con estos datos. Por favor, inicia sesión.");
          }
          throw new Error("Error al guardar el perfil. Por favor, contacta al soporte.");
        }

        setIsRegistered(true);
        router.push("/iniciar-sesion?verification=email-sent");
      } else {
        throw new Error("No se pudo completar el registro. Inténtalo de nuevo.");
      }
    } catch (error) {
      setErrors({ general: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus({ type: null, message: "" });

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: formData.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      setResendStatus({
        type: "error",
        message: "No pudimos reenviar el correo. Verifica que el correo sea correcto.",
      });
    } else {
      setResendStatus({
        type: "success",
        message: "¡Correo de verificación enviado! Revisa tu bandeja de entrada.",
      });
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
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-bg-primary dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-6">
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
              Crea tu cuenta
            </h2>
            <p className="text-text-muted dark:text-gray-400 text-sm">
              Solo necesitamos estos datos para comenzar. Puedes completar tu perfil después.
            </p>
          </div>

          {errors.general && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="flex-1">{errors.general}</p>
            </div>
          )}

          {isRegistered && (
            <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-start gap-3">
              <Mail className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">¡Cuenta creada exitosamente!</p>
                <p className="text-sm">
                  Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={`w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                    errors.firstName ? "border-red-500" : "border-border-color dark:border-gray-700"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={`w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                    errors.lastName ? "border-red-500" : "border-border-color dark:border-gray-700"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-border-color dark:border-gray-700"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={`w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-border-color dark:border-gray-700"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={`w-full px-4 py-3 bg-bg-secondary dark:bg-gray-800/50 border rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                  errors.confirmPassword ? "border-red-500" : "border-border-color dark:border-gray-700"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Crear cuenta
                </>
              )}
            </button>

            {isRegistered && (
              <div className="p-4 bg-bg-secondary dark:bg-gray-800/30 rounded-lg border border-border-color dark:border-gray-700 space-y-3">
                <p className="text-sm text-text-primary dark:text-gray-300">
                  ¿No recibiste el correo de verificación?
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Reenviar correo de verificación
                </button>
                {resendStatus.message && (
                  <div
                    className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                      resendStatus.type === "success"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30"
                        : "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/30"
                    }`}
                  >
                    {resendStatus.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <p>{resendStatus.message}</p>
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color dark:border-gray-700" />
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-text-muted dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/iniciar-sesion"
                className="font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                Iniciar sesión
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
