import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  MAX_MESSAGE_LENGTH,
  SKELETON_ROWS,
  loadingStyles,
  setStates,
} from './schema'
import type { BuilderState } from './schema'

export type PreviewView = 'data' | 'loading' | 'empty'

export function StatesEditor({
  state,
  onChange,
  onPreview,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
  /** Switches the preview to the state being edited */
  onPreview: (view: PreviewView) => void
}) {
  const { states } = state

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium">Empty & loading</legend>

      <div className="space-y-1.5">
        <Label htmlFor="empty-title" className="text-xs font-normal">
          Empty message
        </Label>
        <Input
          id="empty-title"
          value={states.emptyTitle}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="No results"
          onFocus={() => onPreview('empty')}
          onChange={(e) =>
            onChange(setStates(state, { emptyTitle: e.target.value }))
          }
        />
        <Input
          aria-label="Empty description"
          value={states.emptyDescription}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Description (optional)"
          onFocus={() => onPreview('empty')}
          onChange={(e) =>
            onChange(setStates(state, { emptyDescription: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Shown when there are no rows or nothing matches.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">Loading</span>
          <div className="inline-flex rounded-md border p-0.5">
            {loadingStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                aria-pressed={states.loadingStyle === style.value}
                onClick={() => {
                  onChange(setStates(state, { loadingStyle: style.value }))
                  onPreview('loading')
                }}
                className="h-7 rounded px-3 text-xs text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
        {states.loadingStyle === 'skeleton' ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">Placeholder rows</span>
            <Select
              value={String(states.loadingRows)}
              onValueChange={(value) => {
                onChange(setStates(state, { loadingRows: Number(value) }))
                onPreview('loading')
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-20 shadow-none"
                aria-label="Placeholder rows"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKELETON_ROWS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <Input
          aria-label="Loading message"
          value={states.loadingMessage}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Loading..."
          onFocus={() => onPreview('loading')}
          onChange={(e) =>
            onChange(setStates(state, { loadingMessage: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          {states.loadingStyle === 'spinner'
            ? 'Shown next to the spinner.'
            : 'Read out to screen readers while rows load.'}
        </p>
      </div>
    </fieldset>
  )
}
