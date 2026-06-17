"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappWith } from "@/components/landing/data";

const programas = [
  "Construye · Ruta Web",
  "Revela · Ruta de Datos",
  "Aún no lo sé, oriéntame",
];

const fuentes = [
  "Instagram",
  "Un amigo o conocido",
  "Un evento de la comunidad",
  "Google / búsqueda",
  "Otro",
];

export default function InscripcionForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    programa: programas[0],
    fuente: fuentes[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, quiero inscribirme en Tech Centre.\nNombre: ${form.nombre}\nCorreo: ${form.email}\nTeléfono: ${form.telefono}\nPrograma: ${form.programa}\nMe enteré por: ${form.fuente}`;
    window.open(whatsappWith(text), "_blank", "noopener,noreferrer");
  };

  const field =
    "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--paper)] placeholder:text-[var(--mute)] focus:border-[var(--mint)] focus:outline-none focus:ring-1 focus:ring-[var(--mint)]";

  return (
    <form onSubmit={handleSubmit} className="lv2-card p-7 md:p-9">
      <label className="block">
        <span className="lv2-mono">Nombre completo</span>
        <input
          type="text"
          required
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
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className={field}
            placeholder="300 000 0000"
          />
        </label>
      </div>
      <label className="mt-5 block">
        <span className="lv2-mono">Programa de interés</span>
        <select
          value={form.programa}
          onChange={(e) => setForm({ ...form, programa: e.target.value })}
          className={field}
        >
          {programas.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
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
      <button type="submit" className="lv2-btn mt-7 w-full text-lg">
        Enviar inscripción
        <Send className="h-5 w-5" aria-hidden="true" />
      </button>
      <p className="mt-3 text-center text-xs lv2-mute">
        Te contactamos por WhatsApp para coordinar los siguientes pasos.
      </p>
    </form>
  );
}
