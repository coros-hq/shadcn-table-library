import { createFileRoute } from '@tanstack/react-router'
import { ResizableTablePage } from '#/components/resizable-reorder/resizable-table-page'

export const Route = createFileRoute('/resizable-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table Resizable & Reorderable Columns — ShadTable' },
      {
        name: 'description',
        content:
          'Resizable and reorderable columns for shadcn/ui and TanStack Table, with the layout saved to localStorage.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table Resizable & Reorderable Columns — ShadTable',
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
          url: 'https://www.shad-table.dev/resizable-table',
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
        href: 'https://www.shad-table.dev/resizable-table',
      },
    ],
  }),
  component: ResizableTablePage,
})
