import { createFileRoute } from '@tanstack/react-router'
import { ToolbarFilterTablePage } from '#/components/toolbar-filter/toolbar-filter-table-page'

export const Route = createFileRoute('/toolbar-filter-table')({
  head: () => ({
    meta: [
      { title: 'Toolbar Filter Table — ShadTable' },
      {
        name: 'description',
        content:
          'A simple filter row above the table — dropdown selects and a search input, filters applied immediately. The 80% use case for filtering.',
      },
      { property: 'og:title', content: 'Toolbar Filter Table — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/toolbar-filter-table',
      },
    ],
  }),
  component: ToolbarFilterTablePage,
})
