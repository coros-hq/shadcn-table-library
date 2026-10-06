import type { ColumnDef } from '@tanstack/react-table-v9'
import type { V9Features } from '#/lib/table-v9-features.ts'
import { COLS } from './formula'
import type { CellView } from './formula'

export type SheetRow = {
  n: number
  cells: CellView[]
}

export const columns: ColumnDef<V9Features, SheetRow>[] = [
  { id: 'n', header: '', cell: ({ row }) => row.original.n },
  ...COLS.map((id, i): ColumnDef<V9Features, SheetRow> => ({
    id,
    header: id,
    accessorFn: (row) => row.cells[i].text,
    cell: ({ getValue }) => getValue<string>(),
  })),
]
