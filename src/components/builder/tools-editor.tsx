import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  MAX_FILENAME_LENGTH,
  defaultState,
  exportFormats,
  rowActionOptions,
  setExport,
  toggleRowAction,
} from './schema'
import type { BuilderState } from './schema'

function Option({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
}) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 text-sm font-normal has-disabled:cursor-not-allowed"
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
      {label}
    </Label>
  )
}

export function RowActionsEditor({
  state,
  onChange,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Row actions</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {rowActionOptions.map((action) => (
          <Option
            key={action.value}
            id={`action-${action.value}`}
            label={action.label}
            checked={state.actions.includes(action.value)}
            onChange={() => onChange(toggleRowAction(state, action.value))}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {state.actions.length === 0
          ? 'Pick at least one action to add the row menu.'
          : 'Duplicate and Delete change the rows in the table. Hook them up to your API in data-table.tsx.'}
      </p>
    </fieldset>
  )
}

export function ExportEditor({
  state,
  onChange,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
}) {
  const { formats } = state.exporting

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Export</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {exportFormats.map((format) => {
          const on = formats.includes(format.value)
          return (
            <Option
              key={format.value}
              id={`export-${format.value}`}
              label={format.label}
              checked={on}
              // The last format can't be turned off: an empty menu is a dead button
              disabled={on && formats.length === 1}
              onChange={() =>
                onChange(
                  setExport(state, {
                    formats: on
                      ? formats.filter((f) => f !== format.value)
                      : [...formats, format.value],
                  }),
                )
              }
            />
          )
        })}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="export-filename" className="text-xs font-normal">
          File name
        </Label>
        <Input
          id="export-filename"
          value={state.exporting.filename}
          maxLength={MAX_FILENAME_LENGTH}
          placeholder={defaultState.exporting.filename}
          onChange={(e) =>
            onChange(setExport(state, { filename: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Exports the selected rows if there are any, otherwise every row that
          matches the search and filters. Hidden columns are left out.
        </p>
      </div>
    </fieldset>
  )
}
