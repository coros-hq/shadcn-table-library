import { createFileRoute } from '@tanstack/react-router'
import { getUsersPage } from '#/components/ssr/data'
import { ServerTablePage } from '#/components/ssr/pagination-example/server-table-page'

export const Route = createFileRoute('/server-table')({
  validateSearch: (search) => ({
    page: Number(search.page ?? 0),
    pageSize: Number(search.pageSize ?? 10),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getUsersPage({ data: deps }),
  component: ServerTablePage,
})
