import { createFileRoute } from '@tanstack/react-router'
import { ExportConfigPage } from '#/components/export-config/export-config-page'

export const Route = createFileRoute('/export-config-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table Export to CSV & Excel — ShadTable' },
      {
        name: 'description',
        content:
          'A table with configurable CSV and Excel export for shadcn/ui and TanStack Table. A table whose Export button opens a dialog: filter by status, region, and date, pick columns and CSV or Excel, and see a live count of matching rows before downloading.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table Export to CSV & Excel — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Configurable table export for shadcn/ui and TanStack Table — filters, column selection, and format in one dialog with a live row count.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Export Configuration Table',
          description:
            'A table with an export dialog for choosing filters, columns, and format before downloading CSV or Excel.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/export-config-table',
      },
    ],
  }),
  component: ExportConfigPage,
})
