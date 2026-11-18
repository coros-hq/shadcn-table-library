import { createFileRoute } from '@tanstack/react-router'
import { DraftRowsTablePage } from '#/components/draft-rows/draft-rows-table-page'

export const Route = createFileRoute('/draft-rows-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table with Draft Rows — ShadTable' },
      {
        name: 'description',
        content:
          'Table with draft rows for shadcn/ui and TanStack Table: add several rows inline, validate them as you type, then save or discard the batch.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table with Draft Rows — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Type new rows straight into a table, fix what is flagged, and save or discard them together. Shown as an expense report.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Draft Rows Table',
          description:
            'A table where new rows are added inline as drafts, validated, and saved or discarded as one batch.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/draft-rows-table',
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
        href: 'https://www.shad-table.dev/draft-rows-table',
      },
    ],
  }),
  component: DraftRowsTablePage,
})
