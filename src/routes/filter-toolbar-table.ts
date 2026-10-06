import { createFileRoute } from '@tanstack/react-router'
import { FilterToolbarPage } from '#/components/filter-toolbar/filter-toolbar-page'

export const Route = createFileRoute('/filter-toolbar-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Data Table Filter Toolbar — ShadTable' },
      {
        name: 'description',
        content:
          'Config-driven filter toolbar for shadcn/ui and TanStack Table: filters generated from column.meta with an active-filters row.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Data Table Filter Toolbar — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A config-driven filter system built on shadcn/ui and TanStack Table — filters are generated from column.meta instead of being hand-wired per column.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Filter Toolbar',
          description:
            'A config-driven filter system that generates filter controls and an active-filters row from column.meta.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/filter-toolbar-table',
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
        href: 'https://www.shad-table.dev/filter-toolbar-table',
      },
    ],
  }),
  component: FilterToolbarPage,
})
