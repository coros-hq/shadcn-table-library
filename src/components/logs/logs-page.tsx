import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import tableSource from './data-table.tsx?raw'
import sidePanelTableSource from './side-panel-data-table.tsx?raw'
import columnsSource from './columns.tsx?raw'
import toolbarSource from './toolbar.tsx?raw'
import hookSource from './use-logs-table.ts?raw'
import fieldsSource from './log-fields.tsx?raw'
import filterSource from './faceted-filter.tsx?raw'
import dateFilterSource from './date-range-filter.tsx?raw'
import dataSource from './data.ts?raw'
import demoSource from './index.tsx?raw'
import sidePanelDemoSource from './side-panel-demo.tsx?raw'
import { LogsDemo } from './index'
import { LogsSidePanelDemo } from './side-panel-demo'

const dir = 'src/components/logs'

const sharedFiles = [
  { path: `${dir}/columns.tsx`, code: columnsSource },
  { path: `${dir}/toolbar.tsx`, code: toolbarSource },
  { path: `${dir}/use-logs-table.ts`, code: hookSource },
  { path: `${dir}/log-fields.tsx`, code: fieldsSource },
  { path: `${dir}/faceted-filter.tsx`, code: filterSource },
  { path: `${dir}/date-range-filter.tsx`, code: dateFilterSource },
  { path: `${dir}/data.ts`, code: dataSource },
]

const expandFiles = [
  { path: `${dir}/data-table.tsx`, code: tableSource },
  ...sharedFiles,
  { path: `${dir}/index.tsx`, code: demoSource },
]

const sidePanelFiles = [
  { path: `${dir}/side-panel-data-table.tsx`, code: sidePanelTableSource },
  ...sharedFiles,
  { path: `${dir}/side-panel-demo.tsx`, code: sidePanelDemoSource },
]

interface Step {
  title: string
  description: string
  file: string
  code: string
}

const expandSteps: Step[] = [
  {
    title: 'Rows expand into the full event',
    description:
      'getRowCanExpand opts every row into expansion even though logs have no sub-rows. Clicking a row, or its chevron, renders a detail row with every field, including ones that are not columns, like region and duration.',
    file: `${dir}/data-table.tsx`,
    code: `useLogsTable({
  data,
  columns: [expandColumn, ...columns],
  getRowCanExpand: () => true,
  getExpandedRowModel: getExpandedRowModel(),
})

{row.getIsExpanded() && (
  <TableRow>
    <TableCell colSpan={row.getVisibleCells().length}>
      <LogFields log={row.original} />
    </TableCell>
  </TableRow>
)}`,
  },
  {
    title: 'Level, service, and status share one multi-select',
    description:
      "Each dropdown writes a string[] filter value on its column, checked by a single inList filterFn. Counts come from getFacetedUniqueValues(), which applies every other filter but not the column's own, so with billing selected the Level menu shows how many billing errors you would get by ticking Error.",
    file: `${dir}/toolbar.tsx`,
    code: `<FacetedFilter
  column={table.getColumn('level')}
  title="Level"
  options={levels}
  renderIcon={(level) => <LevelDot level={level as LogLevel} />}
/>`,
  },
  {
    title: 'Pick a start, then an end',
    description:
      'Left to its defaults, react-day-picker turns the first click into a one-day range and later clicks only move one end, so there is no way to start a new range. The picker keeps a draft instead: the first click sets the start, the second sets the end in either direction, and only then does the column filter change. Days are read as UTC days to match the Time column.',
    file: `${dir}/date-range-filter.tsx`,
    code: `function pickDay(day: Date) {
  if (!draft?.from || draft.to) {
    setDraft({ from: day, to: undefined })
    return
  }
  apply(
    day < draft.from
      ? { from: day, to: draft.from }
      : { from: draft.from, to: day },
  )
}`,
  },
  {
    title: 'Status classes are a derived column',
    description:
      'Nobody filters logs by "status 502"; they filter by 5xx. The Request column uses an accessorFn that turns the status code into its class, so faceting and filtering work on 2xx through 5xx while the cell still renders the exact code, method, and path.',
    file: `${dir}/columns.tsx`,
    code: `{
  id: 'statusClass',
  accessorFn: (row) => toStatusClass(row.status),
  filterFn: inList,
  cell: ({ row }) => /* 502 GET /v1/projects */,
}`,
  },
  {
    title: 'Search highlights what it matched',
    description:
      'A custom globalFilterFn searches message, path, and request id, the things people paste from an alert. Cells read the same query from table.getState().globalFilter and wrap each match in a <mark>, so you can see why a row survived the filter.',
    file: `${dir}/columns.tsx`,
    code: `cell: ({ row, table }) => (
  <Highlight
    text={row.original.message}
    query={table.getState().globalFilter}
  />
)`,
  },
  {
    title: 'Load older events instead of paging',
    description:
      'Paging through logs loses your place. The table keeps pageIndex at 0 and grows pageSize by 20 each time you ask for older events, so the list only ever gets longer and newest events stay at the top.',
    file: `${dir}/toolbar.tsx`,
    code: `onClick={() => table.setPageSize((size) => size + PAGE_SIZE)}`,
  },
]

