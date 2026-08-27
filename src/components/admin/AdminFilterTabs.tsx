interface AdminFilterTab {
  value: string;
  label: string;
  count?: number;
}

interface AdminFilterTabsProps {
  tabs: AdminFilterTab[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export default function AdminFilterTabs({
  tabs,
  value,
  onChange,
  ariaLabel = 'Filtrar',
}: AdminFilterTabsProps) {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto rounded-[10px] border border-border-color bg-[var(--card-background)] p-1"
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-secondary/30 bg-secondary/10 text-text-secondary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  isActive ? 'bg-secondary/20' : 'bg-text-muted/15'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
