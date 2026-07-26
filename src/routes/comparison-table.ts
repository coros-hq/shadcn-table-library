import { createFileRoute } from '@tanstack/react-router'
import { ComparisonTablePage } from '#/components/comparison/comparison-table-page'

export const Route = createFileRoute('/comparison-table')({
  component: ComparisonTablePage,
})
