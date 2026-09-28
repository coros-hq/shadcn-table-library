'use client'

import { useId } from 'react'
import { Download } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils.ts'
import { regions, statuses } from './columns'
import { datePresets } from './export-config'
import type { DatePreset, ExportConfig, ExportFormat } from './export-config'

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
  getLabel = (value) => value,
}: {
  label: string
  options: readonly T[]
  selected: T[]
  onChange: (next: T[]) => void
  getLabel?: (value: T) => string
}) {
  const id = useId()
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = selected.includes(option)
          return (
            <Label
              key={option}
              htmlFor={`${id}-${option}`}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm font-normal transition-colors',
                checked
                  ? 'border-foreground/25 bg-muted/60'
                  : 'text-muted-foreground',
              )}
            >
              <Checkbox
                id={`${id}-${option}`}
                checked={checked}
                onCheckedChange={() => onChange(toggle(selected, option))}
              />
              {getLabel(option)}
            </Label>
          )
        })}
      </div>
    </fieldset>
  )
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: { id: string; label: string }[]
  config: ExportConfig
  onConfigChange: (config: ExportConfig) => void
  onReset: () => void
  onExport: () => void
  matchCount: number
  total: number
}

export function ExportDialog({
  open,
  onOpenChange,
  columns,
  config,
  onConfigChange,
  onReset,
  onExport,
  matchCount,
  total,
}: ExportDialogProps) {
  const set = <TKey extends keyof ExportConfig>(
    key: TKey,
    value: ExportConfig[TKey],
  ) => onConfigChange({ ...config, [key]: value })

  const labels = Object.fromEntries(columns.map((c) => [c.id, c.label]))
  const canExport = matchCount > 0 && config.columns.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export orders</DialogTitle>
          <DialogDescription>
            Choose which orders and columns to include. The table itself stays
            unfiltered.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60svh] space-y-5 overflow-y-auto py-1">
          <CheckboxGroup
            label="Status"
            options={statuses}
            selected={config.statuses}
            onChange={(next) => set('statuses', next)}
          />
          <CheckboxGroup
            label="Region"
            options={regions}
            selected={config.regions}
            onChange={(next) => set('regions', next)}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Date</p>
            <Select
              value={config.datePreset}
              onValueChange={(value) => set('datePreset', value as DatePreset)}
            >
              <SelectTrigger className="w-44" aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(datePresets).map(([value, preset]) => (
                  <SelectItem key={value} value={value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CheckboxGroup
            label="Columns"
            options={columns.map((c) => c.id)}
            selected={config.columns}
            onChange={(next) =>
              // Keep the table's column order, whatever order they were ticked in
              set(
                'columns',
                columns.map((c) => c.id).filter((id) => next.includes(id)),
              )
            }
            getLabel={(id) => labels[id] ?? id}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Format</legend>
            <div className="inline-flex rounded-md border p-0.5">
              {(['csv', 'excel'] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  type="button"
                  aria-pressed={config.format === format}
                  onClick={() => set('format', format)}
                  className={cn(
                    'rounded-sm px-3 py-1 text-sm transition-colors',
                    config.format === format
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {format === 'csv' ? 'CSV' : 'Excel'}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground tabular-nums">
              {matchCount} of {total}
            </span>{' '}
            rows will be exported
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onReset}>
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={!canExport} onClick={onExport}>
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
