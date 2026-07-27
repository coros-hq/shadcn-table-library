import { createFileRoute } from '@tanstack/react-router'
import { TreeTablePage } from '#/components/tree/tree-table-page'

export const Route = createFileRoute('/tree-table')({
  head: () => ({
    meta: [
      { title: 'Tree Table — ShadTable' },
      {
        name: 'description',
        content:
          'A hierarchical table for nested data — departments, teams, and employees — with expand/collapse, sorting, and a search box that keeps a matching row\'s ancestors visible.',
      },
      { property: 'og:title', content: 'Tree Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A hierarchical table for nested data with expand/collapse, sorting, and ancestor-aware search, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Tree Table',
          description:
            'A hierarchical table for nested data with expand/collapse, sorting, and ancestor-aware search.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shadcn-table-library.vercel.app/tree-table',
      },
    ],
  }),
  component: TreeTablePage,
})
