import { createFileRoute } from '@tanstack/react-router'
import { EmptyStateTablePage } from '#/components/empty-state/empty-state-table-page'

export const Route = createFileRoute('/empty-state-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Empty State Table — ShadTable' },
      {
        name: 'description',
        content:
          'Empty state table for shadcn/ui and TanStack Table: a first-use empty state with a call to action and a no-results state with a clear-search action.',
      },
      { property: 'og:title', content: 'Shadcn Empty State Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'First-use and no-results empty states for a shadcn/ui and TanStack Table data table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Empty State Table',
          description:
            'First-use and no-results empty states for a shadcn/ui and TanStack Table data table.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/empty-state-table',
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
        href: 'https://www.shad-table.dev/empty-state-table',
      },
    ],
  }),
  component: EmptyStateTablePage,
})
