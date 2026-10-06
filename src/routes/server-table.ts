import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { getUsersPage } from '#/components/ssr/data'
import { ServerTablePage } from '#/components/ssr/pagination-example/server-table-page'

export const Route = createFileRoute('/server-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Server-Side Pagination Table — ShadTable' },
      {
        name: 'description',
        content:
          "Server-side pagination table for shadcn/ui and TanStack Table: only the current page's rows are sent to the browser.",
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
          url: 'https://www.shad-table.dev/server-table',
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
        href: 'https://www.shad-table.dev/server-table',
      },
    ],
  }),
  validateSearch: (search) => ({
    page: Number(search.page ?? 0),
    pageSize: Number(search.pageSize ?? 10),
  }),
  // (cast: the middleware's generics can't see the schema validateSearch infers)
  // Default values are dropped from the URL, so /server-table is its own canonical
  // address instead of redirecting to ?page=0&pageSize=10…
  search: {
    middlewares: [stripSearchParams({ page: 0, pageSize: 10 }) as never],
  },
  // The data is the same for everyone, so let the CDN serve repeat requests
  headers: () => ({
    'Cache-Control':
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUsersPage({ data: deps }),
  component: ServerTablePage,
})
