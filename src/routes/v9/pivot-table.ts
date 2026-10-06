import { createFileRoute } from '@tanstack/react-router'
import { PivotTablePage } from '#/components/v9/pivot/pivot-table-page'

export const Route = createFileRoute('/v9/pivot-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Pivot Table — TanStack Table v9 — ShadTable' },
      {
        name: 'description',
        content:
          'Pivot table for shadcn/ui and TanStack Table: choose row and column dimensions, then sum, average or count flat data. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Pivot Table — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A pivot table for dashboard-style analytics with configurable row/column dimensions and aggregation, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Pivot Table',
          description:
            'A pivot table for dashboard-style analytics with configurable row/column dimensions and aggregation.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/pivot-table',
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
        href: 'https://www.shad-table.dev/v9/pivot-table',
      },
    ],
  }),
  component: PivotTablePage,
})
