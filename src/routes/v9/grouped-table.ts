import { createFileRoute } from '@tanstack/react-router'
import { GroupedTablePage } from '#/components/v9/grouped/grouped-table-page'

export const Route = createFileRoute('/v9/grouped-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Grouped Table (Row Grouping) — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Row grouping for shadcn/ui and TanStack Table: collapsible group headers with live subtotals per group. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Grouped Table (Row Grouping) — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A table with collapsible row groups and live per-group subtotals, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Grouped Table',
          description:
            'A table with collapsible row groups and live per-group subtotals.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/grouped-table',
          isAccessibleForFree: true,
          author: {
            '@type': 'Organization',
            name: 'coros-hq',
            url: 'https://github.com/coros-hq',
          },
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/v9/grouped-table',
      },
    ],
  }),
  component: GroupedTablePage,
})
