import { createFileRoute } from '@tanstack/react-router'
import { ExportSelectedPage } from '#/components/v9/export-selected/export-selected-page'

export const Route = createFileRoute('/v9/export-selected-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Table — Export Selected Rows — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Export only selected rows to CSV or Excel from a shadcn/ui and TanStack Table table; selection persists across pages. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Table — Export Selected Rows — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Export only the rows you tick, across pages, to CSV or Excel. Built on shadcn/ui and TanStack Table row selection.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Export Selected Rows Table',
          description:
            'A table that exports only the selected rows to CSV or Excel, with selection that persists across pages.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/export-selected-table',
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
        href: 'https://www.shad-table.dev/v9/export-selected-table',
      },
    ],
  }),
  component: ExportSelectedPage,
})
