"use client";

import { useEffect, useRef } from "react";
import { trackAgentes } from "./track";

/** Instrumenta view_hero y umbrales de scroll. */
export default function AgentesAnalytics() {
  const fired = useRef({ hero: false, s50: false, s90: false });

  useEffect(() => {
    if (!fired.current.hero) {
      fired.current.hero = true;
      trackAgentes("view_hero");
    }

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const ratio = window.scrollY / max;
      if (!fired.current.s50 && ratio >= 0.5) {
        fired.current.s50 = true;
        trackAgentes("scroll_50");
      }
      if (!fired.current.s90 && ratio >= 0.9) {
        fired.current.s90 = true;
        trackAgentes("scroll_90");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
