<script setup lang="ts">
import { months, revenueByRegion } from './data'
import HeatmapTable from './HeatmapTable.vue'
</script>

<template>
  <HeatmapTable
    :columns="months"
    :data="revenueByRegion"
    :format-value="(value) => `$${value}k`"
  />
</template>
