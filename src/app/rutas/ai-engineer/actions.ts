"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface RouteLeadData {
  name: string;
  email: string;
  whatsapp: string;
  intent: string;
  message?: string;
  company?: string;
  routeName: string;
  moduleName?: string | null;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

function mapIntentToStage(intent: string): string {
  const mapping: Record<string, string> = {
    "Quiero inscribirme en la ruta completa": "apartar",
    "Quiero inscribirme en un módulo individual": "apartar",
    "Quiero resolver dudas antes de pagar": "dudas",
    "Quiero conocer opciones de pago": "pagos",
  };
  return mapping[intent] || "apartar";
}

export async function createRouteLead(
  formData: RouteLeadData,
): Promise<ActionResult> {
  try {
    if (formData.company && formData.company.trim() !== "") {
      return { success: true, message: "Registro exitoso" };
    }

    if (!formData.name?.trim()) {
      return { success: false, error: "El nombre es requerido" };
    }
    if (!formData.email?.trim()) {
      return { success: false, error: "El correo es requerido" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { success: false, error: "Correo no válido" };
    }
    if (!formData.whatsapp?.trim()) {
      return { success: false, error: "El WhatsApp es requerido" };
    }
    const phoneDigits = formData.whatsapp.replace(/\D/g, "");
    if (phoneDigits.length < 8) {
      return { success: false, error: "WhatsApp debe tener al menos 8 dígitos" };
    }
    if (!formData.intent?.trim()) {
      return { success: false, error: "Selecciona una opción" };
    }

    const supabase = await createClient();
    const headersList = await headers();
    const referrer = headersList.get("referer") || null;

    const stage = mapIntentToStage(formData.intent);

    const notesData = {
      message: formData.message?.trim() || null,
      routeName: formData.routeName,
      moduleName: formData.moduleName || null,
      source_page: "rutas/ai-engineer",
      metadata: {
        referrer,
        submittedAt: new Date().toISOString(),
      },
    };

    const { error } = await supabase
      .from("leads")
      .insert({
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: phoneDigits,
        source: "ruta_ai_engineer",
        stage,
        notes: JSON.stringify(notesData),
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error inserting route lead:", error);
      return {
        success: false,
        error:
          "No pudimos registrar tu cupo. Intenta de nuevo o escríbenos por WhatsApp.",
      };
    }

    return {
      success: true,
      message: "¡Tu cupo ha sido apartado exitosamente!",
    };
  } catch (error) {
    console.error("Unexpected error creating route lead:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
    };
  }
}
