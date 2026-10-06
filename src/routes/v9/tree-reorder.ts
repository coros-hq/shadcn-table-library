import { createFileRoute } from '@tanstack/react-router'
import { TreeReorderPage } from '#/components/v9/tree-reorder/tree-reorder-page'

export const Route = createFileRoute('/v9/tree-reorder')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Tree Table with Drag Reorder — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Drag-and-drop tree table for shadcn/ui and TanStack Table: reorder rows among siblings with a drag handle. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Tree Table with Drag Reorder — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A hierarchical tree table with sibling-scoped drag-to-reorder rows, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Tree Table Reorder',
          description:
            'A hierarchical tree table with sibling-scoped drag-to-reorder rows.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/tree-reorder',
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
        href: 'https://www.shad-table.dev/v9/tree-reorder',
      },
    ],
  }),
  component: TreeReorderPage,
})
