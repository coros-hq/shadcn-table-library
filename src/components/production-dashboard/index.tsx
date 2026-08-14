import { columns, type ProductionLine } from './columns'
import { DataTable } from './data-table'

const data: ProductionLine[] = [
  {
    id: '1',
    line: 'Line A — Assembly',
    shift: 'Day shift',
    status: 'Running',
    outputToday: 1420,
    targetOutput: 1200,
    utilizationPct: 94,
    trend: [1080, 1120, 1150, 1180, 1260, 1340, 1420],
  },
  {
    id: '2',
    line: 'Line B — Packaging',
    shift: 'Day shift',
    status: 'Running',
    outputToday: 980,
    targetOutput: 1100,
    utilizationPct: 78,
    trend: [1100, 1080, 1020, 990, 970, 985, 980],
  },
  {
    id: '3',
    line: 'Line C — Welding',
    shift: 'Night shift',
    status: 'Down',
    outputToday: 210,
    targetOutput: 950,
    utilizationPct: 22,
    trend: [900, 890, 860, 700, 520, 300, 210],
  },
  {
    id: '4',
    line: 'Line D — Paint Booth',
    shift: 'Day shift',
    status: 'Maintenance',
    outputToday: 340,
    targetOutput: 800,
    utilizationPct: 41,
    trend: [780, 760, 700, 640, 500, 400, 340],
  },
  {
    id: '5',
    line: 'Line E — Final QC',
    shift: 'Day shift',
    status: 'Running',
    outputToday: 610,
    targetOutput: 600,
    utilizationPct: 88,
    trend: [560, 570, 585, 590, 600, 605, 610],
  },
  {
    id: '6',
    line: 'Line F — CNC Mill',
    shift: 'Night shift',
    status: 'Idle',
    outputToday: 0,
    targetOutput: 500,
    utilizationPct: 0,
    trend: [480, 460, 440, 200, 50, 0, 0],
  },
  {
    id: '7',
    line: 'Line G — Injection Mold',
    shift: 'Day shift',
    status: 'Running',
    outputToday: 2150,
    targetOutput: 1800,
    utilizationPct: 97,
    trend: [1700, 1750, 1820, 1900, 2000, 2080, 2150],
  },
  {
    id: '8',
    line: 'Line H — Labeling',
    shift: 'Night shift',
    status: 'Running',
    outputToday: 730,
    targetOutput: 900,
    utilizationPct: 65,
    trend: [880, 850, 820, 790, 760, 745, 730],
  },
]

export function ProductionDashboardTableDemo() {
  return <DataTable columns={columns} data={data} />
}