const sidePanelSteps: Step[] = [
  {
    title: 'The panel makes room by hiding columns',
    description:
      'While an event is selected, columnVisibility hides Service and Request, whose values the panel header already shows, so the message column keeps enough width to read next to the panel.',
    file: `${dir}/side-panel-data-table.tsx`,
    code: `const hiddenWhileOpen = { service: false, statusClass: false }

const table = useLogsTable({
  data,
  columns,
  state: { columnVisibility: selectedId ? hiddenWhileOpen : {} },
})`,
  },
  {
    title: 'Selection is an id, checked against the visible rows',
    description:
      'The panel stores the selected row id, not the row. Each render looks that id up in the current row model, so when a filter or search removes the event the panel closes instead of describing a row that is no longer in the table.',
    file: `${dir}/side-panel-data-table.tsx`,
    code: `const rows = table.getRowModel().rows
const selectedIndex = rows.findIndex((row) => row.id === selectedId)
const selected = selectedIndex === -1 ? undefined : rows[selectedIndex]

useEffect(() => {
  if (selectedId && !selected) setSelectedId(null)
}, [selectedId, selected])`,
  },
  {
    title: 'Arrow keys move through events',
    description:
      "Rows are focusable. Up and down move both focus and the selection, so the panel follows the keyboard the way it does in a mail client, and the panel's own previous and next buttons use the same selectAt helper. Escape closes the panel from a row or from inside it.",
    file: `${dir}/side-panel-data-table.tsx`,
    code: `function selectAt(index: number) {
  const row = rows.at(index)
  if (index < 0 || !row) return
  setSelectedId(row.id)
  document.getElementById(\`log-row-\${row.id}\`)?.focus()
}`,
  },
  {
    title: 'Filters are shared with the expandable layout',
    description:
      'Search, the date range, and the level, service, and status filters come from the same useLogsTable hook and LogsToolbar as the Expandable rows example. See that tab for how faceted counts, the date range, and search highlighting work.',
    file: `${dir}/use-logs-table.ts`,
    code: `export function useLogsTable(options: LogsTableOptions) {
  return useReactTable({
    getRowId: (row) => row.id,
    globalFilterFn: searchLogs,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // ...
    ...options,
  })
}`,
  },
]

const examples = [
  {
    value: 'expandable',
    title: 'Expandable rows',
    description:
      'Click a row, or its chevron, to open the full event underneath it. Several events can be open at once, which makes it easy to compare them.',
    install: 'logs-table',
    preview: <LogsDemo />,
    files: expandFiles,
    steps: expandSteps,
  },
  {
    value: 'side-panel',
    title: 'Side panel',
    description:
      'Click a row to show the event in a panel on the right. Move through events with the arrow keys or the panel buttons, and press Escape to close it.',
    install: 'logs-table-side-panel',
    preview: <LogsSidePanelDemo />,
    files: sidePanelFiles,
    steps: sidePanelSteps,
  },
] as const

export type LogsExample = (typeof examples)[number]['value']

function HowItWorks({ steps }: { steps: readonly Step[] }) {
  return (
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
            <CodeBlock filename={step.file} code={step.code} className="mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LogsPage() {
  const { example = 'expandable' } = useSearch({ from: '/logs-table' })
  const navigate = useNavigate({ from: '/logs-table' })

  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Logs Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            A log explorer like the ones in observability tools: a date range
            picker, multi-select level, service, and status filters with live
            counts, and search that highlights its matches. Pick a layout for
            reading an event.
          </p>
        </div>

        <Tabs
          value={example}
          onValueChange={(value) =>
            navigate({
              search: {
                example:
                  value === 'expandable' ? undefined : (value as LogsExample),
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
              <ComponentPreview preview={ex.preview} files={ex.files} />
              <HowItWorks steps={ex.steps} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </DocsLayout>
  )
}
