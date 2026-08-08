import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import typeSource from './type.ts?raw'
import chipsSource from './active-filter-chips.tsx?raw'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { FilterStateShapeTableDemo } from './index'

const files = [
  { path: 'src/components/filter-state-shape/type.ts', code: typeSource },
  {
    path: 'src/components/filter-state-shape/active-filter-chips.tsx',
    code: chipsSource,
  },
  {
    path: 'src/components/filter-state-shape/columns.tsx',
    code: columnsSource,
  },
  {
    path: 'src/components/filter-state-shape/data-table.tsx',
    code: tableSource,
  },
  { path: 'src/components/filter-state-shape/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'One normalized filter shape drives everything',
    description:
      "ActiveFilter is a small discriminated union — dateRange or multiSelect, each tagged with the columnId it targets. It's the single source of truth for the toolbar controls, the chips row, and the table's columnFilters, so none of those three can drift out of sync with each other.",
    file: 'src/components/filter-state-shape/type.ts',
    code: `export type DateRangeFilter = {
  type: "dateRange";
  columnId: string;
  from?: Date;
  to?: Date;
};

export type MultiSelectFilter = {
  type: "multiSelect";
  columnId: string;
  values: string[];
};

export type ActiveFilter = DateRangeFilter | MultiSelectFilter;`,
  },
  {
    title: 'columnFilters is derived, not owned by the table',
    description:
      "The table never manages its own columnFilters state. It's computed from `filters` on every render, so TanStack Table just reads whatever the ActiveFilter[] array currently says — there's nowhere else column filter state could live.",
    file: 'src/components/filter-state-shape/data-table.tsx',
    code: `const columnFilters = useMemo<ColumnFiltersState>(
  () =>
    filters.map((f) =>
      f.type === 'multiSelect'
        ? { id: f.columnId, value: f.values }
        : { id: f.columnId, value: { from: f.from, to: f.to } },
    ),
  [filters],
)`,
  },
  {
    title: 'Chips read the same array they remove from',
    description:
      'ActiveFilterChips takes the exact ActiveFilter[] array and renders one chip per entry, formatting a dateRange differently from a multiSelect. Removing a chip just filters that columnId out of `filters` — the derived columnFilters and the toolbar controls update for free.',
    file: 'src/components/filter-state-shape/active-filter-chips.tsx',
    code: `function formatFilterLabel(f: ActiveFilter) {
  if (f.type === "dateRange") {
    return \`\${f.columnId}: \${f.from ? format(f.from, "MMM d") : "?"} - \${f.to ? format(f.to, "MMM d") : "?"}\`;
  }
  return \`\${f.columnId}: \${f.values.join(", ")}\`;
}`,
  },
]

export function FilterStateShapePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Filter State Shape
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A normalized ActiveFilter[] array as the single source of truth
            for multi-select and date-range filters — the toolbar, the
            removable chips row, and TanStack Table's columnFilters all read
            from (and write to) the same shape.
          </p>
        </div>

        <InstallCommand name="filter-state-shape-table" />

        <ComponentPreview
          preview={<FilterStateShapeTableDemo />}
          files={files}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">How it works</p>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </p>
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
