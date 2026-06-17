"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FaqItem } from "./data";

interface FaqAccordionProps {
  items: FaqItem[];
  groupByCategory?: boolean;
}

function AccordionRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <li className="lv2-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-[var(--paper)]">{item.q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--mint)] transition-transform duration-300 ${
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
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 leading-relaxed lv2-soft">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function FaqAccordion({ items, groupByCategory = false }: FaqAccordionProps) {
  if (!groupByCategory) {
    return (
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <AccordionRow key={item.q} item={item} />
        ))}
      </ul>
    );
  }

  const categories = Array.from(new Set(items.map((i) => i.category)));
  return (
    <div className="flex flex-col gap-10">
      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="lv2-mono mb-4">{cat}</h2>
          <ul className="flex flex-col gap-3">
            {items
              .filter((i) => i.category === cat)
              .map((item) => (
                <AccordionRow key={item.q} item={item} />
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
