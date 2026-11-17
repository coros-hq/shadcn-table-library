import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { fields } from './schema'
import type { FieldId } from './schema'
import type { Mapping } from './review'

const SKIP = '__skip'

/** A column header: the CSV's own name, and the field it is imported into */
export function MappingSelect({
  header,
  column,
  mapping,
  onChange,
}: {
  header: string
  column: number
  mapping: Mapping
  onChange: (field: FieldId | null) => void
}) {
  const value = mapping[column]
  return (
    <div className="flex min-w-36 flex-col gap-1 py-2">
      <span
        className={cn(
          'truncate text-xs font-normal',
          value ? 'text-muted-foreground' : 'text-muted-foreground/70',
        )}
        title={header}
      >
        {header}
      </span>
      <Select
        value={value ?? SKIP}
        onValueChange={(v) => onChange(v === SKIP ? null : (v as FieldId))}
      >
        <SelectTrigger
          size="sm"
          aria-label={`Import column "${header}" as`}
          className={cn(
            'w-full bg-background font-medium',
            !value && 'border-dashed font-normal text-muted-foreground',
          )}
        >
          {/* Explicit text, so the hints inside the items stay out of the trigger */}
          <SelectValue>
            {value ? fields.find((f) => f.id === value)?.label : "Don't import"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {fields.map((field) => {
            const elsewhere = mapping.findIndex(
              (f, i) => f === field.id && i !== column,
            )
            return (
              <SelectItem key={field.id} value={field.id}>
                {field.label}
                {field.required ? (
                  <span className="text-muted-foreground">required</span>
                ) : null}
                {elsewhere >= 0 ? (
                  <span className="text-muted-foreground">· moves here</span>
                ) : null}
              </SelectItem>
            )
          })}
          <SelectSeparator />
          <SelectItem value={SKIP}>Don't import</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
