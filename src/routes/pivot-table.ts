import { createFileRoute } from '@tanstack/react-router'
import { PivotTablePage } from '#/components/pivot/pivot-table-page'

export const Route = createFileRoute('/pivot-table')({
  head: () => ({
    meta: [
      { title: 'Pivot Table — ShadTable' },
      {
        name: 'description',
        content:
          'Dashboard-style analytics table — pick which dimension becomes rows, which becomes columns, and how to aggregate (sum, average, or count), recomputed from flat sales data.',
      },
      { property: 'og:title', content: 'Pivot Table — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shadcn-table-library.vercel.app/pivot-table',
      },
    ],
  }),
  component: PivotTablePage,
})
