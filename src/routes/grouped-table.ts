import { createFileRoute } from '@tanstack/react-router'
import { GroupedTablePage } from '#/components/grouped/grouped-table-page'

export const Route = createFileRoute('/grouped-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Grouped Table (Row Grouping) — ShadTable' },
      {
        name: 'description',
        content:
          "A grouped table with row grouping for shadcn/ui and TanStack Table. Orders grouped by category, with collapsible group headers and a live subtotal of each group's order amounts.",
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
