import { createFileRoute } from '@tanstack/react-router'
import { KpiTablePage } from '#/components/kpi/kpi-table-page'

export const Route = createFileRoute('/kpi-table')({
  component: KpiTablePage,
})
