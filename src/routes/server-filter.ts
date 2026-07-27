import { createFileRoute } from '@tanstack/react-router'
import { ServerFilterPage } from '#/components/ssr/filter-example/filter-page'
import { getUserPageWithFilter } from '#/components/ssr/data'

export const Route = createFileRoute('/server-filter')({
  head: () => ({
    meta: [
      { title: 'SSR Filter — ShadTable' },
      {
        name: 'description',
        content:
          'Filtering by column, resolved on the server the same way SSR Pagination resolves pages — every filter change is a real server request, not an in-memory slice.',
      },
      { property: 'og:title', content: 'SSR Filter — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shadcn-table-library.vercel.app/server-filter',
      },
    ],
  }),
  validateSearch: (search) => ({
    page: Number(search.page ?? 0),
    pageSize: Number(search.pageSize ?? 10),
    role: (search.role as string) ?? '',
    status: (search.status as string) ?? '',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUserPageWithFilter({ data: deps }),
  component: ServerFilterPage,
})
