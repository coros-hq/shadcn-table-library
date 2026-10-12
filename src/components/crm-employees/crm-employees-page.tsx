import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { CrmEmployeesTableDemo } from './index'
import singleIndexSource from './index.tsx?raw'
import singleColumnsSource from './columns.tsx?raw'
import singleDataTableSource from './data-table.tsx?raw'
import singleDataSource from './data.ts?raw'
import { CrmEmployeesMultiTableDemo } from '#/components/crm-employees-multi'
import multiIndexSource from '#/components/crm-employees-multi/index.tsx?raw'
import multiColumnsSource from '#/components/crm-employees-multi/columns.tsx?raw'
import multiDataTableSource from '#/components/crm-employees-multi/data-table.tsx?raw'
import multiSelectSource from '#/components/crm-employees-multi/multi-select-filter.tsx?raw'
import multiDataSource from '#/components/crm-employees-multi/data.ts?raw'
import vueSingleDemoSource from '#/components/vue/crm-employees/CrmEmployeesTableDemo.vue?raw'
import vueSingleColumnsSource from '#/components/vue/crm-employees/columns.ts?raw'
import vueSingleDataTableSource from '#/components/vue/crm-employees/DataTable.vue?raw'
import vueSingleToolbarSelectSource from '#/components/vue/crm-employees/ToolbarSelect.vue?raw'
import vueSingleDataSource from '#/components/vue/crm-employees/data.ts?raw'
import vueMultiDemoSource from '#/components/vue/crm-employees-multi/CrmEmployeesMultiTableDemo.vue?raw'
import vueMultiColumnsSource from '#/components/vue/crm-employees-multi/columns.ts?raw'
import vueMultiDataTableSource from '#/components/vue/crm-employees-multi/DataTable.vue?raw'
import vueMultiColumnMultiSelectSource from '#/components/vue/crm-employees-multi/ColumnMultiSelect.vue?raw'
import vueMultiSelectSource from '#/components/vue/crm-employees-multi/MultiSelectFilter.vue?raw'
import vueMultiDataSource from '#/components/vue/crm-employees-multi/data.ts?raw'

interface Step {
  title: string
  description: string
  file: string
  code: string
}

const singleDir = 'src/components/crm-employees'
const multiDir = 'src/components/crm-employees-multi'

const singleFiles = [
  { path: `${singleDir}/index.tsx`, code: singleIndexSource },
  { path: `${singleDir}/columns.tsx`, code: singleColumnsSource },
  { path: `${singleDir}/data-table.tsx`, code: singleDataTableSource },
  { path: `${singleDir}/data.ts`, code: singleDataSource },
]

const singleVueFiles = [
  { path: `${singleDir}/CrmEmployeesTableDemo.vue`, code: vueSingleDemoSource },
  { path: `${singleDir}/columns.ts`, code: vueSingleColumnsSource },
  { path: `${singleDir}/DataTable.vue`, code: vueSingleDataTableSource },
  {
    path: `${singleDir}/ToolbarSelect.vue`,
    code: vueSingleToolbarSelectSource,
  },
  { path: `${singleDir}/data.ts`, code: vueSingleDataSource },
]

const multiFiles = [
  { path: `${multiDir}/index.tsx`, code: multiIndexSource },
  { path: `${multiDir}/columns.tsx`, code: multiColumnsSource },
  { path: `${multiDir}/data-table.tsx`, code: multiDataTableSource },
  { path: `${multiDir}/multi-select-filter.tsx`, code: multiSelectSource },
  { path: `${multiDir}/data.ts`, code: multiDataSource },
]

const multiVueFiles = [
  {
    path: `${multiDir}/CrmEmployeesMultiTableDemo.vue`,
    code: vueMultiDemoSource,
  },
  { path: `${multiDir}/columns.ts`, code: vueMultiColumnsSource },
  { path: `${multiDir}/DataTable.vue`, code: vueMultiDataTableSource },
  {
    path: `${multiDir}/ColumnMultiSelect.vue`,
    code: vueMultiColumnMultiSelectSource,
  },
  { path: `${multiDir}/MultiSelectFilter.vue`, code: vueMultiSelectSource },
  { path: `${multiDir}/data.ts`, code: vueMultiDataSource },
]

const singleVueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'checkbox', 'input', 'select', 'table'],
  valueUpdater: true,
}

const multiVueDeps = {
  npm: ['@lucide/vue'],
  shadcn: [
    'badge',
    'button',
    'checkbox',
    'command',
    'input',
    'popover',
    'select',
    'table',
  ],
  valueUpdater: true,
}

const singleSteps: Step[] = [
  {
    title: 'Two lines of text in one cell, not two columns',
    description:
      'A CRM row carries a lot of fields, and giving each its own column makes the table wider than any screen. Related fields share a cell instead: the Employee column stacks name over email beside an initials avatar, Role stacks title over a department dot, and Hired stacks the date over a tenure. Each column stays individually sortable because it is still backed by one accessor.',
    file: 'src/components/crm-employees/columns.tsx',
    code: `{
  accessorKey: 'role',
  header: 'Role',
  cell: ({ row }) => (
    <div>
      <p>{row.original.role}</p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={cn('size-1.5 rounded-full', departmentDot[row.original.department])} />
        {row.original.department}
      </p>
    </div>
  ),
}`,
  },
  {
    title: 'A hidden column can still be a filter',
    description:
      "Department is already shown under Role, so repeating it as its own column would waste a full column of width. It stays in the column definitions anyway and is hidden through columnVisibility, which keeps table.getColumn('department') available for the toolbar's select. Both selects use equalsString so filtering on 'Design' can never match a longer value that merely contains it.",
    file: 'src/components/crm-employees/data-table.tsx',
    code: `initialState: {
  pagination: { pageSize: 10 },
  columnVisibility: { department: false },
},`,
  },
  {
    title: 'Search the fields people actually type',
    description:
      "The built-in global filter only checks columns whose value is a string, so it would miss the email (which isn't a column) and stop matching the moment a column is hidden. A custom globalFilterFn reads straight from row.original and checks name, email, role, department and location, which is what makes 'berlin' or an email fragment find the right person.",
    file: 'src/components/crm-employees/data-table.tsx',
    code: `const employeeSearch: FilterFn<Employee> = (row, _columnId, value) => {
  const query = String(value).trim().toLowerCase()
  if (!query) return true
  const { name, email, role, department, location } = row.original
  return [name, email, role, department, location].some((field) =>
    field.toLowerCase().includes(query),
  )
}`,
  },
  {
    title: 'Format once, align numbers right',
    description:
      'Salary and dates go through module-level Intl formatters instead of being rebuilt in every cell render, and the date formatter is pinned to UTC so a server render and a browser in another timezone cannot disagree about the day. Salary is right-aligned with tabular-nums so the digits line up down the column, and the header is right-aligned to match.',
    file: 'src/components/crm-employees/columns.tsx',
    code: `const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

<div className="text-right font-medium tabular-nums">
  {currency.format(row.original.salary)}
</div>`,
  },
]

