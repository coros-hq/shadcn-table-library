<script setup lang="ts">
import { columns } from './columns'
import DataTable from './DataTable.vue'
</script>

<template>
  <DataTable :columns="columns" />
</template>
