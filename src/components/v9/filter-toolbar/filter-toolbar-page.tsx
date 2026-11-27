import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import typesSource from './types.ts?raw'
import operatorsSource from './operators.ts?raw'
import filterFnsSource from './filter-fns.ts?raw'
import dateRangeFilterSource from './date-range-filter.tsx?raw'
import filterValueInputSource from './filter-value-input.tsx?raw'
import filterConditionEditorSource from './filter-condition-editor.tsx?raw'
import filterToolbarSource from './filter-toolbar.tsx?raw'
import useFilterConditionsSource from './use-filter-conditions.ts?raw'
import useActiveFiltersSource from './use-active-filters.ts?raw'
import chipsSource from './active-filter-chips.tsx?raw'
import exampleSource from './example.tsx?raw'
import { FilterToolbarDemo } from './example'
import svelteFilterToolbarFilterToolbarDemoSource from '#/components/svelte/v9/filter-toolbar/FilterToolbarDemo.svelte?raw'
import svelteFilterToolbarActiveFilterChipsSource from '#/components/svelte/v9/filter-toolbar/ActiveFilterChips.svelte?raw'
import svelteFilterToolbarAddFilterTriggerSource from '#/components/svelte/v9/filter-toolbar/AddFilterTrigger.svelte?raw'
import svelteFilterToolbarDateRangeFilterSource from '#/components/svelte/v9/filter-toolbar/DateRangeFilter.svelte?raw'
import svelteFilterToolbarFilterConditionEditorSource from '#/components/svelte/v9/filter-toolbar/FilterConditionEditor.svelte?raw'
import svelteFilterToolbarFilterConditionPillSource from '#/components/svelte/v9/filter-toolbar/FilterConditionPill.svelte?raw'
import svelteFilterToolbarFilterToolbarSource from '#/components/svelte/v9/filter-toolbar/FilterToolbar.svelte?raw'
import svelteFilterToolbarFilterValueInputSource from '#/components/svelte/v9/filter-toolbar/FilterValueInput.svelte?raw'
import svelteFilterToolbarfilterfnsSource from '#/components/svelte/v9/filter-toolbar/filter-fns.ts?raw'
import svelteFilterToolbaroperatorsSource from '#/components/svelte/v9/filter-toolbar/operators.ts?raw'
import svelteFilterToolbartypesSource from '#/components/svelte/v9/filter-toolbar/types.ts?raw'
import svelteFilterToolbaruseactivefiltersSource from '#/components/svelte/v9/filter-toolbar/use-active-filters.svelte.ts?raw'
import svelteFilterToolbarusefilterconditionsSource from '#/components/svelte/v9/filter-toolbar/use-filter-conditions.svelte.ts?raw'
import svelteFilterToolbarsharedmultiselectfilterMultiSelectFilterSource from '#/components/svelte/shared/multi-select-filter/MultiSelectFilter.svelte?raw'

const files = [
  { path: 'src/components/filter-toolbar/types.ts', code: typesSource },
  { path: 'src/components/filter-toolbar/operators.ts', code: operatorsSource },
  {
    path: 'src/components/filter-toolbar/filter-fns.ts',
    code: filterFnsSource,
  },
  {
    path: 'src/components/filter-toolbar/date-range-filter.tsx',
    code: dateRangeFilterSource,
  },
  {
    path: 'src/components/filter-toolbar/filter-value-input.tsx',
    code: filterValueInputSource,
  },
  {
    path: 'src/components/filter-toolbar/filter-condition-editor.tsx',
    code: filterConditionEditorSource,
  },
  {
    path: 'src/components/filter-toolbar/filter-toolbar.tsx',
    code: filterToolbarSource,
  },
  {
    path: 'src/components/filter-toolbar/use-filter-conditions.ts',
    code: useFilterConditionsSource,
  },
  {
    path: 'src/components/filter-toolbar/use-active-filters.ts',
    code: useActiveFiltersSource,
  },
  {
    path: 'src/components/filter-toolbar/active-filter-chips.tsx',
    code: chipsSource,
  },
  { path: 'src/components/filter-toolbar/example.tsx', code: exampleSource },
]

const svelteFiles = [
  {
    path: 'src/lib/components/filter-toolbar/FilterToolbarDemo.svelte',
    code: svelteFilterToolbarFilterToolbarDemoSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/ActiveFilterChips.svelte',
    code: svelteFilterToolbarActiveFilterChipsSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/AddFilterTrigger.svelte',
    code: svelteFilterToolbarAddFilterTriggerSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/DateRangeFilter.svelte',
    code: svelteFilterToolbarDateRangeFilterSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/FilterConditionEditor.svelte',
    code: svelteFilterToolbarFilterConditionEditorSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/FilterConditionPill.svelte',
    code: svelteFilterToolbarFilterConditionPillSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/FilterToolbar.svelte',
    code: svelteFilterToolbarFilterToolbarSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/FilterValueInput.svelte',
    code: svelteFilterToolbarFilterValueInputSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/filter-fns.ts',
    code: svelteFilterToolbarfilterfnsSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/operators.ts',
    code: svelteFilterToolbaroperatorsSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/types.ts',
    code: svelteFilterToolbartypesSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/use-active-filters.svelte.ts',
    code: svelteFilterToolbaruseactivefiltersSource,
  },
  {
    path: 'src/lib/components/filter-toolbar/use-filter-conditions.svelte.ts',
    code: svelteFilterToolbarusefilterconditionsSource,
  },
  {
    path: 'src/lib/components/ui/multi-select-filter/MultiSelectFilter.svelte',
    code: svelteFilterToolbarsharedmultiselectfilterMultiSelectFilterSource,
  },
]

