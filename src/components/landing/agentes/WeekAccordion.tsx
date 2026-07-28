"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AGENTES_DEMO_DAY, AGENTES_WEEKS, type WeekContent } from "./data";
import { trackAgentes } from "./track";

function WeekPanel({ week }: { week: WeekContent }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) trackAgentes("open_week_accordion", { week: week.n });
  };

  return (
    <li className="agentes-week">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="agentes-week-trigger"
      >
        <span className="agentes-week-n">SEM {week.n}</span>
        <span className="agentes-week-title">
          {week.title}
          {week.subtitle ? (
            <span className="agentes-week-sub"> {week.subtitle}</span>
          ) : null}
        </span>
        <ChevronDown
          className={`agentes-week-chevron ${open ? "is-open" : ""}`}
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
            <div className="agentes-week-body">
              <p>
                <strong>Objetivo.</strong> {week.objective}
              </p>
              <p>
                <strong>En casa.</strong> {week.home}
              </p>
              <p>
                <strong>Presencial.</strong> {week.live}
              </p>
              <p className="agentes-week-stack">{week.stack}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Acordeón de 8 semanas + fila Demo Day. */
export default function WeekAccordion() {
  return (
    <div>
      <ul className="flex flex-col gap-2">
        {AGENTES_WEEKS.map((week) => (
          <WeekPanel key={week.n} week={week} />
        ))}
      </ul>
      <p className="agentes-demo-day" role="note">
        {AGENTES_DEMO_DAY}
      </p>
    </div>
  );
}
