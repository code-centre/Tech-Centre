import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "../Reveal";
import { AGENTES_INSTRUCTOR } from "./data";

/** Quién enseña y qué se ve en el diagnóstico. */
export default function InstructorBio() {
  return (
    <section className="agentes-section agentes-section-deep" aria-labelledby="instructor-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 id="instructor-title" className="agentes-section-title">
            Con quién hablas
          </h2>
        </Reveal>
        <Reveal delay={0.04}>
          <article className="agentes-instructor mt-10">
            <p className="agentes-mono-label">Instructor</p>
            <h3 className="agentes-instructor-name">{AGENTES_INSTRUCTOR.name}</h3>
            <p className="agentes-instructor-role">{AGENTES_INSTRUCTOR.role}</p>
            <p className="agentes-instructor-body">{AGENTES_INSTRUCTOR.body}</p>
            <p className="agentes-mono-label mt-8">Qué vemos en el diagnóstico</p>
            <ul className="agentes-instructor-list">
              {AGENTES_INSTRUCTOR.diagnosticSees.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link
              href={AGENTES_INSTRUCTOR.href}
              target="_blank"
              rel="noopener noreferrer"
              className="agentes-text-link mt-6 inline-flex items-center gap-1"
            >
              anuarharb.com
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
