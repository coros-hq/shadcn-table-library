<script lang="ts">
  import type { Table } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { LogEntry } from './data'
  import { clearFilters } from './toolbar'

  let { table }: { table: Table<LogEntry> } = $props()
</script>

<p class="text-muted-foreground">No log events match these filters.</p>
<Button type="button" variant="link" size="sm" onclick={() => clearFilters(table)}>
  Reset filters
</Button>
