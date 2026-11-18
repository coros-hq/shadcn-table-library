import { createFileRoute } from '@tanstack/react-router'
import { SplitDetailTablePage } from '#/components/split-detail/split-detail-table-page'

export const Route = createFileRoute('/split-detail-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Split Detail Panel Table — ShadTable' },
      {
        name: 'description',
        content:
          'Table with a split detail panel for shadcn/ui and TanStack Table: open a record beside the table, edit it, and step through records in place.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Split Detail Panel Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A support ticket queue where each ticket opens in a side panel, keeping the table filter, sort, page and scroll as they were.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Split Detail Panel Table',
          description:
            'A table with a side panel that shows and edits the selected record while the table stays visible.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/split-detail-table',
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
        href: 'https://www.shad-table.dev/split-detail-table',
      },
    ],
  }),
  component: SplitDetailTablePage,
})
