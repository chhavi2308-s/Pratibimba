import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ActiveFilterChips, type ActiveFilter } from "./active-filter-chips";

interface FilterToolbarProps {
  children?: ReactNode;
  search?: { value: string; onChange: (value: string) => void; placeholder: string };
  filters: ActiveFilter[];
  onClearAll: () => void;
  resultCount: number;
  resultLabel?: string;
  label?: string;
}

export function FilterToolbar({ children, search, filters, onClearAll, resultCount, resultLabel = "results", label = "Filter results" }: FilterToolbarProps) {
  return <section aria-label={label} className="min-w-0 space-y-3 rounded-2xl border border-outline-variant/20 bg-white p-3 shadow-sm sm:p-4">
    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
      {search && <div className="relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" aria-hidden="true" />
        <Input aria-label={search.placeholder} placeholder={search.placeholder} value={search.value} onChange={event => search.onChange(event.target.value)}
          className="h-11 rounded-xl border-outline-variant/40 bg-surface-container-lowest pl-9 pr-11 text-on-surface placeholder:text-on-surface-variant/60 focus-visible:ring-primary" />
        {search.value && <button type="button" aria-label="Clear search" onClick={() => search.onChange("")}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>}
      </div>}
      {children}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
      <span className="inline-flex items-center gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        {filters.length ? `${filters.length} active filter${filters.length === 1 ? "" : "s"}` : "No active filters"}
      </span>
      <div className="flex items-center gap-3">
        <span role="status" aria-live="polite">{resultCount} {resultLabel}</span>
        {filters.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={onClearAll}
          className="min-h-9 rounded-lg text-primary hover:bg-primary/5 focus-visible:ring-primary">Clear All</Button>}
      </div>
    </div>
    <ActiveFilterChips filters={filters} />
  </section>;
}
