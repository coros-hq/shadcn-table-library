import { createFileRoute } from '@tanstack/react-router'

import { BasicTableUsage } from '#/components/basic'
import basicIndexSource from '#/components/basic/index.tsx?raw'
import basicDataTableSource from '#/components/basic/data-table.tsx?raw'
import basicColumnsSource from '#/components/basic/columns.tsx?raw'
import dataTableFilterSource from '#/components/DataTableFilter.tsx?raw'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'

export const Route = createFileRoute('/')({ component: Home })

const files = [
  { path: 'src/components/basic/index.tsx', code: basicIndexSource },
  { path: 'src/components/basic/columns.tsx', code: basicColumnsSource },
  { path: 'src/components/basic/data-table.tsx', code: basicDataTableSource },
  { path: 'src/components/DataTableFilter.tsx', code: dataTableFilterSource },
]

function Home() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Data Table</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A sortable, filterable, paginated table with a composable toolbar
            for column-specific filters. Sorting, filtering, and pagination
            all happen entirely in the browser — the whole dataset is sent to
            the client once, and TanStack Table slices it locally.
          </p>
        </div>
        <ComponentPreview preview={<BasicTableUsage />} files={files} />
      </section>
    </DocsLayout>
  )
}
