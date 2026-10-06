import { createFileRoute } from '@tanstack/react-router'
import { FilterStateShapePage } from '#/components/filter-state-shape/filter-state-shape-page'

export const Route = createFileRoute('/filter-state-shape-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Data Table Filter State — ShadTable' },
      {
        name: 'description',
        content:
          'Data table filter state for shadcn/ui and TanStack Table: one ActiveFilter[] array keeps toolbar, chips and columnFilters in sync.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Data Table Filter State — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A normalized ActiveFilter[] array as the single source of truth for multi-select and date-range filters, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Filter State Shape',
          description:
            'A normalized ActiveFilter[] array as the single source of truth for multi-select and date-range filters, driving the toolbar, chips, and columnFilters.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/filter-state-shape-table',
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
        href: 'https://www.shad-table.dev/filter-state-shape-table',
      },
    ],
  }),
  component: FilterStateShapePage,
})
