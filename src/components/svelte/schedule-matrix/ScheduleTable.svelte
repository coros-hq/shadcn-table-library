<script lang="ts">
  import { getCoreRowModel } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { ScheduleMeta } from './columns'
  import { days, people } from './data'
  import type { Assignment, Schedule } from './data'
  import { cellKey, fromKey } from './schedule'

  let {
    schedule,
    changed,
    assign,
  }: {
    schedule: Schedule
    changed: Set<string>
    assign: (personId: string, day: number, value: Assignment) => void
  } = $props()

  let root = $state<HTMLElement>()
  let active = $state(cellKey(people[0].id, 0))

  const isDay = (id: string) => days.some((d) => d.id === id)
  const weekend = (id: string) => days.find((d) => d.id === id)?.weekend

  function focusCell(row: number, day: number) {
    const r = Math.max(0, Math.min(people.length - 1, row))
    const d = Math.max(0, Math.min(days.length - 1, day))
    const key = cellKey(people[r].id, d)
    active = key
    root?.querySelector<HTMLElement>(`[data-cell="${key}"]`)?.focus()
  }

  function onCellKeydown(event: KeyboardEvent, personId: string, day: number) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const row = people.findIndex((p) => p.id === personId)
    const move: Record<string, [number, number]> = {
      ArrowUp: [row - 1, day],
      ArrowDown: [row + 1, day],
      ArrowLeft: [row, day - 1],
      ArrowRight: [row, day + 1],
      Home: [row, 0],
      End: [row, days.length - 1],
    }
    if (event.key in move) {
      event.preventDefault()
      focusCell(...move[event.key])
      return
    }
    const value = fromKey(event.key)
    if (value === undefined) return
    event.preventDefault()
    assign(personId, day, value)
    // Typing a shift moves on to the next day, so a week fills in one go
    if (value !== null) focusCell(row, day + 1)
  }

  // Whichever cell gets focus, by click or by Tab, becomes the tab stop
  function onfocusin(event: FocusEvent) {
    const key = (event.target as HTMLElement).dataset.cell
    if (key) active = key
  }

  const table = createSvelteTable({
    data: people,
    columns,
    getRowId: (person) => person.id,
    getCoreRowModel: getCoreRowModel(),
    get meta(): ScheduleMeta {
      return { schedule, changed, active, assign, onCellKeydown }
    },
  })

  const sticky = 'sticky left-0 z-10 bg-background'
</script>

<div bind:this={root} {onfocusin} class="overflow-x-auto rounded-md border">
  <Table.Root class="min-w-[760px] table-fixed">
    <colgroup>
      <col class="w-32 sm:w-48" />
      {#each days as d (d.id)}
        <col />
      {/each}
      <col class="w-28" />
    </colgroup>
    <Table.Header>
      {#each table.getHeaderGroups() as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Head
              class={cn(
                'h-auto py-2',
                header.column.id === 'person' && sticky,
                isDay(header.column.id) && 'text-center',
                weekend(header.column.id) && 'bg-muted/50',
              )}
            >
              <FlexRender
                content={header.column.columnDef.header}
                context={header.getContext()}
              />
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row class="hover:bg-transparent">
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell
              class={cn(
                isDay(cell.column.id) ? 'p-1' : 'py-1.5',
                cell.column.id === 'person' && sticky,
                weekend(cell.column.id) && 'bg-muted/50',
              )}
            >
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
    <Table.Footer class="bg-transparent">
      {#each table.getFooterGroups().slice(0, 1) as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Cell
              class={cn(
                'py-2 align-top',
                header.column.id === 'person' && sticky,
                weekend(header.column.id) && 'bg-muted/50',
              )}
            >
              <FlexRender
                content={header.column.columnDef.footer}
                context={header.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Footer>
  </Table.Root>
</div>
