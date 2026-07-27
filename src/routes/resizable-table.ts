import { createFileRoute } from '@tanstack/react-router'
import { ResizableTablePage } from '#/components/resizable-reorder/resizable-table-page'

export const Route = createFileRoute('/resizable-table')({
  head: () => ({
    meta: [
      { title: 'Resizable / Reorderable Columns — ShadTable' },
      {
        name: 'description',
        content:
          "Drag a header's grip to reorder columns, drag its right edge to resize — the resulting layout is saved to localStorage and restored on your next visit.",
      },
      {
        property: 'og:title',
        content: 'Resizable / Reorderable Columns — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A table with drag-to-resize and drag-to-reorder columns that persist to localStorage, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Resizable / Reorderable Columns Table',
          description:
            'A table with drag-to-resize and drag-to-reorder columns that persist to localStorage.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/resizable-table',
      },
    ],
  }),
  component: ResizableTablePage,
})
