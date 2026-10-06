import { createFileRoute } from '@tanstack/react-router'
import { GroupedTablePage } from '#/components/grouped/grouped-table-page'

export const Route = createFileRoute('/grouped-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Grouped Table (Row Grouping) — ShadTable' },
      {
        name: 'description',
        content:
          'Row grouping for shadcn/ui and TanStack Table: collapsible group headers with live subtotals per group.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Grouped Table (Row Grouping) — ShadTable',
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
          url: 'https://www.shad-table.dev/grouped-table',
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
        href: 'https://www.shad-table.dev/grouped-table',
      },
    ],
  }),
  component: GroupedTablePage,
})
