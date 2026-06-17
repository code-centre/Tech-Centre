"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappWith } from "@/components/landing/data";

const programas = [
  "Construye · Ruta Web",
  "Revela · Ruta de Datos",
  "Aún no lo sé, oriéntame",
];

export default function ContactoForm() {
  const [form, setForm] = useState({ nombre: "", contacto: "", programa: programas[0], mensaje: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, soy ${form.nombre}. Me interesa: ${form.programa}.\nContacto: ${form.contacto}.\n${form.mensaje}`;
    window.open(whatsappWith(text), "_blank", "noopener,noreferrer");
  };

  const field =
    "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--paper)] placeholder:text-[var(--mute)] focus:border-[var(--mint)] focus:outline-none focus:ring-1 focus:ring-[var(--mint)]";

  return (
    <form onSubmit={handleSubmit} className="lv2-card p-7">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="lv2-mono">Nombre</span>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className={field}
            placeholder="Tu nombre"
          />
        </label>
        <label className="block">
          <span className="lv2-mono">Teléfono o correo</span>
          <input
            type="text"
            required
            value={form.contacto}
            onChange={(e) => setForm({ ...form, contacto: e.target.value })}
            className={field}
            placeholder="Cómo te contactamos"
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
        <span className="lv2-mono">Mensaje</span>
        <textarea
          rows={4}
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          className={field}
          placeholder="Cuéntanos qué necesitas"
        />
      </label>
      <button type="submit" className="lv2-btn mt-6 w-full">
        Enviar por WhatsApp
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
