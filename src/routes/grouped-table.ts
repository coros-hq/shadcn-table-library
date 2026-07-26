import { createFileRoute } from '@tanstack/react-router'
import { GroupedTablePage } from '#/components/grouped/grouped-table-page'

export const Route = createFileRoute('/grouped-table')({
  component: GroupedTablePage,
})
