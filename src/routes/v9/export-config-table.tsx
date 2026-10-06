import { createFileRoute } from '@tanstack/react-router'
import { ExportConfigPage } from '#/components/v9/export-config/export-config-page'

export const Route = createFileRoute('/v9/export-config-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Table Export to CSV & Excel — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Export a shadcn/ui table to CSV or Excel: choose rows by filter, pick columns, and see a live row count before you download. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Table Export to CSV & Excel — TanStack Table v9 — ShadTable',
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
          url: 'https://www.shad-table.dev/v9/export-config-table',
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
        href: 'https://www.shad-table.dev/v9/export-config-table',
      },
    ],
  }),
  component: ExportConfigPage,
})
