import { createFileRoute } from '@tanstack/react-router'
import { TreeSelectPage } from '#/components/tree-select/tree-select-page'

export const Route = createFileRoute('/tree-select')({
  head: () => ({
    meta: [
      { title: 'Tree Table — Checkbox Selection — ShadTable' },
      {
        name: 'description',
        content:
          'The same department/team/employee tree, with a checkbox column that cascades selection to every descendant and reports indeterminate state for partial branches.',
      },
      {
        property: 'og:title',
        content: 'Tree Table — Checkbox Selection — ShadTable',
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/tree-select',
      },
    ],
  }),
  component: TreeSelectPage,
})
