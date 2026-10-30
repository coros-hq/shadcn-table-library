<script lang="ts">
  import { getCoreRowModel } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { Service, ServiceStatus } from './columns'

  const TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
    operational: ['operational', 'operational', 'operational', 'degraded'],
    degraded: ['operational', 'operational', 'degraded', 'down'],
    down: ['degraded', 'down', 'down'],
  }

  function nextStatus(status: ServiceStatus): ServiceStatus {
    const options = TRANSITIONS[status]
    return options[Math.floor(Math.random() * options.length)]
  }

  function jitterLatency(latencyMs: number, status: ServiceStatus) {
    if (status === 'down') return 0
    const drift = status === 'degraded' ? 40 : 12
    const next = latencyMs + Math.round((Math.random() - 0.5) * drift)
    return Math.max(1, next)
  }

  // The parent owns the rows; this component only pushes updates back through bind:data
  let { data = $bindable() }: { data: Service[] } = $props()

  let isLive = $state(true)
  let cursor = 0

  function tick() {
    const index = cursor % data.length
    cursor += 1
    data = data.map((service, i) => {
      if (i !== index) return service
      const status = nextStatus(service.status)
      return {
        ...service,
        status,
        latencyMs: jitterLatency(service.latencyMs, status),
      }
    })
  }

  // Re-runs whenever isLive flips: the cleanup stops the old timer, then a new one starts if live
  $effect(() => {
    if (!isLive) return
    const interval = window.setInterval(tick, 1800)
    return () => window.clearInterval(interval)
  })

  const table = createSvelteTable({
    get data() {
      return data
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
</script>

<div>
  <div class="mb-3 flex items-center justify-between">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      onclick={() => (isLive = !isLive)}
    >
      <span class="relative flex size-2">
        {#if isLive}
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"
          ></span>
        {/if}
        <span
          class={cn(
            'relative inline-flex size-2 rounded-full',
            isLive ? 'bg-emerald-500' : 'bg-muted-foreground',
          )}
        ></span>
      </span>
      {isLive ? 'Live' : 'Paused'}
    </button>
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
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
      </Table.Body>
    </Table.Root>
  </div>
</div>
