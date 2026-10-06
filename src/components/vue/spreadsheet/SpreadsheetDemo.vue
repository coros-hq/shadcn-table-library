<script setup lang="ts">
import SpreadsheetTable from './SpreadsheetTable.vue'
import { initialSheet } from './data'
</script>

<template>
  <SpreadsheetTable :initial-data="initialSheet()" />
</template>
