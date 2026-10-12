import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Hash,
  List,
  Plus,
  SquareCheck,
  Trash2,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  MAX_COLUMNS,
  MAX_NAME_LENGTH,
  addColumn,
  changeColumnType,
  columnTypes,
  moveColumn,
  removeColumn,
  renameColumn,
  setColumnOptions,
} from './schema'
import type { BuilderState, ColumnType } from './schema'

const typeIcon: Record<ColumnType, LucideIcon> = {
  text: Type,
  number: Hash,
  select: List,
  date: Calendar,
  checkbox: SquareCheck,
}

export function SchemaEditor({
  state,
  onChange,
}: {
  state: BuilderState
  onChange: (state: BuilderState) => void
}) {
  const { columns } = state

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Columns</legend>
      {columns.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          No columns yet. Add one to start building.
        </p>
      ) : null}
      <ul className="space-y-2">
        {columns.map((column, index) => {
          const Icon = typeIcon[column.type]
          return (
            <li
              key={column.id}
              className="flex flex-wrap items-center gap-2 rounded-md border bg-background p-2"
            >
              <Select
                value={column.type}
                onValueChange={(type) =>
                  onChange(
                    changeColumnType(state, column.id, type as ColumnType),
                  )
                }
              >
                <SelectTrigger
                  className="w-36"
                  aria-label={`Type of ${column.name}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {columnTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={column.name}
                maxLength={MAX_NAME_LENGTH}
                aria-label={`Name of column ${index + 1}`}
                onChange={(e) =>
                  onChange(renameColumn(state, column.id, e.target.value))
                }
                className="min-w-40 flex-1"
              />
              {column.type === 'select' ? (
                <OptionsInput
                  value={column.options ?? []}
                  label={`Options for ${column.name}`}
                  onCommit={(options) =>
                    onChange(setColumnOptions(state, column.id, options))
                  }
                />
              ) : null}
              <div className="ml-auto flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${column.name} up`}
                  disabled={index === 0}
                  onClick={() => onChange(moveColumn(state, column.id, -1))}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${column.name} down`}
                  disabled={index === columns.length - 1}
                  onClick={() => onChange(moveColumn(state, column.id, 1))}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${column.name}`}
                  onClick={() => onChange(removeColumn(state, column.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={columns.length >= MAX_COLUMNS}
        onClick={() => onChange(addColumn(state))}
      >
        <Plus className="h-4 w-4" />
        New column
      </Button>
    </fieldset>
  )
}

// Options are typed as "a, b, c". Committing on blur (not per keystroke) keeps
// a half-typed comma from deleting an option the user is still editing.
function OptionsInput({
  value,
  label,
  onCommit,
}: {
  value: string[]
  label: string
  onCommit: (options: string[]) => void
}) {
  return (
    <Input
      key={value.join('\u0000')}
      defaultValue={value.join(', ')}
      aria-label={label}
      placeholder="Option 1, Option 2"
      onBlur={(e) => onCommit(e.target.value.split(','))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      className="min-w-48 flex-1"
    />
  )
}
