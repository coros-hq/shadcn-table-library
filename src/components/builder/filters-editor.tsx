import { Plus, Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { facetKindLabels, facetKinds, needsValue, operators } from './filters'
import type { FacetKind, FilterOp, Preset } from './filters'
import {
  MAX_NAME_LENGTH,
  MAX_PRESETS,
  addFacet,
  addPreset,
  removeFacet,
  removePreset,
  setFacetColumn,
  setFacetKind,
  updatePreset,
} from './schema'
import type { BuilderState, ColumnSpec } from './schema'

const trigger = 'w-full min-w-0 shadow-none'

export function FiltersEditor({
  state,
  onChange,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
}) {
  const { columns, facets, presets } = state
  const usedAll = facets.length >= columns.length

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium">Filters</legend>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Pick the columns to filter by and how each one filters.
        </p>
        {facets.length > 0 ? (
          <ul className="divide-y overflow-hidden rounded-md border bg-background">
            {facets.map((facet, index) => {
              const column = columns.find((c) => c.id === facet.fieldId)
              if (!column) return null
              const kinds = facetKinds[column.type]
              return (
                <li
                  key={facet.fieldId}
                  className="flex items-center gap-1.5 p-1.5"
                >
                  <Select
                    value={facet.fieldId}
                    onValueChange={(id) =>
                      onChange(setFacetColumn(state, index, id))
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      className={trigger}
                      aria-label={`Column for filter ${index + 1}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          disabled={
                            c.id !== facet.fieldId &&
                            facets.some((f) => f.fieldId === c.id)
                          }
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={facet.kind}
                    disabled={kinds.length < 2}
                    onValueChange={(kind) =>
                      onChange(setFacetKind(state, index, kind as FacetKind))
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      className={`${trigger} w-32 shrink-0`}
                      aria-label={`Filter type for ${column.name}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kinds.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {facetKindLabels[kind]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label={`Remove filter on ${column.name}`}
                    onClick={() => onChange(removeFacet(state, index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              )
            })}
          </ul>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shadow-none"
          disabled={usedAll}
          onClick={() => onChange(addFacet(state))}
        >
          <Plus className="h-4 w-4" />
          Add filter
        </Button>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Quick filters are one-click shortcuts with your own label, like “High
          budget”.
        </p>
        {presets.length > 0 ? (
          <ul className="divide-y overflow-hidden rounded-md border bg-background">
            {presets.map((preset) => (
              <PresetRow
                key={preset.id}
                preset={preset}
                columns={columns}
                onChange={(patch) =>
                  onChange(updatePreset(state, preset.id, patch))
                }
                onRemove={() => onChange(removePreset(state, preset.id))}
              />
            ))}
          </ul>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shadow-none"
          disabled={columns.length === 0 || presets.length >= MAX_PRESETS}
          onClick={() => onChange(addPreset(state))}
        >
          <Plus className="h-4 w-4" />
          Add quick filter
        </Button>
      </div>
    </fieldset>
  )
}

function PresetRow({
  preset,
  columns,
  onChange,
  onRemove,
}: {
  preset: Preset
  columns: ColumnSpec[]
  onChange: (patch: { label?: string; rule?: Preset['rule'] }) => void
  onRemove: () => void
}) {
  const { rule } = preset
  const column = columns.find((c) => c.id === rule.fieldId)
  if (!column) return null
  const ops = operators[column.type]
  const hasValue = needsValue(column.type, rule.op)

  return (
    <li className="space-y-1.5 p-1.5">
      <div className="flex items-center gap-1.5">
        <Input
          value={preset.label}
          maxLength={MAX_NAME_LENGTH}
          aria-label="Quick filter label"
          placeholder="Label"
          onChange={(e) => onChange({ label: e.target.value })}
          className="h-8 min-w-0 flex-1 px-2 text-sm shadow-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={`Remove ${preset.label}`}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <Select
          value={rule.fieldId}
          onValueChange={(fieldId) => {
            const next = columns.find((c) => c.id === fieldId)
            if (!next) return
            onChange({
              rule: { fieldId, op: operators[next.type][0].op, value: '' },
            })
          }}
        >
          <SelectTrigger size="sm" className={trigger} aria-label="Column">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={rule.op}
          onValueChange={(op) =>
            onChange({ rule: { ...rule, op: op as FilterOp } })
          }
        >
          <SelectTrigger
            size="sm"
            className={`${trigger} w-32 shrink-0`}
            aria-label="Condition"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ops.map((o) => (
              <SelectItem key={o.op} value={o.op}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasValue ? (
        column.type === 'select' ? (
          <Select
            value={rule.value}
            onValueChange={(value) => onChange({ rule: { ...rule, value } })}
          >
            <SelectTrigger size="sm" className={trigger} aria-label="Value">
              <SelectValue placeholder="Choose a value…" />
            </SelectTrigger>
            <SelectContent>
              {(column.options ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={
              column.type === 'number'
                ? 'number'
                : column.type === 'date'
                  ? 'date'
                  : 'text'
            }
            value={rule.value}
            aria-label="Value"
            placeholder="Value"
            onChange={(e) =>
              onChange({ rule: { ...rule, value: e.target.value } })
            }
            className="h-8 px-2 text-sm shadow-none"
          />
        )
      ) : null}
    </li>
  )
}
