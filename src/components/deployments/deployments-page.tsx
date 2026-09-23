import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import tableSource from './data-table.tsx?raw'
import columnsSource from './columns.tsx?raw'
import filterSource from './faceted-filter.tsx?raw'
import dataSource from './data.ts?raw'
import demoSource from './index.tsx?raw'
import { DeploymentsDemo } from './index'

const files = [
  { path: 'src/components/deployments/data-table.tsx', code: tableSource },
  { path: 'src/components/deployments/columns.tsx', code: columnsSource },
  { path: 'src/components/deployments/faceted-filter.tsx', code: filterSource },
  { path: 'src/components/deployments/data.ts', code: dataSource },
  { path: 'src/components/deployments/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Every filter is a TanStack column filter',
    description:
      'Environment, status, branch, and date each set a filter value on their own column, with a filterFn that knows its shape: a list of allowed values, or a number of days back. Clearing everything is one setColumnFilters([]) call, and the table never keeps a second copy of the filter state.',
    file: 'src/components/deployments/columns.tsx',
    code: `const inList: FilterFn<Deployment> = (row, id, value: string[] | undefined) =>
  !value?.length || value.includes(row.getValue<string>(id))

const withinDays: FilterFn<Deployment> = (row, id, days: number | undefined) =>
  days === undefined || row.getValue<number>(id) >= NOW - days * 86_400_000`,
  },
  {
    title: 'Option counts come from faceting, so they never lie',
    description:
      "getFacetedUniqueValues() counts each status or branch after applying every other active filter, but not the column's own. With Production selected, the Status menu shows how many production deploys are Ready or Error, which is exactly what ticking that option would give you.",
    file: 'src/components/deployments/faceted-filter.tsx',
    code: `const counts = column?.getFacetedUniqueValues()

<span className="ml-auto font-mono text-xs text-muted-foreground">
  {counts?.get(option) ?? 0}
</span>`,
  },
  {
    title: 'Search covers fields that are not visible columns',
    description:
      'The commit SHA, message, and author are real columns hidden with columnVisibility, so the search box can match them without cluttering the table. A custom globalFilterFn decides exactly which fields are searched, instead of TanStack guessing from value types.',
    file: 'src/components/deployments/data-table.tsx',
    code: `const searchDeployments: FilterFn<Deployment> = (row, _id, query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const d = row.original
  return [d.id, d.branch, d.sha, d.message, d.author].some((field) =>
    field.toLowerCase().includes(q),
  )
}`,
  },
  {
    title: 'Filtering always starts from page 1',
    description:
      'With autoResetPageIndex, any filter change sends the table back to the first page, so narrowing 42 deployments down to 3 never leaves you staring at an empty page 4. The footer and the count next to the filters both read from the filtered row model.',
    file: 'src/components/deployments/data-table.tsx',
    code: `useReactTable({
  // ...
  autoResetPageIndex: true,
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})`,
  },
]

export function DeploymentsPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Deployments
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            A deployment history like the ones on hosting platforms: status with
            build time, environment, branch and commit, and a filter bar for
            environment, status, branch, and date, with live counts on every
            option.
          </p>
        </div>

        <InstallCommand name="deployments-table" />

        <ComponentPreview preview={<DeploymentsDemo />} files={files} />

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
