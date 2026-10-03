<script setup lang="ts">
import { columns } from './columns'
import ExportConfigTable from './ExportConfigTable.vue'
import { orders, today } from './data'
</script>

<template>
  <ExportConfigTable :columns="columns" :data="orders" :today="today" />
</template>
