<script setup lang="ts">
import { columns } from './columns'
import ExportSelectedTable from './ExportSelectedTable.vue'
import { customers } from './data'
</script>

<template>
  <ExportSelectedTable :columns="columns" :data="customers" />
</template>
