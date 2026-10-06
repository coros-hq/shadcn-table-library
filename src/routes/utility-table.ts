import { createFileRoute } from '@tanstack/react-router'
import { UtilityTablePage } from '#/components/utility/utility-table-page'

export const Route = createFileRoute('/utility-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table Density Toggle & Export — ShadTable' },
      {
        name: 'description',
        content:
          'Table density toggle and CSV, Excel or PDF export for shadcn/ui and TanStack Table, with a print-friendly view.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table Density Toggle & Export — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A table with a density toggle, CSV/Excel/PDF export, and a print-optimized view, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Density & Export Table',
          description:
            'A table with a density toggle, CSV/Excel/PDF export, and a print-optimized view.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/utility-table',
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
        href: 'https://www.shad-table.dev/utility-table',
      },
    ],
  }),
  component: UtilityTablePage,
})
