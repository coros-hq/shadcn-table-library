import { createFileRoute } from '@tanstack/react-router'
import { LoadingStateTablePage } from '#/components/loading-state/loading-state-table-page'

export const Route = createFileRoute('/loading-state-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Loading State Table — ShadTable' },
      {
        name: 'description',
        content:
          'Loading state table for shadcn/ui and TanStack Table: skeleton rows for first loads and a dimmed refetch state that keeps existing rows visible.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Loading State Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Skeleton rows and a non-blocking refetch state for a shadcn/ui and TanStack Table data table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Loading State Table',
          description:
            'Skeleton rows and a non-blocking refetch state for a shadcn/ui and TanStack Table data table.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/loading-state-table',
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
        href: 'https://www.shad-table.dev/loading-state-table',
      },
    ],
  }),
  component: LoadingStateTablePage,
})
