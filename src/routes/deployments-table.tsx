import { createFileRoute } from '@tanstack/react-router'
import { DeploymentsPage } from '#/components/deployments/deployments-page'

export const Route = createFileRoute('/deployments-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Deployments Table — ShadTable' },
      {
        name: 'description',
        content:
          'Deployments table for shadcn/ui and TanStack Table: build status, environment, branch and commit, with live-count filters.',
      },
      { property: 'og:title', content: 'Shadcn Deployments Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'Hosting-platform style deployments list for shadcn/ui and TanStack Table, with faceted filters and search.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Deployments Table',
          description:
            'A deployment history table with environment, status, branch, and date filters with faceted counts.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/deployments-table',
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
        href: 'https://www.shad-table.dev/deployments-table',
      },
    ],
  }),
  component: DeploymentsPage,
})
