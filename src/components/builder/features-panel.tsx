import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { featureBlocks, pagerStyles } from './schema'
import type { BuilderState, FeatureId } from './schema'
import { FiltersEditor } from './filters-editor'
import { ExportEditor, RowActionsEditor } from './tools-editor'

// Features grouped by where they show up in the table, so the panel reads
// top to bottom like the table does: controls above it, then the rows, then
// how it is laid out. A feature's settings open right under its switch.

const groups: { title: string; hint: string; features: FeatureId[] }[] = [
  {
    title: 'Toolbar',
    hint: 'Controls above the table',
    features: ['search', 'filters', 'columnVisibility', 'export'],
  },
  {
    title: 'Rows',
    hint: 'What people can do with each row',
    features: ['selection', 'editing', 'rowActions'],
  },
  {
    title: 'Layout',
    hint: 'How the table is arranged',
    features: ['sorting', 'pagination', 'pinning'],
  },
]

const block = Object.fromEntries(featureBlocks.map((f) => [f.id, f]))

export function FeaturesPanel({
  state,
  onChange,
  onOpenColumns,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
  /** Per-column settings (rules, pins) live on the Columns tab */
  onOpenColumns: () => void
}) {
  const on = (id: FeatureId) => state.features.includes(id)
  const toggle = (id: FeatureId) =>
    onChange({
      ...state,
      features: on(id)
        ? state.features.filter((f) => f !== id)
        : [...state.features, id],
    })

  const settings: Partial<Record<FeatureId, ReactNode>> = {
    filters: <FiltersEditor state={state} onChange={onChange} />,
    export: <ExportEditor state={state} onChange={onChange} />,
    rowActions: <RowActionsEditor state={state} onChange={onChange} />,
    pagination: <PagerSettings state={state} onChange={onChange} />,
    editing: (
      <ColumnsHint onOpen={onOpenColumns}>
        Every column is editable. Make one read-only or add validation rules in
        its settings.
      </ColumnsHint>
    ),
    pinning: (
      <ColumnsHint onOpen={onOpenColumns}>
        Choose which columns stick to the left or right in their settings.
      </ColumnsHint>
    ),
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.title}
          aria-labelledby={`group-${group.title}`}
          className="space-y-2"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 id={`group-${group.title}`} className="text-sm font-medium">
              {group.title}
            </h3>
            <span className="text-xs text-muted-foreground">{group.hint}</span>
          </div>
          <ul className="divide-y overflow-hidden rounded-lg border bg-background">
            {group.features.map((id) => (
              <li key={id}>
                <FeatureRow
                  id={id}
                  label={block[id].label}
                  hint={block[id].hint}
                  checked={on(id)}
                  onToggle={() => toggle(id)}
                />
                {on(id) && settings[id] ? (
                  <div className="border-t bg-muted/30 px-3 py-3">
                    {settings[id]}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function FeatureRow({
  id,
  label,
  hint,
  checked,
  onToggle,
}: {
  id: FeatureId
  label: string
  hint: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <Label
        htmlFor={`feat-${id}`}
        className="min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 font-normal"
      >
        <span className="text-sm leading-tight">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </Label>
      <Switch id={`feat-${id}`} checked={checked} onCheckedChange={onToggle} />
    </div>
  )
}

function ColumnsHint({
  children,
  onOpen,
}: {
  children: ReactNode
  onOpen: () => void
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{children}</p>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-1 rounded text-xs font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Open column settings
        <ArrowRight className="size-3" />
      </button>
    </div>
  )
}

function PagerSettings({
  state,
  onChange,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">Buttons</span>
        <div
          className="inline-flex rounded-md border bg-background p-0.5"
          role="group"
          aria-label="Pager buttons"
        >
          {pagerStyles.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={state.pager.style === p.value}
              onClick={() =>
                onChange({
                  ...state,
                  pager: { ...state.pager, style: p.value },
                })
              }
              className="h-7 rounded px-3 text-xs text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="pager-size" className="text-sm font-normal">
          Rows per page select
        </Label>
        <Switch
          id="pager-size"
          checked={state.pager.sizeSelect}
          onCheckedChange={(sizeSelect) =>
            onChange({ ...state, pager: { ...state.pager, sizeSelect } })
          }
        />
      </div>
    </div>
  )
}
