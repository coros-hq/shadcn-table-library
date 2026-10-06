import type { ColumnDef } from '@tanstack/vue-table'
import { COLS } from './formula'
import type { CellView } from './formula'

export type SheetRow = {
  n: number
  cells: CellView[]
}

export const columns: ColumnDef<SheetRow>[] = [
  { id: 'n', header: '', cell: ({ row }) => row.original.n },
  ...COLS.map(
    (id, i): ColumnDef<SheetRow> => ({
      id,
      header: id,
      accessorFn: (row) => row.cells[i].text,
      cell: ({ getValue }) => getValue<string>(),
    }),
  ),
]
