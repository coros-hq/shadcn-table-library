import { createFileRoute } from '@tanstack/react-router'
import { JobQueueTablePage } from '#/components/job-queue/job-queue-table-page'

export const Route = createFileRoute('/job-queue-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Job Queue Table — ShadTable' },
      {
        name: 'description',
        content:
          'Job queue table for shadcn/ui and TanStack Table: live progress, attempts, duration, expandable errors with stack traces, and retry or cancel actions.',
      },
      { property: 'og:title', content: 'Shadcn Job Queue Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'Background jobs in a table: progress bars, automatic retries with backoff, attempt history with errors, and retry or cancel per job.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Job Queue Table',
          description:
            'A background job queue table with live progress, retries, expandable errors and retry or cancel actions.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/job-queue-table',
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
      { rel: 'canonical', href: 'https://www.shad-table.dev/job-queue-table' },
    ],
  }),
  component: JobQueueTablePage,
})
