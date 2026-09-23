"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, MessageCircle, Send } from "lucide-react";
import { whatsappWith } from "@/components/landing/data";
import { RUTAS } from "@/components/landing/rutas/data";
import { trackCompleteRegistration } from "@/lib/analytics/meta/events";
import { submitInscripcion, type InscripcionResult } from "./actions";
import { SIN_DECIDIR } from "./constants";

const gruposProgramas = RUTAS.map((ruta) => ({
  label: `${ruta.label} · ${ruta.name}`,
  opciones: ruta.modules.map(
    (mod, i) => `${ruta.label} · Módulo ${i + 1}: ${mod.title}`,
  ),
}));

const programaInicial = gruposProgramas[0].opciones[0];

const fuentes = [
  "Instagram",
  "Un amigo o conocido",
  "Un evento de la comunidad",
  "Google / búsqueda",
  "Otro",
];

export interface InscripcionAccount {
  nombre: string;
  email: string;
  telefono: string;
}

type Done = Exclude<InscripcionResult, { status: "error" }>;

export default function InscripcionForm({ account }: { account: InscripcionAccount | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: account?.nombre ?? "",
    email: account?.email ?? "",
    telefono: account?.telefono ?? "",
    password: "",
    programa: programaInicial,
    fuente: fuentes[0],
    company: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const whatsappHref = whatsappWith(
    `Hola, quiero inscribirme en Tech Centre.\nNombre: ${form.nombre}\nCorreo: ${form.email}\nTeléfono: ${form.telefono}\nPrograma: ${form.programa}\nMe enteré por: ${form.fuente}`,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await submitInscripcion(form);
      if (result.status === "error") {
        setError(result.error);
        return;
      }
      if (result.status === "created") {
        trackCompleteRegistration({ email: result.email, userId: result.userId });
      }
      setDone(result);
      router.refresh();
    } catch {
      setError("Problema de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    const nombre = form.nombre.trim().split(/\s+/)[0];
    return (
      <section className="lv2-card p-7 md:p-9" aria-live="polite" aria-labelledby="inscripcion-lista">
        <CheckCircle2 className="h-10 w-10 text-[var(--mint)]" aria-hidden="true" />
        <h2 id="inscripcion-lista" className="lv2-display mt-4 text-2xl text-[var(--paper)]">
          ¡Listo{nombre ? `, ${nombre}` : ""}! Tu inscripción quedó registrada.
        </h2>
        <p className="mt-3 lv2-soft">
          {done.status === "created" &&
            `También creamos tu cuenta con ${done.email} y ya iniciaste sesión. Desde tu perfil puedes seguir tu proceso.`}
          {done.status === "signed-in" && "Ya tenías una cuenta con ese correo, así que iniciamos sesión por ti."}
          {done.status === "enrolled" && "Te contactaremos pronto para coordinar tu cupo."}
          {done.status === "existing" &&
            `Ya existe una cuenta con ${done.email}, pero la contraseña no coincide. Inicia sesión o recupera tu contraseña para entrar.`}
        </p>
        <p className="mt-3 lv2-soft">Escríbenos por WhatsApp para apartar tu cupo más rápido.</p>
        <nav className="mt-7 flex flex-col gap-3 sm:flex-row" aria-label="Siguientes pasos">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="lv2-btn flex-1">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Avisar por WhatsApp
          </a>
          {done.status === "existing" ? (
            <>
              <Link href="/iniciar-sesion" className="lv2-btn-secondary flex-1">
                Iniciar sesión
              </Link>
              <Link href="/recuperar-contrasena" className="lv2-btn-secondary flex-1">
                Recuperar contraseña
              </Link>
            </>
          ) : (
            <Link href="/perfil" className="lv2-btn-secondary flex-1">
              Ir a mi perfil
            </Link>
          )}
        </nav>
      </section>
    );
  }

  const field =
    "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--paper)] placeholder:text-[var(--mute)] focus:border-[var(--mint)] focus:outline-none focus:ring-1 focus:ring-[var(--mint)]";

  return (
    <form onSubmit={handleSubmit} className="lv2-card p-7 md:p-9">
      <label className="block">
        <span className="lv2-mono">Nombre completo</span>
        <input
          type="text"
          required
          autoComplete="name"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className={field}
          placeholder="Tu nombre"
        />
      </label>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="lv2-mono">Correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            readOnly={Boolean(account)}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={field}
            placeholder="tucorreo@email.com"
          />
        </label>
        <label className="block">
          <span className="lv2-mono">Teléfono</span>
          <input
            type="tel"
            required
            autoComplete="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className={field}
            placeholder="300 000 0000"
          />
        </label>
      </div>
      {!account && (
        <label className="mt-5 block">
          <span className="lv2-mono">Crea una contraseña</span>
          <span className="relative block">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${field} pr-12`}
              placeholder="Mínimo 6 caracteres"
              aria-describedby="inscripcion-password-hint"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-[var(--mute)] transition-colors hover:text-[var(--paper)]"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
          <small id="inscripcion-password-hint" className="mt-2 block text-xs lv2-mute">
            Con ella entras a tu cuenta de Tech Centre para seguir tu inscripción.
          </small>
        </label>
      )}
      <label className="mt-5 block">
        <span className="lv2-mono">Programa de interés</span>
        <select
          value={form.programa}
          onChange={(e) => setForm({ ...form, programa: e.target.value })}
          className={field}
        >
          {gruposProgramas.map((grupo) => (
            <optgroup key={grupo.label} label={grupo.label}>
              {grupo.opciones.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={SIN_DECIDIR}>{SIN_DECIDIR}</option>
        </select>
      </label>
      <label className="mt-5 block">
        <span className="lv2-mono">¿Cómo te enteraste de nosotros?</span>
        <select
          value={form.fuente}
          onChange={(e) => setForm({ ...form, fuente: e.target.value })}
          className={field}
        >
          {fuentes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label className="sr-only" aria-hidden="true">
        Empresa
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </label>
      {error && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      <button type="submit" disabled={isLoading} className="lv2-btn mt-7 w-full text-lg disabled:opacity-60">
        {isLoading ? (
          <>
            Enviando…
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </>
        ) : (
          <>
            Enviar inscripción
            <Send className="h-5 w-5" aria-hidden="true" />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs lv2-mute">
        {account
          ? "Guardamos tu inscripción en tu cuenta y te contactamos para coordinar tu cupo."
          : "Al enviar, creamos tu cuenta con estos datos. ¿Ya tienes una? "}
        {!account && (
          <Link href="/iniciar-sesion" className="underline hover:text-[var(--mint)]">
            Inicia sesión
          </Link>
        )}
      </p>
    </form>
  );
}
