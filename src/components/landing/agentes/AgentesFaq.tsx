"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AGENTES_FAQS } from "./data";
import { trackAgentes } from "./track";

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) trackAgentes("open_faq", { question: q });
  };

  return (
    <li className="agentes-faq-item">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="agentes-faq-trigger"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--accent-advanced)] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? undefined : { height: 0, opacity: 0 }}
            animate={reduce ? undefined : { height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="agentes-faq-answer">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function AgentesFaq() {
  return (
    <ul className="flex flex-col gap-3">
      {AGENTES_FAQS.map((item) => (
        <FaqRow key={item.q} q={item.q} a={item.a} />
      ))}
    </ul>
  );
}
