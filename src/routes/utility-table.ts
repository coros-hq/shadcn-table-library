import { createFileRoute } from '@tanstack/react-router'
import { UtilityTablePage } from '#/components/utility/utility-table-page'

export const Route = createFileRoute('/utility-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table Density Toggle & Export — ShadTable' },
      {
        name: 'description',
        content:
          'A table with a density toggle and export for shadcn/ui and TanStack Table. One table, three modes: a compact/comfortable/spacious density toggle, CSV/Excel/PDF export, and a print-optimized view that ignores dark mode entirely.',
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
