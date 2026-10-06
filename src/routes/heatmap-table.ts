import { createFileRoute } from '@tanstack/react-router'
import { HeatmapTablePage } from '#/components/heatmap/heatmap-table-page'

export const Route = createFileRoute('/heatmap-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Heatmap Table — ShadTable' },
      {
        name: 'description',
        content:
          'Heatmap table for shadcn/ui and TanStack Table: cell color intensity follows the value, so patterns show at a glance.',
      },
      { property: 'og:title', content: 'Shadcn Heatmap Table — ShadTable' },
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
          url: 'https://www.shad-table.dev/heatmap-table',
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
        href: 'https://www.shad-table.dev/heatmap-table',
      },
    ],
  }),
  component: HeatmapTablePage,
})
