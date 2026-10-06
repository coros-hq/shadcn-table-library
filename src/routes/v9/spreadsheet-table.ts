import { createFileRoute } from '@tanstack/react-router'
import { SpreadsheetPage } from '#/components/v9/spreadsheet/spreadsheet-page'

export const Route = createFileRoute('/v9/spreadsheet-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Excel-like Spreadsheet Table — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Excel-like spreadsheet table for shadcn/ui and TanStack Table: keyboard navigation, ranges, copy and paste, SUM and AVERAGE formulas. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Excel-like Spreadsheet Table — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A spreadsheet grid for shadcn/ui with formulas, cell references, range selection, and clipboard support.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Spreadsheet Table',
          description:
            'An Excel-like table with keyboard navigation, range selection, copy and paste, and a small formula engine.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/spreadsheet-table',
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
        href: 'https://www.shad-table.dev/v9/spreadsheet-table',
      },
    ],
  }),
  component: SpreadsheetPage,
})
