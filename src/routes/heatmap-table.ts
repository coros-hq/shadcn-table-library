import { createFileRoute } from '@tanstack/react-router'
import { HeatmapTablePage } from '#/components/heatmap/heatmap-table-page'

export const Route = createFileRoute('/heatmap-table')({
  component: HeatmapTablePage,
})
