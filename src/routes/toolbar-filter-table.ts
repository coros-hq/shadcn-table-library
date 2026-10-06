import { createFileRoute } from '@tanstack/react-router'
import { ToolbarFilterTablePage } from '#/components/toolbar-filter/toolbar-filter-table-page'

export const Route = createFileRoute('/toolbar-filter-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Toolbar Filter Table — ShadTable' },
      {
        name: 'description',
        content:
          'Toolbar filter table for shadcn/ui and TanStack Table: dropdown selects and a search input above the table.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Toolbar Filter Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A simple filter row above the table — dropdown selects and a search input, filters applied immediately, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Toolbar Filter Table',
          description:
            'A simple filter row above the table — dropdown selects and a search input, filters applied immediately.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/toolbar-filter-table',
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
        href: 'https://www.shad-table.dev/toolbar-filter-table',
      },
    ],
  }),
  component: ToolbarFilterTablePage,
})
