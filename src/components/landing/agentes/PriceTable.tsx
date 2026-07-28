import FunnelSteps from "./FunnelSteps";
import { AGENTES_PRICING } from "./data";

/** Tabla de precios con embudo y qué incluye. */
export default function PriceTable() {
  const rows = [
    { label: AGENTES_PRICING.list.label, detail: null as string | null, amount: AGENTES_PRICING.list.amount },
    {
      label: AGENTES_PRICING.early.label,
      detail: AGENTES_PRICING.early.detail,
      amount: AGENTES_PRICING.early.amount,
      highlight: true,
    },
    {
      label: AGENTES_PRICING.alumni.label,
      detail: null,
      amount: AGENTES_PRICING.alumni.amount,
    },
    {
      label: AGENTES_PRICING.reserve.label,
      detail: null,
      amount: AGENTES_PRICING.reserve.amount,
    },
  ];

  return (
    <div className="agentes-price-wrap">
      <FunnelSteps />
      <div className="agentes-price">
        <table>
          <caption className="sr-only">Inversión del programa</caption>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.highlight ? "is-highlight" : undefined}>
                <th scope="row">
                  <span>{row.label}</span>
                  {row.detail ? <span className="agentes-price-detail">{row.detail}</span> : null}
                </th>
                <td>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="agentes-price-includes">
          <p className="agentes-mono-label">Qué incluye el precio</p>
          <ul>
            {AGENTES_PRICING.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="agentes-price-installments">{AGENTES_PRICING.installments}</p>
        <p className="agentes-price-note">{AGENTES_PRICING.note}</p>
      </div>
    </div>
  );
}
