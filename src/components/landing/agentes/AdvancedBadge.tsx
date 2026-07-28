interface AdvancedBadgeProps {
  children?: string;
  className?: string;
}

/** Etiqueta ámbar de programa avanzado con requisito. */
export default function AdvancedBadge({
  children = "PROGRAMA AVANZADO · REQUIERE SABER PROGRAMAR",
  className = "",
}: AdvancedBadgeProps) {
  return (
    <p className={`agentes-badge ${className}`.trim()}>{children}</p>
  );
}
