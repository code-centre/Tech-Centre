"use client";

type AgentesEvent =
  | "view_hero"
  | "scroll_50"
  | "scroll_90"
  | "open_week_accordion"
  | "click_cta_diagnostico"
  | "click_cta_clase_demo"
  | "open_faq"
  | "click_whatsapp"
  | "submit_calendly";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Dispara eventos de analítica del programa avanzado (gtag si está disponible). */
export function trackAgentes(
  event: AgentesEvent,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, {
      program: "ingenieria_de_agentes",
      ...params,
    });
  } catch {
    // silencioso: la analítica no debe romper la UI
  }
}
