import { createFileRoute } from '@tanstack/react-router'
import { DeploymentsPage } from '#/components/deployments/deployments-page'

export const Route = createFileRoute('/deployments-table')({
  head: () => ({
    meta: [
      { title: 'Deployments Table — ShadTable' },
      {
        name: 'description',
        content:
          'A deployment history table like on hosting platforms: status with build time, environment, branch and commit, with filters for environment, status, branch, and date and live counts on every option.',
      },
      { property: 'og:title', content: 'Deployments Table — ShadTable' },
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
