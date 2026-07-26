import { createFileRoute } from '@tanstack/react-router'
import { ServerFilterPage } from '#/components/ssr/filter-example/filter-page'
import { getUserPageWithFilter } from '#/components/ssr/data'

export const Route = createFileRoute('/server-filter')({
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
