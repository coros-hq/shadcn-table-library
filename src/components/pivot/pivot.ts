export type SalesRecord = {
  region: string
  quarter: string
  channel: string
  amount: number
}

export type AggregationType = 'sum' | 'avg' | 'count'

export function aggregate(
  records: SalesRecord[],
  aggFn: AggregationType,
): number {
  if (aggFn === 'count') return records.length
  if (records.length === 0) return 0
  const total = records.reduce((sum, r) => sum + r.amount, 0)
  return aggFn === 'avg' ? total / records.length : total
}

export interface PivotRow {
  rowValue: string
  cells: Record<string, number>
  total: number
}

export interface PivotResult {
  colValues: string[]
  rows: PivotRow[]
  columnTotals: Record<string, number>
  grandTotal: number
}

export function pivotData(
  data: SalesRecord[],
  rowKey: keyof SalesRecord,
  colKey: keyof SalesRecord,
  aggFn: AggregationType,
): PivotResult {
  const rowValues = Array.from(new Set(data.map((d) => String(d[rowKey])))).sort()
  const colValues = Array.from(new Set(data.map((d) => String(d[colKey])))).sort()

  const rows: PivotRow[] = rowValues.map((rowValue) => {
    const rowRecords = data.filter((d) => String(d[rowKey]) === rowValue)
    const cells: Record<string, number> = {}
    for (const colValue of colValues) {
      cells[colValue] = aggregate(
        rowRecords.filter((d) => String(d[colKey]) === colValue),
        aggFn,
      )
    }
    return { rowValue, cells, total: aggregate(rowRecords, aggFn) }
  })

  const columnTotals: Record<string, number> = {}
  for (const colValue of colValues) {
    columnTotals[colValue] = aggregate(
      data.filter((d) => String(d[colKey]) === colValue),
      aggFn,
    )
  }

  return { colValues, rows, columnTotals, grandTotal: aggregate(data, aggFn) }
}