const multiSteps: Step[] = [
  {
    title: 'The filter value becomes an array',
    description:
      "A single select stores one string per column; a multi-select stores string[]. Switching the two filter columns to filterFn: 'arrIncludesSome' makes a row pass when its value is any of the selected options, so picking Active and Remote shows both. The column definitions are otherwise identical to the single-select CRM example.",
    file: `${multiDir}/columns.tsx`,
    code: `{
  accessorKey: 'status',
  header: 'Status',
  filterFn: 'arrIncludesSome',
},`,
  },
  {
    title: 'Clearing the last option must remove the filter',
    description:
      'An empty array is still a defined filter value, and arrIncludesSome against an empty array matches nothing — the table would go blank the moment you unticked the last option. ColumnMultiSelect therefore passes undefined instead of [] so TanStack drops the filter and every row comes back.',
    file: `${multiDir}/data-table.tsx`,
    code: `onChange={(values) =>
  column?.setFilterValue(values.length ? values : undefined)
}`,
  },
  {
    title: 'Counts come from the faceted model',
    description:
      "Each option shows how many employees it would match. getFacetedUniqueValues() computes that per column from rows filtered by every other filter but this column's own, so while picking departments the status counts shrink to match, and the department counts do not collapse to the ones you already ticked. It works on the hidden Department column too.",
    file: `${multiDir}/data-table.tsx`,
    code: `getFacetedRowModel: getFacetedRowModel(),
getFacetedUniqueValues: getFacetedUniqueValues(),

const facets = column?.getFacetedUniqueValues()
count: facets?.get(option) ?? 0`,
  },
  {
    title: 'One reset for all column filters',
    description:
      'Because both filters live in columnFilters, a Reset button only needs table.resetColumnFilters(). It renders only while at least one filter is active, so it never takes toolbar space when there is nothing to reset. The search box is a global filter and is deliberately left alone.',
    file: `${multiDir}/data-table.tsx`,
    code: `{table.getState().columnFilters.length > 0 ? (
  <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
    Reset
  </Button>
) : null}`,
  },
]

const examples = [
  {
    value: 'single-select',
    title: 'Single-select filters',
    description:
      'Department and status are single selects: pick one value, or All. The simplest setup, and a good fit when each filter has only a handful of options.',
    install: 'crm-employees-table',
    preview: <CrmEmployeesTableDemo />,
    files: singleFiles,
    vueFiles: singleVueFiles,
    vueDeps: singleVueDeps,
    steps: singleSteps,
  },
  {
    value: 'multi-select',
    title: 'Multi-select filters',
    description:
      'Department and status are multi-selects: pick several values at once, see how many employees each option matches, and reset everything in one click.',
    install: 'crm-employees-multi-select-table',
    preview: <CrmEmployeesMultiTableDemo />,
    files: multiFiles,
    vueFiles: multiVueFiles,
    vueDeps: multiVueDeps,
    steps: multiSteps,
  },
]

export type CrmEmployeesExample = (typeof examples)[number]['value']

function HowItWorks({ steps }: { steps: readonly Step[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">How it works</h2>
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
            <CodeBlock filename={step.file} code={step.code} className="mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CrmEmployeesPage() {
  const { example = 'single-select' } = useSearch({
    from: '/crm-employees-table',
  })
  const navigate = useNavigate({ from: '/crm-employees-table' })

  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn CRM Employees Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            A data-dense employee directory of the kind found in a CRM or HR
            tool — stacked name/email, role and department, status badges,
            performance bars, tenure and salary — with search, department and
            status filters, sorting, row selection, pagination and a row density
            toggle. Pick how the filters behave.
          </p>
        </div>

        <Tabs
          value={example}
          onValueChange={(value) =>
            navigate({
              search: {
                example: value === 'single-select' ? undefined : value,
              },
              replace: true,
              resetScroll: false,
            })
          }
          className="gap-6"
        >
          <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
            {examples.map((ex) => (
              <TabsTrigger
                key={ex.value}
                value={ex.value}
                className="-mb-px flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0.5 pb-2 text-sm font-normal text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-b-foreground dark:data-[state=active]:bg-transparent"
              >
                {ex.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {examples.map((ex) => (
            <TabsContent key={ex.value} value={ex.value} className="space-y-4">
              <p className="max-w-2xl text-sm text-muted-foreground">
                {ex.description}
              </p>
              <InstallCommand name={ex.install} />
              <ComponentPreview
                preview={ex.preview}
                files={ex.files}
                vueFiles={ex.vueFiles}
                vueDeps={ex.vueDeps}
              />
              <HowItWorks steps={ex.steps} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </DocsLayout>
  )
}
