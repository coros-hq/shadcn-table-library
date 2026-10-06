<script setup lang="ts">
import VariantsTable from './VariantsTable.vue'
import { columns } from './columns'
import { products } from './data'
</script>

<template>
  <VariantsTable :columns="columns" :data="products" />
</template>
