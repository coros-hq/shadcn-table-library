import { createFileRoute } from '@tanstack/react-router'
import { LiveStatusTablePage } from '#/components/live-status/live-status-table-page'

export const Route = createFileRoute('/live-status-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table with Live Status Indicators — ShadTable' },
      {
        name: 'description',
        content:
          'A live status table for shadcn/ui and TanStack Table. A service-health table where status and latency update live on a timer, with a pulsing indicator for actively-monitored states.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table with Live Status Indicators — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A data table that updates its own rows on an interval to simulate live service-health monitoring, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Live Status Indicators',
          description:
            'A data table with self-updating status and latency columns, showing weighted state transitions and a Live/Paused toggle.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/live-status-table',
      },
    ],
  }),
  component: LiveStatusTablePage,
})
