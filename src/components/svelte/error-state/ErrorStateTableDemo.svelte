<script lang="ts">
  import { onDestroy } from 'svelte'
  import { Button } from '$lib/components/ui/button/index.js'
  import DataTable from './DataTable.svelte'
  import { invoices } from './data'
  import type { Invoice } from './data'

  let data = $state<Invoice[]>([])
  let error = $state<Error | null>(new Error('Request failed with status 503'))
  let isRetrying = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  onDestroy(() => clearTimeout(timer))

  // Stand-in for refetching: succeeds after a short delay
  function retry() {
    isRetrying = true
    timer = setTimeout(() => {
      data = invoices
      error = null
      isRetrying = false
    }, 1200)
  }

  function failWith(rows: Invoice[]) {
    clearTimeout(timer)
    isRetrying = false
    data = rows
    error = new Error('Request failed with status 503')
  }
</script>

<div class="space-y-3">
  <div class="flex flex-wrap gap-2">
    <Button variant="outline" size="sm" onclick={() => failWith([])}>
      Fail with no data
    </Button>
    <Button variant="outline" size="sm" onclick={() => failWith(invoices)}>
      Fail with stale data
    </Button>
  </div>
  <DataTable {data} {error} {isRetrying} onretry={retry} />
</div>
