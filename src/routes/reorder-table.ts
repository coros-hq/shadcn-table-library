import { createFileRoute } from '@tanstack/react-router'
import { ReorderableTablePage } from '#/components/reorder/reorder-table-page'

export const Route = createFileRoute('/reorder-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Drag-and-Drop Reorderable Table — ShadTable' },
      {
        name: 'description',
        content:
          'Drag-and-drop reorderable table for shadcn/ui and TanStack Table, built on @dnd-kit/sortable.',
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
          url: 'https://www.shad-table.dev/reorder-table',
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
        href: 'https://www.shad-table.dev/reorder-table',
      },
    ],
  }),
  component: ReorderableTablePage,
})
