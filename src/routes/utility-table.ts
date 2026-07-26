import { createFileRoute } from '@tanstack/react-router'
import { UtilityTablePage } from '#/components/utility/utility-table-page'

export const Route = createFileRoute('/utility-table')({
  component: UtilityTablePage,
})
