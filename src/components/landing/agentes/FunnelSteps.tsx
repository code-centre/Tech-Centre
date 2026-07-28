const STEPS = [
  { n: "1", label: "Diagnóstico", detail: "20 minutos, sin examen" },
  { n: "2", label: "Cupo", detail: "Si el nivel y el ritmo encajan" },
  { n: "3", label: "Pago", detail: "Solo después de validar" },
] as const;

/** Embudo visual: diagnóstico → cupo → pago. */
export default function FunnelSteps() {
  return (
    <ol className="agentes-funnel" aria-label="Cómo funciona la inscripción">
      {STEPS.map((step, i) => (
        <li key={step.n}>
          <span className="agentes-funnel-n" aria-hidden="true">
            {step.n}
          </span>
          <span className="agentes-funnel-label">{step.label}</span>
          <span className="agentes-funnel-detail">{step.detail}</span>
          {i < STEPS.length - 1 ? (
            <span className="agentes-funnel-arrow" aria-hidden="true">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
