import { createFileRoute } from '@tanstack/react-router'
import { AnomalyInvestigationTablePage } from '#/components/anomaly-investigation/anomaly-investigation-table-page'
import type { AnomalyExample } from '#/components/anomaly-investigation/anomaly-investigation-table-page'

export const Route = createFileRoute('/anomaly-investigation-table')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { example?: AnomalyExample } => ({
    // Unknown keys survive validation, so an invalid value must be cleared
    // explicitly rather than left out
    example: search.example === 'finance' ? 'finance' : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Shadcn Anomaly Investigation Table — ShadTable' },
      {
        name: 'description',
        content:
          'Anomaly table for shadcn/ui and TanStack Table: actual values against expected ranges, spikes and drops flagged, history on expand, reviews.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Anomaly Investigation Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Metrics against their expected ranges with spikes and drops flagged, two weeks of history per metric, and a review queue.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Anomaly Investigation Table',
          description:
            'A table of metrics against expected ranges with flagged spikes and drops, expandable history and review status.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/anomaly-investigation-table',
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
        href: 'https://www.shad-table.dev/anomaly-investigation-table',
      },
    ],
  }),
  component: AnomalyInvestigationTablePage,
})
