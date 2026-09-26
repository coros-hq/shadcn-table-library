import { createFileRoute } from '@tanstack/react-router'
import { EditableTablePage } from '#/components/editable/editable-table-page'

export const Route = createFileRoute('/editable-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Editable Table (Inline Editing) — ShadTable' },
      {
        name: 'description',
        content:
          'An editable data table for shadcn/ui and TanStack Table. Click a cell to edit it inline. Edits validate on commit, apply optimistically, roll back on a simulated failure, and can be undone one at a time.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Editable Table (Inline Editing) — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'An inline-editable table with optimistic updates, validation, rollback, and undo, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Editable Table',
          description:
            'An inline-editable table with optimistic updates, validation, rollback, and undo.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/editable-table',
      },
    ],
  }),
  component: EditableTablePage,
})
