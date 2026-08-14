import { createFileRoute } from '@tanstack/react-router'
import { ParamsFilterTableDemo } from '#/components/params-filter'
import indexSource from '#/components/params-filter/index.tsx?raw'
import columnsSource from '#/components/params-filter/columns.tsx?raw'
import dataTableSource from '#/components/params-filter/data-table.tsx?raw'
import useNuqsFiltersSource from '#/components/params-filter/use-nuqs-filters.ts?raw'
import useNativeFiltersSource from '#/components/params-filter/use-native-filters.ts?raw'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

const files = [
  { path: 'src/components/params-filter/index.tsx', code: indexSource },
  { path: 'src/components/params-filter/columns.tsx', code: columnsSource },
  {
    path: 'src/components/params-filter/data-table.tsx',
    code: dataTableSource,
  },
  {
    path: 'src/components/params-filter/use-nuqs-filters.ts',
    code: useNuqsFiltersSource,
  },
  {
    path: 'src/components/params-filter/use-native-filters.ts',
    code: useNativeFiltersSource,
  },
]

const steps = [
  {
    title: 'The table takes filter state as controlled props',
    description:
      "ParamsDataTable never reaches for a router or a URL-state library itself. It receives search, role, onSearchChange, and onRoleChange as props and just filters the in-memory data against them — where that state actually lives is entirely up to the caller.",
    file: 'src/components/params-filter/data-table.tsx',
    code: `interface DataTableProps<TData extends { role: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  roleOptions: string[]
  search: string
  onSearchChange: (value: string) => void
  role: string
  onRoleChange: (value: string) => void
}`,
  },
  {
    title: 'Option A — sync it to the URL with nuqs',
    description:
      'useNuqsFilters wraps two useQueryState calls (one per param) behind the same { search, role, setSearch, setRole } shape the table expects. Passing null to a nuqs setter removes that key from the URL entirely, so "cleared" filters stay out of the query string.',
    file: 'src/components/params-filter/use-nuqs-filters.ts',
    code: `export function useNuqsFilters() {
  const [search, setSearch] = useQueryState('q', { defaultValue: '' })
  const [role, setRole] = useQueryState('role', { defaultValue: '' })

  return {
    search,
    role,
    setSearch: (value: string) => setSearch(value || null),
    setRole: (value: string) => setRole(value || null),
  }
}`,
  },
  {
    title: 'Option B — or skip the dependency with native URLSearchParams',
    description:
      "useNativeFilters implements the exact same shape using only browser APIs: it reads the current query string on mount, writes back via history.replaceState (no full navigation), and re-syncs on popstate so browser back/forward still works. Nothing here is router-specific.",
    file: 'src/components/params-filter/use-native-filters.ts',
    code: `function writeParam(key: string, value: string) {
  const url = new URL(window.location.href)
  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }
  window.history.replaceState(null, '', url)
}`,
  },
  {
    title: 'Swapping strategies is a one-line change',
    description:
      "ParamsFilterTableDemo only imports whichever hook it wants and destructures the same four values. Since both hooks return an identical shape, switching from nuqs to native URLSearchParams (or a custom implementation of your own) never touches ParamsDataTable.",
    file: 'src/components/params-filter/index.tsx',
    code: `import { useNuqsFilters } from './use-nuqs-filters'
// import { useNativeFilters as useNuqsFilters } from './use-native-filters'

const { search, role, setSearch, setRole } = useNuqsFilters()`,
  },
  {
    title: 'Filtering runs against the full in-memory dataset',
    description:
      'A useMemo recomputes the visible rows whenever data, search, or role change: search does a case-insensitive substring match across every field on the row, and role does an exact match. Both conditions must pass for a row to stay visible.',
    file: 'src/components/params-filter/data-table.tsx',
    code: `const filteredData = useMemo(() => {
  return data.filter((row) => {
    const matchesSearch = search
      ? Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        )
      : true
    const matchesRole = role ? row.role === role : true
    return matchesSearch && matchesRole
  })
}, [data, search, role])`,
  },
]

export const Route = createFileRoute('/params-filter-table')({
  head: () => ({
    meta: [
      { title: 'Params Filter Table — ShadTable' },
      {
        name: 'description',
        content:
          'A data table whose filter state is synced to URL search params.',
      },
    ],
  }),
  component: ParamsFilterTablePage,
})

function ParamsFilterTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Params Filter Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A data table whose filter state is synced to URL search params.
            The table itself is filter-state agnostic — it takes
            search/role as controlled props, so you can back it with{' '}
            <code>useNuqsFilters</code> (nuqs) or{' '}
            <code>useNativeFilters</code> (plain URLSearchParams/History
            API), whichever fits your app.
          </p>
        </div>

        <InstallCommand name="params-filter-table" />

        <ComponentPreview preview={<ParamsFilterTableDemo />} files={files} />

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
