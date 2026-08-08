import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import type { ActiveFilter } from "./type";
import { Button } from "../ui/button";
import { format } from "date-fns";

export function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onRemove: (columnId: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <Badge key={f.columnId} variant="secondary" className="gap-1 pr-1">
          {formatFilterLabel(f)}
          <button onClick={() => onRemove(f.columnId)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}

function formatFilterLabel(f: ActiveFilter) {
  if (f.type === "dateRange") {
    return `${f.columnId}: ${f.from ? format(f.from, "MMM d") : "?"} - ${f.to ? format(f.to, "MMM d") : "?"}`;
  }
  return `${f.columnId}: ${f.values.join(", ")}`;
}
