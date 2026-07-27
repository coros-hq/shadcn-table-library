import { createFileRoute } from '@tanstack/react-router'
import { UtilityTablePage } from '#/components/utility/utility-table-page'

export const Route = createFileRoute('/utility-table')({
  head: () => ({
    meta: [
      { title: 'Density & Export — ShadTable' },
      {
        name: 'description',
        content:
          'One table, three modes: a compact/comfortable/spacious density toggle, CSV/Excel/PDF export, and a print-optimized view that ignores dark mode entirely.',
      },
      { property: 'og:title', content: 'Density & Export — ShadTable' },
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
        href: 'https://shad-table.dev/utility-table',
      },
    ],
  }),
  component: UtilityTablePage,
})
