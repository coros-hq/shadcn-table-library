import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { ServerFilterPage } from '#/components/v9/ssr/filter-example/filter-page'
import { getUserPageWithFilter } from '#/components/ssr/data'

export const Route = createFileRoute('/v9/server-filter')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Server-Side Filtering Table — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Server-side filtering table for shadcn/ui and TanStack Table: every filter change is a real server request, driven by the URL. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Server-Side Filtering Table — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A server-filtered table where column filters are resolved on the server, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'SSR Filter Table',
          description:
            'A server-filtered table where column filters are resolved on the server.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/server-filter',
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
        href: 'https://www.shad-table.dev/v9/server-filter',
      },
    ],
  }),
  validateSearch: (search) => ({
    page: Number(search.page ?? 0),
    pageSize: Number(search.pageSize ?? 10),
    role: (search.role as string) ?? '',
    status: (search.status as string) ?? '',
  }),
  // (cast: the middleware's generics can't see the schema validateSearch infers)
  // Default values are dropped from the URL, so /server-filter is its own canonical
  // address instead of redirecting to ?page=0&pageSize=10…
  search: {
    middlewares: [
      stripSearchParams({
        page: 0,
        pageSize: 10,
        role: '',
        status: '',
      }) as never,
    ],
  },
  // The data is the same for everyone, so let the CDN serve repeat requests
  headers: () => ({
    'Cache-Control':
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUserPageWithFilter({ data: deps }),
  component: ServerFilterPage,
})
