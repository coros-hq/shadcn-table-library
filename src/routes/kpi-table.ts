import { createFileRoute } from '@tanstack/react-router'
import { KpiTablePage } from '#/components/kpi/kpi-table-page'

export const Route = createFileRoute('/kpi-table')({
  head: () => ({
    meta: [
      { title: 'Summary / KPI Table — ShadTable' },
      {
        name: 'description',
        content:
          'A compact metrics table — current value, period-over-period change, and a per-row sparkline — for the kind of dashboard summary that sits above the fold.',
      },
      { property: 'og:title', content: 'Summary / KPI Table — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/kpi-table',
      },
    ],
  }),
  component: KpiTablePage,
})
