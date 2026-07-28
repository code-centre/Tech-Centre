import Link from "next/link";
import { Check, X } from "lucide-react";
import Reveal from "../Reveal";
import { AGENTES_FIT } from "./data";

/** Dos columnas: es para ti / todavía no. */
export default function FitColumns() {
  const careersExternal = AGENTES_FIT.careersHref.startsWith("http");

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal>
          <section className="agentes-fit-card" aria-labelledby="fit-yes">
            <h3 id="fit-yes" className="agentes-fit-title agentes-fit-title-yes">
              {AGENTES_FIT.yesTitle}
            </h3>
            <ul className="agentes-fit-list">
              {AGENTES_FIT.yes.map((item) => (
                <li key={item}>
                  <Check className="agentes-fit-icon agentes-fit-icon-yes" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
        <Reveal delay={0.04}>
          <section className="agentes-fit-card agentes-fit-card-no" aria-labelledby="fit-no">
            <h3 id="fit-no" className="agentes-fit-title agentes-fit-title-no">
              {AGENTES_FIT.noTitle}
            </h3>
            <ul className="agentes-fit-list">
              {AGENTES_FIT.no.map((item) => (
                <li key={item}>
                  <X className="agentes-fit-icon agentes-fit-icon-no" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="agentes-fit-closing">
              {AGENTES_FIT.noClosing}{" "}
              {careersExternal ? (
                <a
                  href={AGENTES_FIT.careersHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agentes-mint-link"
                >
                  {AGENTES_FIT.careersLabel}
                </a>
              ) : (
                <Link href={AGENTES_FIT.careersHref} className="agentes-mint-link">
                  {AGENTES_FIT.careersLabel}
                </Link>
              )}
            </p>
          </section>
        </Reveal>
      </div>
      <Reveal delay={0.08}>
        <p className="agentes-needs-note mt-8">{AGENTES_FIT.pythonNote}</p>
      </Reveal>
    </div>
  );
}
