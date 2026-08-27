import { Search } from 'lucide-react';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  className = 'sm:w-[268px]',
  id,
}: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-border-color bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
      />
    </div>
  );
}
