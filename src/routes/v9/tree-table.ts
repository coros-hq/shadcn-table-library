import { createFileRoute } from '@tanstack/react-router'
import { TreeTablePage } from '#/components/v9/tree/tree-table-page'

export const Route = createFileRoute('/v9/tree-table')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { example?: 'variants' | 'detail' } => ({
    // Unknown keys survive validation, so an invalid value must be cleared
    // explicitly rather than left out
    example:
      search.example === 'variants' || search.example === 'detail'
        ? search.example
        : undefined,
  }),
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Tree Table (Nested Rows) — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Tree table for shadcn/ui and TanStack Table: nested rows, expand/collapse, sorting, search, product variants and a detail card. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Tree Table (Nested Rows) — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A hierarchical table for nested data with expand/collapse, sorting, and ancestor-aware search, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Tree Table',
          description:
            'A hierarchical table for nested data with expand/collapse, sorting, and ancestor-aware search.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/tree-table',
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
        href: 'https://www.shad-table.dev/v9/tree-table',
      },
    ],
  }),
  component: TreeTablePage,
})
