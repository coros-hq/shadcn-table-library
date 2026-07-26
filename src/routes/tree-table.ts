import { createFileRoute } from '@tanstack/react-router'
import { TreeTablePage } from '#/components/tree/tree-table-page'

export const Route = createFileRoute('/tree-table')({
  component: TreeTablePage,
})
