import { createFileRoute } from '@tanstack/react-router'
import { ReorderableTablePage } from '#/components/reorder/reorder-table-page'

export const Route = createFileRoute('/reorder-table')({
  head: () => ({
    meta: [
      { title: 'Reorderable Table — ShadTable' },
      {
        name: 'description',
        content:
          'Drag rows to reorder them, and drag column headers to reorder columns, both built on @dnd-kit/sortable rather than any table-specific drag logic.',
      },
      { property: 'og:title', content: 'Reorderable Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A table with drag-to-reorder rows and columns powered by @dnd-kit/sortable, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Reorderable Table',
          description:
            'A table with drag-to-reorder rows and columns powered by @dnd-kit/sortable.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shadcn-table-library.vercel.app/reorder-table',
      },
    ],
  }),
  component: ReorderableTablePage,
})
