import { DocsLayout } from '#/components/docs/docs-layout.tsx'

export function ServerFilterPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">SSR Filter</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtering by column, resolved on the server the same way SSR
            Pagination resolves pages.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
          Coming soon.
        </div>
      </section>
    </DocsLayout>
  )
}
