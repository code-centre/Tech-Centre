interface BlogEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** Eyebrow con línea de acento, legible en modo claro y oscuro (usa --primary). */
export default function BlogEyebrow({ children, className = "" }: BlogEyebrowProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className="h-px w-8 bg-primary" />
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        {children}
      </span>
    </span>
  );
}
