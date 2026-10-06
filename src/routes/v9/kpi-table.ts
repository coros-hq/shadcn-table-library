import { createFileRoute } from '@tanstack/react-router'
import { KpiTablePage } from '#/components/v9/kpi/kpi-table-page'

export const Route = createFileRoute('/v9/kpi-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn KPI / Summary Table — TanStack Table v9 — ShadTable' },
      {
        name: 'description',
        content:
          'KPI summary table for shadcn/ui and TanStack Table: current value, period-over-period change and a sparkline per row. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content: 'Shadcn KPI / Summary Table — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A compact KPI/metrics table with sparklines and period-over-period change, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Summary / KPI Table',
          description:
            'A compact KPI/metrics table with sparklines and period-over-period change.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/kpi-table',
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
        href: 'https://www.shad-table.dev/v9/kpi-table',
      },
    ],
  }),
  component: KpiTablePage,
})
