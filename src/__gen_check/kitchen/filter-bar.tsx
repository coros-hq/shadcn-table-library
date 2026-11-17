'use client'

import { ListFilter, X } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { emptyFacet, isFacetActive } from './filters'
import type { FacetDef, FacetValue, Field, Preset } from './filters'

interface FilterBarProps {
  fields: Field[]
  facets: FacetDef[]
  presets: Preset[]
  /** The unfiltered rows; options and their counts are read from here */
  data: Record<string, unknown>[]
  values: Record<string, FacetValue>
  onValuesChange: (values: Record<string, FacetValue>) => void
  activePresets: string[]
  onActivePresetsChange: (ids: string[]) => void
}

const MAX_OPTIONS = 20

function optionsFor(field: Field, data: Record<string, unknown>[]) {
  if (field.type === 'select') return field.options ?? []
  return [...new Set(data.map((row) => String(row[field.id] ?? '')))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, MAX_OPTIONS)
}

function summary(kind: FacetDef['kind'], value: FacetValue) {
  switch (kind) {
    case 'options':
      return value.values.length > 2
        ? `${value.values.length} selected`
        : value.values.join(', ')
    case 'boolean':
      return value.values[0] === 'yes' ? 'Yes' : 'No'
    case 'text':
      return value.text
    case 'range':
    case 'dateRange':
      return `${value.min || '…'} – ${value.max || '…'}`
  }
}

function FacetControl({
  field,
  facet,
  value,
  data,
  onChange,
}: {
  field: Field
  facet: FacetDef
  value: FacetValue
  data: Record<string, unknown>[]
  onChange: (value: FacetValue) => void
}) {
  switch (facet.kind) {
    case 'options': {
      const options = optionsFor(field, data)
      const count = (option: string) =>
        data.filter((row) => String(row[field.id]) === option).length
      return (
        <div className="space-y-1">
          {options.length === 0 ? (
            <p className="px-1 text-sm text-muted-foreground">No options.</p>
          ) : null}
          {options.map((option) => {
            const checked = value.values.includes(option)
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    onChange({
                      ...value,
                      values: checked
                        ? value.values.filter((v) => v !== option)
                        : [...value.values, option],
                    })
                  }
                />
                <span className="flex-1 truncate">{option}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count(option)}
                </span>
              </label>
            )
          })}
        </div>
      )
    }
    case 'boolean':
      return (
        <div className="flex gap-1">
          {(['yes', 'no'] as const).map((choice) => (
            <Button
              key={choice}
              type="button"
              size="sm"
              variant={value.values[0] === choice ? 'secondary' : 'outline'}
              className="flex-1 capitalize"
              onClick={() =>
                onChange({
                  ...value,
                  values: value.values[0] === choice ? [] : [choice],
                })
              }
            >
              {choice}
            </Button>
          ))}
        </div>
      )
    case 'text':
      return (
        <Input
          value={value.text}
          placeholder={`Search ${field.name.toLowerCase()}…`}
          aria-label={`Search ${field.name}`}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      )
    case 'range':
    case 'dateRange': {
      const type = facet.kind === 'range' ? 'number' : 'date'
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type={type}
            value={value.min}
            placeholder="Min"
            aria-label={`${field.name} from`}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
          />
          <Input
            type={type}
            value={value.max}
            placeholder="Max"
            aria-label={`${field.name} to`}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
          />
        </div>
      )
    }
  }
}

export function FilterBar({
  fields,
  facets,
  presets,
  data,
  values,
  onValuesChange,
  activePresets,
  onActivePresetsChange,
}: FilterBarProps) {
  const anyActive =
    activePresets.length > 0 ||
    facets.some((f) => isFacetActive(f.kind, values[f.fieldId]))

  return (
    <>
      {presets.map((preset) => {
        const active = activePresets.includes(preset.id)
        return (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant={active ? 'secondary' : 'outline'}
            aria-pressed={active}
            onClick={() =>
              onActivePresetsChange(
                active
                  ? activePresets.filter((id) => id !== preset.id)
                  : [...activePresets, preset.id],
              )
            }
          >
            {preset.label}
          </Button>
        )
      })}
      {facets.map((facet) => {
        const field = fields.find((f) => f.id === facet.fieldId)
        if (!field) return null
        const value = values[facet.fieldId] ?? emptyFacet
        const active = isFacetActive(facet.kind, value)
        return (
          <Popover key={facet.fieldId}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-dashed">
                <ListFilter className="h-4 w-4" />
                {field.name}
                {active ? (
                  <Badge
                    variant="secondary"
                    className="ml-1 max-w-32 truncate font-normal"
                  >
                    {summary(facet.kind, value)}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 space-y-2 p-2">
              <FacetControl
                field={field}
                facet={facet}
                value={value}
                data={data}
                onChange={(next) =>
                  onValuesChange({ ...values, [facet.fieldId]: next })
                }
              />
              {active ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    onValuesChange({ ...values, [facet.fieldId]: emptyFacet })
                  }
                >
                  Clear
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        )
      })}
      {anyActive ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onValuesChange({})
            onActivePresetsChange([])
          }}
        >
          Reset
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </>
  )
}
