<script setup lang="ts">
import { columns } from './columns'
import LogsTable from './LogsTable.vue'
import { logs } from './data'
</script>

<template>
  <LogsTable :columns="columns" :data="logs" />
</template>
