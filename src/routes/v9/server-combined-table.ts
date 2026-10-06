import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { getUsersPageCombined } from '#/components/ssr/data'
import { ServerCombinedTablePage } from '#/components/v9/ssr/combined-example/server-combined-table-page'

export const Route = createFileRoute('/v9/server-combined-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Server Sort, Filter, Pagination — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Server-side sorting, filtering and pagination for shadcn/ui and TanStack Table, all driven from one URL. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Server Sort, Filter, Pagination — TanStack Table v9 — ShadTable',
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
          url: 'https://www.shad-table.dev/v9/server-combined-table',
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
        href: 'https://www.shad-table.dev/v9/server-combined-table',
      },
    ],
  }),
  validateSearch: (
    search,
  ): {
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
  // (cast: the middleware's generics can't see the schema validateSearch infers)
  // Default values are dropped from the URL, so /server-combined-table is its own canonical
  // address instead of redirecting to ?page=0&pageSize=10…
  search: {
    middlewares: [
      stripSearchParams({
        page: 0,
        pageSize: 10,
        role: '',
        status: '',
        sortBy: '',
        sortDir: 'asc',
      }) as never,
    ],
  },
  // The data is the same for everyone, so let the CDN serve repeat requests
  headers: () => ({
    'Cache-Control':
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUsersPageCombined({ data: deps }),
  component: ServerCombinedTablePage,
})
