import { createFileRoute } from '@tanstack/react-router'
import { ReorderableTablePage } from '#/components/reorder/reorder-table-page'

export const Route = createFileRoute('/reorder-table')({
  component: ReorderableTablePage,
})