const svelteDeps = {
  npm: ['@internationalized/date', '@lucide/svelte', 'date-fns'],
  shadcn: [
    'badge',
    'button',
    'checkbox',
    'command',
    'input',
    'popover',
    'range-calendar',
    'select',
    'table',
  ],
  tanstack: '@tanstack/svelte-table@^9',
}

const steps = [
  {
    title:
      'Operators — and the value shape each one needs — live in one registry',
    description:
      'operatorRegistry maps each filterVariant to its valid operators (multiSelect gets "is any of" / "is none of", dateRange gets "is between", ...), and each operator declares a valueShape: none, single, array, or range. Neither the builder UI nor the filterFn hardcode a per-column operator list — both read it from here.',
    file: 'src/components/filter-toolbar/operators.ts',
    code: `export const operatorRegistry: Record<FilterVariant, OperatorDef[]> = {
  multiSelect: [
    { value: 'isAnyOf', label: 'is any of', valueShape: 'array' },
    { value: 'isNoneOf', label: 'is none of', valueShape: 'array' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
  dateRange: [
    { value: 'isBetween', label: 'is between', valueShape: 'range' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
  // ...
}`,
  },
  {
    title:
      'A condition is { columnId, operator, value } — one generic filterFn evaluates all of them',
    description:
      'Every filterable column shares the same conditionFilterFn. The comparison it runs is picked by filterValue.operator (contains, isAnyOf, isBetween, ...), not by which column the filterFn is attached to — so adding a new variant only means adding operators to the registry and a case to evaluateOperator, not a new filterFn per column.',
    file: 'src/components/filter-toolbar/filter-fns.ts',
    code: `export const conditionFilterFn: FilterFn<V9Features, any> = (row, columnId, filterValue) => {
  if (!filterValue?.operator) return true
  const cellValue = row.getValue(columnId)
  return evaluateOperator(filterValue.operator, cellValue, filterValue.value)
}
conditionFilterFn.autoRemove = (value) => !value?.operator`,
  },
  {
    title:
      'The builder walks column → operator → value, reusing existing controls',
    description:
      "FilterConditionEditor is one component used for both adding a new filter and editing an existing one: pick a column (skipped when editing), pick an operator for that column's variant, then FilterValueInput renders whichever control matches the operator's valueShape — reusing MultiSelectFilter and DateRangeFilter as-is rather than rebuilding them.",
    file: 'src/components/filter-toolbar/filter-value-input.tsx',
    code: `if (operator.valueShape === 'none') return null

switch (variant) {
  case 'multiSelect':
    return <MultiSelectFilter title={label} options={options ?? []} selected={value ?? []} onChange={onChange} />
  case 'dateRange':
    return <DateRangeFilter label={label} value={value} onChange={onChange} />
  // text / number / select render Input or Select
}`,
  },
  {
    title:
      'Conditions, pills, and chips all read the same columnFilters — nothing is stored twice',
    description:
      'useFilterConditions maps table.store.state.columnFilters back into FilterCondition[] for columns with a filterVariant. The toolbar pills, "+ Add filter" menu, and ActiveFilterChips (via useActiveFilters) all derive from that single call — removing a condition just calls column.setFilterValue(undefined) and every view updates on the next render.',
    file: 'src/components/filter-toolbar/use-filter-conditions.ts',
    code: `const columnFilters = table.store.state.columnFilters

return useMemo(() => {
  const conditions: FilterCondition[] = []
  for (const filter of columnFilters) {
    const meta = table.getColumn(filter.id)?.columnDef.meta
    if (!meta?.filterVariant) continue
    const raw = filter.value as FilterConditionValue | undefined
    if (!raw?.operator) continue
    conditions.push({ id: filter.id, columnId: filter.id, operator: raw.operator, value: raw.value })
  }
  return conditions
}, [columnFilters, table])`,
  },
]

export function FilterToolbarPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">
            Shadcn Filter Toolbar
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            An operator-based filter builder, Notion/tablecn-style. "+ Add
            filter" walks column → operator → value; each active condition
            becomes an editable pill; one generic filterFn evaluates every
            column by reading the operator off its condition instead of a fixed
            per-variant comparison.
          </p>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground text-balance">
            Use this when users need to build their own queries — “contains”,
            “is between”, “before date” — across many columns, instead of a
            fixed set of dropdowns.
          </p>
        </div>

        <InstallCommand name="filter-toolbar-table" />

        <ComponentPreview
          preview={<FilterToolbarDemo />}
          files={files}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-tight">How it works</h2>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
                <CodeBlock
                  filename={step.file}
                  code={step.code}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </DocsLayout>
  )
}
