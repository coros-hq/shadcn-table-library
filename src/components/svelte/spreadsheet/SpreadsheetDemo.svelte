<script lang="ts">
  import SpreadsheetTable from './SpreadsheetTable.svelte'
  import { initialSheet } from './data'
</script>

<SpreadsheetTable initialData={initialSheet()} />
