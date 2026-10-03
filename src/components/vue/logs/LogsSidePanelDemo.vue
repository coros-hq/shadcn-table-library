<script setup lang="ts">
import { columns } from './columns'
import LogsSidePanelTable from './LogsSidePanelTable.vue'
import { logs } from './data'
</script>

<template>
  <LogsSidePanelTable :columns="columns" :data="logs" />
</template>
