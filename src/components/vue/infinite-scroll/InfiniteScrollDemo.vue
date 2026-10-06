<script setup lang="ts">
import InfiniteScrollTable from './InfiniteScrollTable.vue'
import { TOTAL, fetchTransactions } from './data'
</script>

<template>
  <InfiniteScrollTable :fetch-page="fetchTransactions" :total="TOTAL" />
</template>
