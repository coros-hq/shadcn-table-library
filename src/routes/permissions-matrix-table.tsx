import { createFileRoute } from '@tanstack/react-router'
import { PermissionsMatrixTablePage } from '#/components/permissions-matrix/permissions-matrix-table-page'

export const Route = createFileRoute('/permissions-matrix-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Permissions Matrix Table — ShadTable' },
      {
        name: 'description',
        content:
          'Role permissions matrix for shadcn/ui and TanStack Table: resources as rows, actions as columns, with inherited, required and unavailable checkbox states.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Permissions Matrix Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Roles and access management grid with role inheritance, tri-state group and column toggles, and unsaved-change tracking.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Permissions Matrix Table',
          description:
            'A roles and access management matrix with inherited, required and unavailable permission states.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/permissions-matrix-table',
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
        href: 'https://www.shad-table.dev/permissions-matrix-table',
      },
    ],
  }),
  component: PermissionsMatrixTablePage,
})
