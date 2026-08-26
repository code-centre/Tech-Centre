import { RUTAS_COHORTE } from "./rutas/data";

interface CohorteBadgeProps {
  className?: string;
}

/**
 * Chip de cohorte: fecha de inicio y cupos.
 * Muestra escasez solo si RUTAS_COHORTE.seatsLeft tiene un número.
 */
export default function CohorteBadge({ className = "" }: CohorteBadgeProps) {
  const { startDate, seatsTotal, seatsLeft } = RUTAS_COHORTE;

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border border-[rgba(63,224,160,0.35)] bg-[rgba(63,224,160,0.08)] px-4 py-2 ${className}`}
    >
      <span className="lv2-dot" aria-hidden="true" />
      <span className="font-[family-name:var(--mono)] text-xs text-[var(--paper)]">
        Próxima cohorte{" "}
        <strong className="font-bold text-[var(--mint)]">{startDate}</strong>
        {typeof seatsLeft === "number" ? (
          <>
            {" · quedan "}
            <strong className="font-bold text-[var(--mint)]">{seatsLeft}</strong>
            {` de ${seatsTotal} cupos`}
          </>
        ) : (
          ` · ${seatsTotal} cupos por grupo`
        )}
      </span>
    </span>
  );
}
