interface HonestyCalloutProps {
  children: string;
}

/** Caja con borde ámbar para el costo real de tiempo. */
export default function HonestyCallout({ children }: HonestyCalloutProps) {
  return (
    <aside className="agentes-honesty" aria-label="Costo de tiempo">
      <p>{children}</p>
    </aside>
  );
}
