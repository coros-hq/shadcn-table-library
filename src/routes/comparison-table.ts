import { createFileRoute } from '@tanstack/react-router'
import { ComparisonTablePage } from '#/components/comparison/comparison-table-page'

export const Route = createFileRoute('/comparison-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Comparison Table — ShadTable' },
      {
        name: 'description',
        content:
          "A comparison table for shadcn/ui and TanStack Table. Pricing plans as table columns — feature rows compare booleans and values across every plan, with the recommended plan's column tinted to stand out.",
      },
      { property: 'og:title', content: 'Shadcn Comparison Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A pricing/feature comparison table with plans as columns and a highlighted recommended plan, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Comparison Table',
          description:
            'A pricing/feature comparison table with plans as columns and a highlighted recommended plan.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/comparison-table',
      },
    ],
  }),
  component: ComparisonTablePage,
})
