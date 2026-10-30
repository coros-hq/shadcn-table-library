<script lang="ts">
  import { getCoreRowModel } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Skeleton } from '$lib/components/ui/skeleton/index.js'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { columns } from './columns'
  import { useInfiniteRows } from './use-infinite-rows.svelte'
  import type { InfinitePage } from './use-infinite-rows.svelte'
  import type { Transaction } from './data'

  const SKELETON_ROWS = 4

  type Props = {
    fetchPage: (cursor: number) => Promise<InfinitePage<Transaction>>
    total: number
  }

  let { fetchPage, total }: Props = $props()

  // svelte-ignore state_referenced_locally
  const infinite = useInfiniteRows(fetchPage)
  let scrollRef = $state<HTMLDivElement | null>(null)
  let sentinelRef = $state<HTMLDivElement | null>(null)

  const table = createSvelteTable({
    get data() {
      return infinite.rows
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Reads rows.length so a fresh observer is created after every page: it
  // reports the sentinel's current position straight away, which keeps loading
  // when a page was too short to push the sentinel out of view.
  $effect(() => {
    void infinite.rows.length
    const sentinel = sentinelRef
    if (!infinite.canAutoLoad || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void infinite.loadMore()
      },
      { root: scrollRef, rootMargin: '0px 0px 160px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  })
</script>

<div>
  <div
    bind:this={scrollRef}
    class="max-h-96 overflow-auto rounded-md border [&_[data-slot=table-container]]:overflow-visible"
  >
    <Table.Root>
      <Table.Header
        class="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)] [&_tr]:border-b-0"
      >
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
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
          <Table.Row>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
        {#if infinite.status === 'loading'}
          {#each { length: SKELETON_ROWS } as _, i (i)}
            <Table.Row aria-hidden="true">
              {#each columns as _column, j (j)}
                <Table.Cell>
                  <Skeleton class="h-4 w-full max-w-28" />
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
    <div bind:this={sentinelRef} class="h-px" aria-hidden="true"></div>
    {#if infinite.status === 'error'}
      <div
        role="alert"
        class="flex items-center justify-center gap-3 border-t p-3 text-sm"
      >
        <span class="text-muted-foreground">Couldn't load more transactions.</span>
        <Button size="sm" variant="outline" onclick={infinite.loadMore}>Retry</Button>
      </div>
    {/if}
  </div>
  <p class="mt-3 text-xs text-muted-foreground tabular-nums" aria-live="polite">
    {infinite.hasMore
      ? `Showing ${infinite.rows.length} of ${total} — scroll for more`
      : `All ${total} transactions loaded`}
  </p>
</div>
