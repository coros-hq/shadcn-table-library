import { createFileRoute } from '@tanstack/react-router'
import { LogsPage } from '#/components/logs/logs-page'
import type { LogsExample } from '#/components/logs/logs-page'

export const Route = createFileRoute('/logs-table')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { example?: LogsExample } => ({
    // Unknown keys survive validation, so an invalid value must be cleared
    // explicitly rather than left out
    example: search.example === 'side-panel' ? 'side-panel' : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Shadcn Logs Table — ShadTable' },
      {
        name: 'description',
        content:
          'A log explorer table for shadcn/ui and TanStack Table: a date range picker, multi-select level, service, and status filters, highlighted search, and expandable rows with the full event.',
      },
      { property: 'og:title', content: 'Shadcn Logs Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'Observability-style log viewer with faceted filters, search highlighting, and expandable event details.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Logs Table',
          description:
            'A log explorer table with level, service, status, and date range filters, search highlighting, and expandable rows.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/logs-table',
      },
    ],
  }),
  component: LogsPage,
})
