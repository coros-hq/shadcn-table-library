<script setup lang="ts">
import DetailPanelTable from './DetailPanelTable.vue'
import { columns } from './columns'
import { orders } from './data'
</script>

<template>
  <DetailPanelTable :columns="columns" :data="orders" />
</template>
