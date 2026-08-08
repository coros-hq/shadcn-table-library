import { createFileRoute } from '@tanstack/react-router'
import { FilterStateShapePage } from '#/components/filter-state-shape/filter-state-shape-page'

export const Route = createFileRoute('/filter-state-shape-table')({
  head: () => ({
    meta: [
      { title: 'Filter State Shape — ShadTable' },
      {
        name: 'description',
        content:
          'A normalized ActiveFilter[] array as the single source of truth for multi-select and date-range filters, keeping the toolbar, chips row, and columnFilters in sync.',
      },
      { property: 'og:title', content: 'Filter State Shape — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/filter-state-shape-table',
      },
    ],
  }),
  component: FilterStateShapePage,
})
