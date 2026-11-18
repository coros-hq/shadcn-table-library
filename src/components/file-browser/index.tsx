import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ChevronRight, Download, Trash2, X } from 'lucide-react'
import type {
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'

import { Button } from '#/components/ui/button'
import { root as initialRoot } from './data'
import type { FolderEntry } from './data'
import { FileTable } from './data-table'
import { childToward, findPath, formatSize, removeIds, sizeOf } from './files'

export function FileBrowserDemo() {
  const [tree, setTree] = useState<FolderEntry>(initialRoot)
  const [folderId, setFolderId] = useState('all-files/marketing')
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [message, setMessage] = useState('')

  const nav = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  // Where focus goes once the new folder has rendered
  const focusNext = useRef<string | null>(null)

  // A deleted folder can't stay open: fall back to the root
  const path = findPath(tree, folderId) ?? [tree]
  const folder = path[path.length - 1]

  useEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = null
    const el =
      target === 'crumb'
        ? nav.current?.querySelector<HTMLElement>('[aria-current="page"]')
        : frame.current?.querySelector<HTMLElement>(`[data-entry="${target}"]`)
    el?.focus()
  })

  /**
   * Opening a folder focuses its name in the breadcrumbs. Going back up
   * focuses the folder you came out of, so you keep your place.
   */
  function open(id: string) {
    if (id === folder.id) return
    focusNext.current = folder.id.startsWith(`${id}/`)
      ? childToward(id, folder.id)
      : 'crumb'
    setFolderId(id)
    // Selection and open details belong to the folder you were in
    setRowSelection({})
    setExpanded({})
    setMessage('')
  }

  const selected = folder.children.filter((c) => rowSelection[c.id])
  const selectedSize = selected.reduce((sum, e) => sum + sizeOf(e), 0)
  const parent = path.at(-2)

  function remove() {
    const n = selected.length
    setTree(removeIds(tree, new Set(selected.map((e) => e.id))))
    setRowSelection({})
    setMessage(`Deleted ${n} ${n === 1 ? 'item' : 'items'}.`)
  }

  return (
    <div ref={frame} className="space-y-3">
      <div className="flex min-h-9 flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!parent}
          aria-label={parent ? `Up to ${parent.name}` : 'Already at the top'}
          onClick={() => parent && open(parent.id)}
        >
          <ArrowUp />
        </Button>
        <nav ref={nav} aria-label="Folder path" className="min-w-0 flex-1">
          <ol className="flex flex-wrap items-center gap-0.5 text-sm">
            {path.map((f, i) => {
              const current = i === path.length - 1
              return (
                <li key={f.id} className="flex min-w-0 items-center gap-0.5">
                  {i > 0 ? (
                    <ChevronRight
                      aria-hidden
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                  ) : null}
                  {current ? (
                    <span
                      aria-current="page"
                      tabIndex={-1}
                      className="truncate rounded-sm px-1.5 py-1 font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {f.name}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => open(f.id)}
                      className="truncate rounded-sm px-1.5 py-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {f.name}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className="flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5">
        {selected.length ? (
          <>
            <p className="text-sm tabular-nums">
              <span className="font-medium">{selected.length} selected</span>{' '}
              <span className="text-muted-foreground">
                · {formatSize(selectedSize)}
              </span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setMessage(
                    `Preparing ${selected.length} ${selected.length === 1 ? 'item' : 'items'} (${formatSize(selectedSize)}) for download.`,
                  )
                }
              >
                <Download /> Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={remove}
              >
                <Trash2 /> Delete
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Clear selection"
                onClick={() => setRowSelection({})}
              >
                <X />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground tabular-nums">
            {folder.children.length}{' '}
            {folder.children.length === 1 ? 'item' : 'items'} ·{' '}
            {formatSize(sizeOf(folder))}
          </p>
        )}
        <p
          aria-live="polite"
          className="w-full text-xs text-muted-foreground empty:hidden"
        >
          {message}
        </p>
      </div>

      <FileTable
        folder={folder}
        path={path}
        state={{ sorting, rowSelection, expanded }}
        onSortingChange={setSorting}
        onRowSelectionChange={setRowSelection}
        onExpandedChange={setExpanded}
        meta={{ open }}
      />

      <p className="text-xs text-muted-foreground">
        A folder's name opens it. A file's name shows its details.
      </p>
    </div>
  )
}
