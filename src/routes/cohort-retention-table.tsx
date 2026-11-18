import { createFileRoute } from '@tanstack/react-router'
import { CohortRetentionTablePage } from '#/components/cohort-retention/cohort-retention-table-page'

export const Route = createFileRoute('/cohort-retention-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Cohort Retention Table — ShadTable' },
      {
        name: 'description',
        content:
          'Cohort retention table for shadcn/ui and TanStack Table: signup-month cohorts by month, counts or percentages, cohort highlight, clear empty periods.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Cohort Retention Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Users by signup month and how many stayed each month after, as a heatmap table with counts or percentages and a weighted average.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Cohort Retention Table',
          description:
            'A cohort retention table with count and percentage views, cohort highlighting and distinct unavailable periods.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/cohort-retention-table',
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
        href: 'https://www.shad-table.dev/cohort-retention-table',
      },
    ],
  }),
  component: CohortRetentionTablePage,
})
