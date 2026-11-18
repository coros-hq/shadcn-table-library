import { Fragment, useMemo } from 'react'
import { FolderOpen } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ExpandedState,
  OnChangeFn,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import { columns } from './columns'
import type { BrowserMeta } from './columns'
import type { FolderEntry } from './data'
import { FileDetails } from './file-details'
import { sortEntries } from './files'
import type { SortKey } from './files'

// Secondary columns step aside on small screens; the details row has them
const responsive: Record<string, string> = {
  kind: 'hidden md:table-cell',
  owner: 'hidden lg:table-cell',
  modified: 'hidden sm:table-cell',
}

export interface BrowserState {
  sorting: SortingState
  rowSelection: RowSelectionState
  expanded: ExpandedState
}

export function FileTable({
  folder,
  path,
  state,
  onSortingChange,
  onRowSelectionChange,
  onExpandedChange,
  meta,
}: {
  folder: FolderEntry
  /** The folders from the root to `folder`, for the details' location */
  path: FolderEntry[]
  state: BrowserState
  onSortingChange: OnChangeFn<SortingState>
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onExpandedChange: OnChangeFn<ExpandedState>
  meta: BrowserMeta
}) {
  // Sorted here rather than by TanStack, so folders stay on top either way
  const entries = useMemo(() => {
    const sort = state.sorting.at(0)
    return sortEntries(
      folder.children,
      sort
        ? { id: sort.id as SortKey, desc: sort.desc }
        : { id: 'name', desc: false },
    )
  }, [folder, state.sorting])

  const table = useReactTable({
    data: entries,
    columns,
    getRowId: (entry) => entry.id,
    getRowCanExpand: (row) => row.original.kind === 'file',
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualSorting: true,
    enableMultiSort: false,
    state,
    onSortingChange,
    onRowSelectionChange,
    onExpandedChange,
    meta,
  })

  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  aria-sort={
                    header.column.getIsSorted() === 'asc'
                      ? 'ascending'
                      : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : undefined
                  }
                  className={cn(
                    responsive[header.column.id],
                    header.column.id === 'select' && 'w-10',
                    header.column.id === 'size' && 'w-28',
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className={cn(row.getIsExpanded() && 'border-b-0')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        responsive[cell.column.id],
                        cell.column.id === 'name' && 'max-w-0 w-full',
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && row.original.kind === 'file' ? (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={columns.length - 1}>
                      <FileDetails file={row.original} path={path} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-40">
                <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                  <FolderOpen aria-hidden className="size-6" />
                  This folder is empty
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
