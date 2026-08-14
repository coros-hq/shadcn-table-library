import { createFileRoute } from '@tanstack/react-router'
import { getUsersPageCombined } from '#/components/ssr/data'
import { ServerCombinedTablePage } from '#/components/ssr/combined-example/server-combined-table-page'

export const Route = createFileRoute('/server-combined-table')({
  head: () => ({
    meta: [
      { title: 'SSR Sort + Filter + Pagination — ShadTable' },
      {
        name: 'description',
        content:
          'Sorting, filtering, and pagination all resolved together on the server from one URL, instead of three separate demos — the way real dashboards actually work.',
      },
      {
        property: 'og:title',
        content: 'SSR Sort + Filter + Pagination — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A server-driven table combining sort, filter, and pagination in a single request, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'SSR Sort + Filter + Pagination Table',
          description:
            'A server-driven table combining sort, filter, and pagination in a single request.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/server-combined-table',
      },
    ],
  }),
  validateSearch: (search): {
    page: number
    pageSize: number
    role: string
    status: string
    sortBy: string
    sortDir: 'asc' | 'desc'
  } => ({
    page: Number(search.page ?? 0),
    pageSize: Number(search.pageSize ?? 10),
    role: (search.role as string) ?? '',
    status: (search.status as string) ?? '',
    sortBy: (search.sortBy as string) ?? '',
    sortDir: (search.sortDir as string) === 'desc' ? 'desc' : 'asc',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUsersPageCombined({ data: deps }),
  component: ServerCombinedTablePage,
})
