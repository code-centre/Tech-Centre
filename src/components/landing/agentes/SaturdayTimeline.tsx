import { AGENTES_HYBRID } from "./data";

/** Línea de tiempo horizontal de los bloques del sábado. */
export default function SaturdayTimeline() {
  return (
    <ol className="agentes-timeline" aria-label="Bloques del sábado">
      {AGENTES_HYBRID.timeline.map((block) => (
        <li key={block.time}>
          <span className="agentes-timeline-time">{block.time}</span>
          <span className="agentes-timeline-label">{block.label}</span>
        </li>
      ))}
    </ol>
  );
}
