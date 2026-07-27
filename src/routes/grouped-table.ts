import { createFileRoute } from '@tanstack/react-router'
import { GroupedTablePage } from '#/components/grouped/grouped-table-page'

export const Route = createFileRoute('/grouped-table')({
  head: () => ({
    meta: [
      { title: 'Grouped Table — ShadTable' },
      {
        name: 'description',
        content:
          "Orders grouped by category, with collapsible group headers and a live subtotal of each group's order amounts.",
      },
      { property: 'og:title', content: 'Grouped Table — ShadTable' },
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
        href: 'https://shad-table.dev/grouped-table',
      },
    ],
  }),
  component: GroupedTablePage,
})
