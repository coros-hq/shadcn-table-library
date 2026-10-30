<script lang="ts">
  import { onMount } from 'svelte'
  import RotateCw from '@lucide/svelte/icons/rotate-cw'
  import { Button } from '$lib/components/ui/button/index.js'
  import DataTable from './DataTable.svelte'
  import { fetchInvoices } from './data'
  import type { Invoice } from './data'

  let data = $state<Invoice[]>([])
  let isLoading = $state(true)
  let isFetching = $state(false)
  let requestId = 0

  async function load(mode: 'initial' | 'refetch') {
    const id = ++requestId
    if (mode === 'initial') {
      data = []
      isLoading = true
    } else {
      isFetching = true
    }
    const result = await fetchInvoices()
    // Ignore a response that a newer request has already superseded
    if (id !== requestId) return
    data = result
    isLoading = false
    isFetching = false
  }

  onMount(() => load('initial'))
</script>

<div class="space-y-3">
  <div class="flex flex-wrap gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading || isFetching}
      onclick={() => load('initial')}
    >
      <RotateCw /> Reload (skeleton)
    </Button>
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading || isFetching || data.length === 0}
      onclick={() => load('refetch')}
    >
      <RotateCw /> Refetch (keep rows)
    </Button>
  </div>
  <DataTable {data} {isLoading} {isFetching} />
</div>
