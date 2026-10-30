<script lang="ts">
  import { tick } from 'svelte'
  import { getCoreRowModel } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import { COLS, ROW_COUNT, evaluateSheet } from './formula'
  import type { SheetRow } from './columns'

  type Pos = { r: number; c: number }

  const COL_IDS: readonly string[] = COLS
  const COL_COUNT = COLS.length
  const clamp = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(min, n))
  const cellName = (p: Pos) => `${COLS[p.c]}${p.r + 1}`

  let { initialData }: { initialData: string[][] } = $props()

  // svelte-ignore state_referenced_locally
  let raw = $state<string[][]>(initialData)
  let active = $state<Pos>({ r: 0, c: 0 })
  let anchor = $state<Pos>({ r: 0, c: 0 })
  let editing = $state<string | null>(null)
  let dragging = false
  let gridRef = $state<HTMLDivElement | null>(null)

  const computedSheet = $derived(evaluateSheet(raw))
  const rows = $derived<SheetRow[]>(
    computedSheet.map((cells, r) => ({ n: r + 1, cells })),
  )

  const table = createSvelteTable({
    get data() {
      return rows
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const range = $derived({
    r1: Math.min(anchor.r, active.r),
    r2: Math.max(anchor.r, active.r),
    c1: Math.min(anchor.c, active.c),
    c2: Math.max(anchor.c, active.c),
  })
  const inRange = (r: number, c: number) =>
    r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2

  const stopDragging = () => {
    dragging = false
  }

  // Keep the active cell in view after every move
  $effect(() => {
    void active.r
    void active.c
    tick().then(() => {
      gridRef
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
  })

  function select(pos: Pos, extend = false) {
    active = pos
    if (!extend) anchor = pos
  }

  function moveBy(dr: number, dc: number, extend = false) {
    select(
      {
        r: clamp(active.r + dr, 0, ROW_COUNT - 1),
        c: clamp(active.c + dc, 0, COL_COUNT - 1),
      },
      extend,
    )
  }

  function writeCells(updates: Array<[Pos, string]>) {
    const next = raw.map((row) => [...row])
    for (const [pos, value] of updates) next[pos.r][pos.c] = value
    raw = next
  }

  // Idempotent: a blur fired while the input unmounts finds nothing to commit
  function commit(move?: Pos, refocus = true) {
    const draft = editing
    if (draft === null) return
    writeCells([[active, draft]])
    editing = null
    if (move) moveBy(move.r, move.c)
    if (refocus) gridRef?.focus()
  }

  function cancelEdit() {
    editing = null
    gridRef?.focus()
  }

  function startEdit(initial?: string) {
    editing = initial ?? raw[active.r][active.c]
  }

  function clearRange() {
    const { r1, r2, c1, c2 } = range
    const updates: Array<[Pos, string]> = []
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) updates.push([{ r, c }, ''])
    }
    writeCells(updates)
  }

  function onGridKeyDown(e: KeyboardEvent) {
    if (editing !== null) return
    const mod = e.metaKey || e.ctrlKey
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        return moveBy(-1, 0, e.shiftKey)
      case 'ArrowDown':
        e.preventDefault()
        return moveBy(1, 0, e.shiftKey)
      case 'ArrowLeft':
        e.preventDefault()
        return moveBy(0, -1, e.shiftKey)
      case 'ArrowRight':
        e.preventDefault()
        return moveBy(0, 1, e.shiftKey)
      case 'Tab':
        e.preventDefault()
        return moveBy(0, e.shiftKey ? -1 : 1)
      case 'Enter':
      case 'F2':
        e.preventDefault()
        return startEdit()
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        return clearRange()
    }
    if (mod && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      anchor = { r: ROW_COUNT - 1, c: COL_COUNT - 1 }
      active = { r: 0, c: 0 }
    } else if (!mod && !e.altKey && e.key.length === 1) {
      // Typing over a cell replaces its content, like a spreadsheet
      e.preventDefault()
      startEdit(e.key)
    }
  }

  function onInputKeyDown(e: KeyboardEvent) {
    // Keep typing and caret keys away from the grid's navigation handler
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      commit({ r: e.shiftKey ? -1 : 1, c: 0 })
    } else if (e.key === 'Tab') {
      e.preventDefault()
      commit({ r: 0, c: e.shiftKey ? -1 : 1 })
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  function onCopy(e: ClipboardEvent) {
    if (editing !== null) return
    e.preventDefault()
    const { r1, r2, c1, c2 } = range
    const lines: string[] = []
    for (let r = r1; r <= r2; r++) {
      const cells: string[] = []
      for (let c = c1; c <= c2; c++) cells.push(computedSheet[r][c].text)
      lines.push(cells.join('\t'))
    }
    e.clipboardData?.setData('text/plain', lines.join('\n'))
  }

  function onPaste(e: ClipboardEvent) {
    if (editing !== null) return
    e.preventDefault()
    const text = (e.clipboardData?.getData('text/plain') ?? '').replace(/\r/g, '')
    const pasted = text.replace(/\n$/, '').split('\n').map((l) => l.split('\t'))
    const { r1, c1 } = range
    const updates: Array<[Pos, string]> = []
    let last: Pos = { r: r1, c: c1 }
    pasted.forEach((line, i) =>
      line.forEach((value, j) => {
        const pos = { r: r1 + i, c: c1 + j }
        if (pos.r >= ROW_COUNT || pos.c >= COL_COUNT) return
        updates.push([pos, value])
        last = pos
      }),
    )
    writeCells(updates)
    anchor = { r: r1, c: c1 }
    active = last
  }

  function onCellMouseDown(e: MouseEvent, pos: Pos) {
    if (e.button !== 0) return
    const insideEditor =
      editing !== null && pos.r === active.r && pos.c === active.c
    if (insideEditor) return
    commit(undefined, false)
    select(pos, e.shiftKey)
    dragging = true
  }

  function onCellEnter(pos: Pos) {
    if (dragging) active = pos
  }

  function onColumnMouseDown(c: number) {
    if (c < 0) return
    commit(undefined, false)
    anchor = { r: ROW_COUNT - 1, c }
    active = { r: 0, c }
  }

  function onRowMouseDown(r: number) {
    commit(undefined, false)
    anchor = { r, c: COL_COUNT - 1 }
    active = { r, c: 0 }
  }

  function focusInput(el: HTMLInputElement) {
    if (document.activeElement !== el) el.focus()
  }

  const stats = $derived.by(() => {
    const { r1, r2, c1, c2 } = range
    const numbers: number[] = []
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const value = computedSheet[r][c].value
        if (value !== null) numbers.push(value)
      }
    }
    const total = numbers.reduce((sum, n) => sum + n, 0)
    return {
      count: numbers.length,
      total,
      multiple: r1 !== r2 || c1 !== c2,
    }
  })
  const fmt = (n: number) => String(Math.round(n * 1e4) / 1e4)
</script>

<svelte:window onmouseup={stopDragging} />

<div>
  <div class="mb-2 flex items-center overflow-hidden rounded-md border text-sm">
    <div class="w-16 shrink-0 border-r bg-muted/50 px-2 py-1.5 text-center font-medium">
      {cellName(active)}
    </div>
    <div
      class="min-w-0 flex-1 truncate px-3 py-1.5 font-mono text-xs"
      aria-label="Cell contents"
    >
      {editing ?? raw[active.r][active.c]}
    </div>
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={gridRef}
    tabindex="0"
    role="application"
    aria-label="Spreadsheet. Arrow keys move, Enter edits, Shift extends the selection."
    class="max-h-96 overflow-auto rounded-md border outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_[data-slot=table-container]]:overflow-visible"
    onkeydown={onGridKeyDown}
    oncopy={onCopy}
    onpaste={onPaste}
  >
    <Table.Root class="min-w-xl table-fixed border-separate border-spacing-0">
      <Table.Header class="sticky top-0 z-20 [&_tr]:border-b-0">
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row class="hover:bg-transparent">
            {#each headerGroup.headers as header (header.id)}
              {@const colIndex = COL_IDS.indexOf(header.column.id)}
              <Table.Head
                class={cn(
                  'h-8 border-r border-b bg-muted text-center text-xs font-medium',
                  colIndex < 0
                    ? 'sticky left-0 z-30 w-12'
                    : 'cursor-pointer text-muted-foreground',
                  colIndex >= range.c1 &&
                    colIndex <= range.c2 &&
                    'bg-accent text-foreground',
                )}
                onmousedown={() => onColumnMouseDown(colIndex)}
              >
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row class="hover:bg-transparent">
            {#each row.getVisibleCells() as cell (cell.id)}
              {@const colIndex = COL_IDS.indexOf(cell.column.id)}
              {#if colIndex < 0}
                <Table.Cell
                  class={cn(
                    'sticky left-0 z-10 h-8 cursor-pointer border-r border-b bg-muted p-0 text-center text-xs text-muted-foreground',
                    row.index >= range.r1 &&
                      row.index <= range.r2 &&
                      'bg-accent text-foreground',
                  )}
                  onmousedown={() => onRowMouseDown(row.index)}
                >
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {:else}
                {@const isActive = active.r === row.index && active.c === colIndex}
                {@const kind = row.original.cells[colIndex].kind}
                <Table.Cell
                  data-active={isActive}
                  class={cn(
                    'relative h-8 scroll-ml-12 scroll-mt-8 truncate border-r border-b px-2 py-0',
                    kind === 'number' && 'text-right tabular-nums',
                    kind === 'error' && 'text-red-600 dark:text-red-400',
                    inRange(row.index, colIndex) && 'bg-primary/10',
                    isActive && 'outline-2 -outline-offset-2 outline-primary',
                  )}
                  onmousedown={(e: MouseEvent) =>
                    onCellMouseDown(e, { r: row.index, c: colIndex })}
                  onmouseenter={() => onCellEnter({ r: row.index, c: colIndex })}
                  ondblclick={() => startEdit()}
                >
                  {#if editing !== null && isActive}
                    <input
                      {@attach focusInput}
                      value={editing}
                      oninput={(e) => (editing = e.currentTarget.value)}
                      aria-label="Edit {cellName(active)}"
                      class="absolute inset-0 size-full bg-background px-2 text-sm outline-2 -outline-offset-2 outline-primary select-text"
                      onkeydown={onInputKeyDown}
                      onblur={() => commit(undefined, false)}
                    />
                  {:else}
                    <FlexRender
                      content={cell.column.columnDef.cell}
                      context={cell.getContext()}
                    />
                  {/if}
                </Table.Cell>
              {/if}
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <p class="mt-3 text-xs text-muted-foreground tabular-nums" aria-live="polite">
    {stats.multiple && stats.count > 0
      ? `Sum ${fmt(stats.total)} · Average ${fmt(stats.total / stats.count)} · Count ${stats.count}`
      : 'Type to edit · Enter or F2 edits · Shift + arrows select · Copy and paste work'}
  </p>
</div>
