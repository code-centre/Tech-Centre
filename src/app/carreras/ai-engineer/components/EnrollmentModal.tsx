"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { createCareerLead } from "../actions";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModule?: string | null;
  careerName: string;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  selectedModule,
  careerName,
}: EnrollmentModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialogRef.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      intent: selectedModule
        ? "Quiero inscribirme en un módulo individual"
        : "Quiero inscribirme en la carrera completa",
      careerName,
      moduleName: selectedModule || undefined,
    };

    try {
      const result = await createCareerLead(data);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Error al enviar. Inténtalo de nuevo.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Error de conexión. Inténtalo de nuevo.");
    }
  }

  function handleClose() {
    setStatus("idle");
    setErrorMsg("");
    onClose();
  }

  if (!isOpen) return null;

  const inputClasses =
    "w-full px-4 py-3 rounded-lg border border-border-color text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all [background-color:var(--background)] dark:bg-[#2d3d4f]";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="fixed inset-0 z-50 bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm p-4 m-auto max-w-lg w-full rounded-2xl"
    >
      <div className="rounded-2xl shadow-2xl overflow-hidden bg-[var(--card-background)] border border-border-color">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              {selectedModule ? "Inscripción a módulo" : "Inscripción a la carrera"}
            </h2>
            {selectedModule && (
              <p className="text-sm text-secondary mt-0.5">{selectedModule}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-text-muted dark:text-gray-300 hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Body */}
        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
                ¡Cupo apartado!
              </h3>
              <p className="text-sm text-text-muted dark:text-gray-300 mb-6">
                Te contactaremos pronto por WhatsApp para confirmar tu
                inscripción y darte los detalles de pago.
              </p>
              <button
                onClick={handleClose}
                className="btn-primary px-8 py-3 font-semibold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-text-muted dark:text-gray-300">
                Aparta tu cupo y te contactamos por WhatsApp para completar tu
                inscripción.
              </p>

              <div>
                <label
                  htmlFor="enroll-name"
                  className="block text-sm font-semibold text-text-primary dark:text-white mb-1.5"
                >
                  Nombre completo
                </label>
                <input
                  id="enroll-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  className={inputClasses}
                />
              </div>

              <div>
                <label
                  htmlFor="enroll-email"
                  className="block text-sm font-semibold text-text-primary dark:text-white mb-1.5"
                >
                  Email
                </label>
                <input
                  id="enroll-email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className={inputClasses}
                />
              </div>

              <div>
                <label
                  htmlFor="enroll-whatsapp"
                  className="block text-sm font-semibold text-text-primary dark:text-white mb-1.5"
                >
                  WhatsApp
                </label>
                <input
                  id="enroll-whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  placeholder="+57 300 123 4567"
                  className={inputClasses}
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl disabled:opacity-60 cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Apartar mi cupo"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
