<script lang="ts">
  import InfiniteScrollTable from './InfiniteScrollTable.svelte'
  import { TOTAL, fetchTransactions } from './data'
</script>

<InfiniteScrollTable fetchPage={fetchTransactions} total={TOTAL} />
