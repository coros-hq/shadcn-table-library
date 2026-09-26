import { createFileRoute } from '@tanstack/react-router'
import { ReorderableTablePage } from '#/components/reorder/reorder-table-page'

export const Route = createFileRoute('/reorder-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Drag-and-Drop Reorderable Table — ShadTable' },
      {
        name: 'description',
        content:
          'A drag-and-drop reorderable table for shadcn/ui and TanStack Table. Drag rows to reorder them, built on @dnd-kit/sortable rather than any table-specific drag logic.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Drag-and-Drop Reorderable Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A table with drag-to-reorder rows powered by @dnd-kit/sortable, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Reorderable Table',
          description:
            'A table with drag-to-reorder rows powered by @dnd-kit/sortable.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/reorder-table',
      },
    ],
  }),
  component: ReorderableTablePage,
})
