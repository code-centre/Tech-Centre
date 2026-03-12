"use client";

import { useState, FormEvent, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createCareerLead } from "../actions";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "career" | "module";
  moduleName: string | null;
  careerName: string;
}

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  intent: string;
  message: string;
  company: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  whatsapp?: string;
  intent?: string;
}

const intents = [
  "Quiero inscribirme en la carrera completa",
  "Quiero inscribirme en un módulo individual",
  "Quiero resolver dudas antes de pagar",
  "Quiero conocer opciones de pago",
];

export default function EnrollmentModal({
  isOpen,
  onClose,
  type,
  moduleName,
  careerName,
}: EnrollmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    whatsapp: "",
    intent:
      type === "career"
        ? "Quiero inscribirme en la carrera completa"
        : "Quiero inscribirme en un módulo individual",
    message: "",
    company: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        intent:
          type === "career"
            ? "Quiero inscribirme en la carrera completa"
            : "Quiero inscribirme en un módulo individual",
        message:
          type === "module" && moduleName
            ? `Me interesa el módulo: ${moduleName}`
            : "",
      }));
      setIsSuccess(false);
      setSubmitError(null);
      setErrors({});
    }
  }, [isOpen, type, moduleName]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";

    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo no válido";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "El WhatsApp es requerido";
    } else if (formData.whatsapp.replace(/\D/g, "").length < 8) {
      newErrors.whatsapp = "Mínimo 8 dígitos";
    }

    if (!formData.intent.trim()) newErrors.intent = "Selecciona una opción";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError(null);

    const result = await createCareerLead({
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      intent: formData.intent,
      message: formData.message,
      company: formData.company,
      careerName,
      moduleName: type === "module" ? moduleName : null,
    });

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setSubmitError(
        result.error || "No pudimos registrar tu cupo. Intenta de nuevo.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border-color shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border-color bg-background rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {isSuccess
                ? "Registro exitoso"
                : type === "career"
                  ? "Inscribirme en AI Engineer"
                  : `Inscribirme: ${moduleName}`}
            </h3>
            {!isSuccess && (
              <p className="text-xs text-text-muted mt-0.5">
                Completa tus datos y nos pondremos en contacto
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--card-background)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
              <h4 className="text-xl font-bold text-text-primary mb-2">
                ¡Tu cupo ha sido apartado!
              </h4>
              <p className="text-sm text-text-muted mb-6">
                Nos pondremos en contacto contigo por WhatsApp para finalizar tu
                inscripción.
              </p>
              <button
                onClick={onClose}
                className="btn-primary px-8 py-3 rounded-lg font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Nombre completo *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-[var(--card-background)] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/50 ${
                    errors.name ? "border-red-500" : "border-border-color"
                  }`}
                  placeholder="Tu nombre"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Correo electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-[var(--card-background)] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/50 ${
                    errors.email ? "border-red-500" : "border-border-color"
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  WhatsApp *
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-[var(--card-background)] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/50 ${
                    errors.whatsapp ? "border-red-500" : "border-border-color"
                  }`}
                  placeholder="3001234567"
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.whatsapp}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="intent"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  ¿Qué te interesa? *
                </label>
                <select
                  id="intent"
                  value={formData.intent}
                  onChange={(e) =>
                    setFormData({ ...formData, intent: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-[var(--card-background)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/50 ${
                    errors.intent ? "border-red-500" : "border-border-color"
                  }`}
                >
                  <option value="">Selecciona una opción</option>
                  {intents.map((intent) => (
                    <option key={intent} value={intent}>
                      {intent}
                    </option>
                  ))}
                </select>
                {errors.intent && (
                  <p className="text-xs text-red-500 mt-1">{errors.intent}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Mensaje (opcional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border-color bg-[var(--card-background)] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/50 resize-none"
                  placeholder="¿Alguna pregunta o comentario?"
                />
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Apartar mi cupo"
                )}
              </button>

              <p className="text-[11px] text-text-muted/60 text-center">
                Al enviar este formulario aceptas ser contactado por WhatsApp
                sobre el programa AI Engineer de Tech Centre.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
