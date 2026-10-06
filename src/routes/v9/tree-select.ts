import { createFileRoute } from '@tanstack/react-router'
import { TreeSelectPage } from '#/components/v9/tree-select/tree-select-page'

export const Route = createFileRoute('/v9/tree-select')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Tree Table with Checkbox Selection — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Tree table with checkbox selection for shadcn/ui and TanStack Table: cascading selection and indeterminate parents. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Tree Table with Checkbox Selection — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A hierarchical tree table with cascading checkbox selection and indeterminate state, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Tree Table Checkbox Selection',
          description:
            'A hierarchical tree table with cascading checkbox selection and indeterminate state.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/tree-select',
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
        href: 'https://www.shad-table.dev/v9/tree-select',
      },
    ],
  }),
  component: TreeSelectPage,
})
