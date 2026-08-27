interface AdminPageSkeletonProps {
  rows?: number;
}

export default function AdminPageSkeleton({ rows = 5 }: AdminPageSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="h-11 w-64 rounded-lg bg-[var(--card-background)] animate-pulse" />
      <div className="h-12 rounded-xl bg-[var(--card-background)] animate-pulse" />
      <div className="rounded-xl border border-border-color bg-[var(--card-background)] p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-bg-secondary animate-pulse" />
        ))}
      </div>
    </div>
  );
}
