import { createFileRoute } from '@tanstack/react-router'
import { TreeReorderPage } from '#/components/tree-reorder/tree-reorder-page'

export const Route = createFileRoute('/tree-reorder')({
  head: () => ({
    meta: [
      { title: 'Shadcn Tree Table with Drag Reorder — ShadTable' },
      {
        name: 'description',
        content:
          "A drag-and-drop tree table for shadcn/ui and TanStack Table. The same department/team/employee tree, with rows draggable by a handle — reordering is scoped to siblings so a department can't be dropped inside a team.",
      },
      {
        property: 'og:title',
        content: 'Shadcn Tree Table with Drag Reorder — ShadTable',
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/tree-reorder',
      },
    ],
  }),
  component: TreeReorderPage,
})
