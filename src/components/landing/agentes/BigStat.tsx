"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface BigStatProps {
  value: string;
  numeric: number | null;
  suffix: string;
  label: string;
  source: string;
  sourceUrl?: string;
}

/** Cifra grande con explicación y fuente accesible. */
export default function BigStat({
  value,
  numeric,
  suffix,
  label,
  source,
  sourceUrl,
}: BigStatProps) {
  const tipId = useId();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(numeric === null ? value : `0${suffix}`);

  useEffect(() => {
    if (!inView || numeric === null) {
      if (inView) setDisplay(value);
      return;
    }
    if (reduce) {
      setDisplay(`${numeric}${suffix}`);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(`${Math.round(eased * numeric)}${suffix}`);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric, suffix, value, reduce]);

  return (
    <article ref={ref} className="agentes-bigstat">
      <p className="agentes-bigstat-value" aria-label={value}>
        {display}
      </p>
      <p className="agentes-bigstat-label">{label}</p>
      <p className="agentes-bigstat-source">
        <button
          type="button"
          className="agentes-source-btn"
          aria-describedby={tipId}
          title={source}
        >
          Fuente
        </button>
        <span id={tipId} role="tooltip" className="agentes-source-tip">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              {source}
            </a>
          ) : (
            source
          )}
        </span>
      </p>
    </article>
  );
}
