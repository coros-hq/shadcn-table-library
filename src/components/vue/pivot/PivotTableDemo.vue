<script setup lang="ts">
import { salesData } from './data'
import PivotTable from './PivotTable.vue'
</script>

<template>
  <PivotTable :data="salesData" />
</template>
