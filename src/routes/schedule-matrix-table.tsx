import { createFileRoute } from '@tanstack/react-router'
import { ScheduleMatrixTablePage } from '#/components/schedule-matrix/schedule-matrix-table-page'

export const Route = createFileRoute('/schedule-matrix-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Schedule Matrix Table — ShadTable' },
      {
        name: 'description',
        content:
          'Schedule matrix for shadcn/ui and TanStack Table: people by days, editable shift cells, coverage per shift, rest-rule conflicts and hours per person.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Schedule Matrix Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A staff rota in a table: pick shifts per day with the mouse or keyboard, and see coverage gaps, short rests and overtime as you edit.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Schedule Matrix Table',
          description:
            'A schedule matrix with people as rows, days as columns and editable shift assignments, with coverage and rest checks.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/schedule-matrix-table',
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
        href: 'https://www.shad-table.dev/schedule-matrix-table',
      },
    ],
  }),
  component: ScheduleMatrixTablePage,
})
