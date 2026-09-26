import { createFileRoute } from '@tanstack/react-router'
import { ExportSelectedPage } from '#/components/export-selected/export-selected-page'

export const Route = createFileRoute('/export-selected-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table — Export Selected Rows — ShadTable' },
      {
        name: 'description',
        content:
          'A table that exports selected rows for shadcn/ui and TanStack Table. A table with row checkboxes that exports only the selected rows to CSV or Excel. Selection persists across pages, with a page-level select-all and a "Select all" shortcut.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table — Export Selected Rows — ShadTable',
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/export-selected-table',
      },
    ],
  }),
  component: ExportSelectedPage,
})
