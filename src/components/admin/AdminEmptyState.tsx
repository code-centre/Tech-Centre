import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actions,
}: AdminEmptyStateProps) {
  return (
    <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-11 text-center shadow-lg">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h2 className="mt-4.5 text-lg font-semibold text-text-primary">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      {actions && (
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">{actions}</div>
      )}
    </section>
  );
}
