import { createFileRoute } from '@tanstack/react-router'
import { BuilderPage } from '#/components/builder/builder-page'

export const Route = createFileRoute('/builder')({
  validateSearch: (search: Record<string, unknown>): { t?: string } => ({
    // Unknown keys survive validation, so a bad value must be cleared
    // explicitly rather than left out
    t: typeof search.t === 'string' ? search.t : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Shadcn Table Builder — ShadTable' },
      {
        name: 'description',
        content:
          'Build a shadcn/ui and TanStack Table: add and name your own columns, set filters, sorting and pagination, then copy the generated code.',
      },
      { property: 'og:title', content: 'Shadcn Table Builder — ShadTable' },
      {
        property: 'og:description',
        content:
          'Add your own columns, set up Notion-style filters and features, preview the table live, and copy the generated shadcn/ui and TanStack Table code.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://www.shad-table.dev/builder' }],
  }),
  component: BuilderPage,
})
