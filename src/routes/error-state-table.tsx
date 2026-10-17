import { createFileRoute } from '@tanstack/react-router'
import { ErrorStateTablePage } from '#/components/error-state/error-state-table-page'

export const Route = createFileRoute('/error-state-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Error State Table — ShadTable' },
      {
        name: 'description',
        content:
          'Error state table for shadcn/ui and TanStack Table: a full error panel with retry when no data loaded, and a banner over stale rows when a refresh fails.',
      },
      { property: 'og:title', content: 'Shadcn Error State Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'Error panel and stale-data banner with retry for a shadcn/ui and TanStack Table data table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Error State Table',
          description:
            'Error panel and stale-data banner with retry for a shadcn/ui and TanStack Table data table.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/error-state-table',
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
        href: 'https://www.shad-table.dev/error-state-table',
      },
    ],
  }),
  component: ErrorStateTablePage,
})
