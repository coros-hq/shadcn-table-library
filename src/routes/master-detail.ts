import { createFileRoute } from '@tanstack/react-router'
import { MasterDetailPage } from '#/components/master-detail/master-detail-page'

export const Route = createFileRoute('/master-detail')({
  head: () => ({
    meta: [
      { title: 'Shadcn Master-Detail Table (Expandable Rows) — ShadTable' },
      {
        name: 'description',
        content:
          'Master-detail table for shadcn/ui and TanStack Table: expandable rows reveal details and a nested sub-table of line items.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Master-Detail Table (Expandable Rows) — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A table with expandable rows that reveal a nested detail sub-table, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Master-Detail Table',
          description:
            'A table with expandable rows that reveal a nested detail sub-table.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/master-detail',
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
        href: 'https://www.shad-table.dev/master-detail',
      },
    ],
  }),
  component: MasterDetailPage,
})
