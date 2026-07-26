import { createFileRoute } from '@tanstack/react-router'
import { PivotTablePage } from '#/components/pivot/pivot-table-page'

export const Route = createFileRoute('/pivot-table')({
  component: PivotTablePage,
})
