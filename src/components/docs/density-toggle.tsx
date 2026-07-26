import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import type { Density } from './density'

interface DensityToggleProps {
  value: Density
  onChange: (density: Density) => void
}

export function DensityToggle({ value, onChange }: DensityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Density</span>
      <Select value={value} onValueChange={(v) => onChange(v as Density)}>
        <SelectTrigger className="h-8 w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="compact">Compact</SelectItem>
          <SelectItem value="comfortable">Comfortable</SelectItem>
          <SelectItem value="spacious">Spacious</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
