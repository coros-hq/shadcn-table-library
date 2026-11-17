import { createFileRoute } from '@tanstack/react-router'
import { CsvImportTablePage } from '#/components/csv-import/csv-import-table-page'

export const Route = createFileRoute('/csv-import-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn CSV Import Review Table — ShadTable' },
      {
        name: 'description',
        content:
          'CSV import review table for shadcn/ui and TanStack Table: map columns to fields, highlight invalid cells, flag duplicates and fix rows before importing.',
      },
      {
        property: 'og:title',
        content: 'Shadcn CSV Import Review Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Review an uploaded CSV before importing customers or products: column mapping in the header, inline fixes, duplicate detection and skip controls.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'CSV Import Review Table',
          description:
            'A CSV import review table with column mapping, cell validation, duplicate detection and inline fixes.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/csv-import-table',
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
      { rel: 'canonical', href: 'https://www.shad-table.dev/csv-import-table' },
    ],
  }),
  component: CsvImportTablePage,
})
