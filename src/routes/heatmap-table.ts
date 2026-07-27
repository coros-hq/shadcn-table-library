import { createFileRoute } from '@tanstack/react-router'
import { HeatmapTablePage } from '#/components/heatmap/heatmap-table-page'

export const Route = createFileRoute('/heatmap-table')({
  head: () => ({
    meta: [
      { title: 'Heatmap Table — ShadTable' },
      {
        name: 'description',
        content:
          "Revenue by region and month, with each cell's background intensity mapped to its value — spot patterns across a matrix at a glance instead of reading numbers.",
      },
      { property: 'og:title', content: 'Heatmap Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A matrix table with value-mapped cell background intensity for spotting patterns at a glance, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Heatmap Table',
          description:
            'A matrix table with value-mapped cell background intensity for spotting patterns at a glance.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/heatmap-table',
      },
    ],
  }),
  component: HeatmapTablePage,
})
