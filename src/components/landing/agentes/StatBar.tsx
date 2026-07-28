import { AGENTES_STAT_BAR } from "./data";

/** Barra de cuatro datos en mono bajo el hero. */
export default function StatBar() {
  return (
    <ul className="agentes-statbar" aria-label="Datos del programa">
      {AGENTES_STAT_BAR.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
