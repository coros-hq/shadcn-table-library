import { createFileRoute } from '@tanstack/react-router'
import { getUsersPage } from '#/components/ssr/data'
import { ServerTablePage } from '#/components/ssr/pagination-example/server-table-page'

export const Route = createFileRoute('/server-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Server-Side Pagination Table — ShadTable' },
      {
        name: 'description',
        content:
          "A server-side pagination table for shadcn/ui and TanStack Table. Only the current page's rows are ever sent to the browser — changing pages triggers a real server request instead of slicing an in-memory array.",
      },
      {
        property: 'og:title',
        content: 'Shadcn Server-Side Pagination Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A server-paginated table where only the current page is fetched, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'SSR Pagination Table',
          description:
            'A server-paginated table where only the current page is fetched.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/server-table',
      },
    ],
  }),
  validateSearch: (search) => ({
    page: Number(search.page ?? 0),
    pageSize: Number(search.pageSize ?? 10),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUsersPage({ data: deps }),
  component: ServerTablePage,
})
