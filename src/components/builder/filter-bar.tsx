'use client'

import { ListFilter, Plus, X } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { needsValue, operators } from './filters'
import type { Field, FilterRule } from './filters'

interface FilterBarProps {
  fields: Field[]
  rules: FilterRule[]
  onChange: (rules: FilterRule[]) => void
}

function ValueInput({
  field,
  rule,
  onChange,
}: {
  field: Field
  rule: FilterRule
  onChange: (value: string) => void
}) {
  if (!needsValue(field.type, rule.op)) return <div className="w-36" />

  if (field.type === 'select') {
    return (
      <Select value={rule.value} onValueChange={onChange}>
        <SelectTrigger className="w-36" aria-label="Filter value">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      type={
        field.type === 'number'
          ? 'number'
          : field.type === 'date'
            ? 'date'
            : 'text'
      }
      value={rule.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
      aria-label="Filter value"
      className="w-36"
    />
  )
}

export function FilterBar({ fields, rules, onChange }: FilterBarProps) {
  function update(index: number, patch: Partial<FilterRule>) {
    onChange(
      rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
    )
  }

  function add() {
    if (fields.length === 0) return
    const field = fields[0]
    onChange([
      ...rules,
      { fieldId: field.id, op: operators[field.type][0].op, value: '' },
    ])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <ListFilter className="h-4 w-4" />
          Filter
          {rules.length > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {rules.length}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] space-y-3 p-3"
      >
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No filters yet. Rows must match every filter you add.
          </p>
        ) : null}
        {rules.map((rule, index) => {
          const field = fields.find((f) => f.id === rule.fieldId)
          if (!field) return null
          return (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <Select
                value={rule.fieldId}
                onValueChange={(fieldId) => {
                  const next = fields.find((f) => f.id === fieldId)
                  if (!next) return
                  update(index, {
                    fieldId,
                    op: operators[next.type][0].op,
                    value: '',
                  })
                }}
              >
                <SelectTrigger className="w-36" aria-label="Filter column">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={rule.op}
                onValueChange={(op) =>
                  update(index, { op: op as FilterRule['op'] })
                }
              >
                <SelectTrigger className="w-36" aria-label="Filter operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators[field.type].map((o) => (
                    <SelectItem key={o.op} value={o.op}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ValueInput
                field={field}
                rule={rule}
                onChange={(value) => update(index, { value })}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove filter"
                onClick={() => onChange(rules.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={add}
          disabled={fields.length === 0}
        >
          <Plus className="h-4 w-4" />
          Add filter
        </Button>
      </PopoverContent>
    </Popover>
  )
}
