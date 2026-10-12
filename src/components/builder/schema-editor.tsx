import {
  Calendar,
  GripVertical,
  Hash,
  List,
  Plus,
  SquareCheck,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  MAX_OPTIONS,
  addColumn,
  changeColumnType,
  columnTypes,
  removeColumn,
  renameColumn,
  reorderColumn,
  setColumnOptions,
} from './schema'
import type { BuilderState, ColumnSpec, ColumnType } from './schema'

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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      onChange(reorderColumn(state, String(active.id), String(over.id)))
    }
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Columns</legend>
      {columns.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          No columns yet. Add one to start building.
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {columns.map((column, index) => (
              <ColumnRow
                key={column.id}
                column={column}
                index={index}
                state={state}
                onChange={onChange}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
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

function ColumnRow({
  column,
  index,
  state,
  onChange,
}: {
  column: ColumnSpec
  index: number
  state: BuilderState
  onChange: (state: BuilderState) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })
  const Icon = typeIcon[column.type]

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`space-y-2 rounded-md border bg-background p-2 ${
        isDragging ? 'relative z-10 shadow-md' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-8 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Drag to reorder ${column.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <Select
          value={column.type}
          onValueChange={(type) =>
            onChange(changeColumnType(state, column.id, type as ColumnType))
          }
        >
          <SelectTrigger
            className="w-36 shrink-0"
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
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={`Remove ${column.name}`}
          onClick={() => onChange(removeColumn(state, column.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {column.type === 'select' ? (
        <div className="pl-10">
          <OptionsList
            value={column.options ?? []}
            label={`Options for ${column.name}`}
            onCommit={(options) =>
              onChange(setColumnOptions(state, column.id, options))
            }
          />
        </div>
      ) : null}
    </li>
  )
}

// Options are edited as a list. Rows are kept in local state so an empty or
// duplicate row being typed isn't dropped by setColumnOptions' cleanup; the
// cleaned list is committed on blur and on add/remove.
function OptionsList({
  value,
  label,
  onCommit,
}: {
  value: string[]
  label: string
  onCommit: (options: string[]) => void
}) {
  const [rows, setRows] = useState(value)
  const [prev, setPrev] = useState(value)
  if (prev !== value && prev.join('\u0000') !== value.join('\u0000')) {
    setPrev(value)
    setRows(value)
  }

  const update = (next: string[], commit: boolean) => {
    setRows(next)
    if (commit) onCommit(next)
  }

  return (
    <div className="w-full space-y-1.5 pl-1" role="group" aria-label={label}>
      {rows.map((option, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
          <Input
            value={option}
            aria-label={`Option ${i + 1}`}
            placeholder={`Option ${i + 1}`}
            onChange={(e) =>
              update(
                rows.map((r, j) => (j === i ? e.target.value : r)),
                false,
              )
            }
            onBlur={() => onCommit(rows)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
            className="h-8 flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Remove option ${i + 1}`}
            onClick={() =>
              update(
                rows.filter((_, j) => j !== i),
                true,
              )
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={rows.length >= MAX_OPTIONS}
        onClick={() => setRows([...rows, ''])}
      >
        <Plus className="h-4 w-4" />
        Add option
      </Button>
    </div>
  )
}
