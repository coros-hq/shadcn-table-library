import { createFileRoute } from '@tanstack/react-router'
import { MasterDetailPage } from '#/components/master-detail/master-detail-page'

export const Route = createFileRoute('/master-detail')({
  head: () => ({
    meta: [
      { title: 'Master-Detail Table — ShadTable' },
      {
        name: 'description',
        content:
          "Expand an order to reveal its shipping address and a nested sub-table of line items — a full-width detail row rendered directly beneath the row that owns it.",
      },
      { property: 'og:title', content: 'Master-Detail Table — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shadcn-table-library.vercel.app/master-detail',
      },
    ],
  }),
  component: MasterDetailPage,
})
