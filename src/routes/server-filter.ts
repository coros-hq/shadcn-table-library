import { createFileRoute } from '@tanstack/react-router'
import { ServerFilterPage } from '#/components/ssr/filter-example/filter-page'

export const Route = createFileRoute('/server-filter')({
  component: ServerFilterPage,
})
