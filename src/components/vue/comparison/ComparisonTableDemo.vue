<script setup lang="ts">
import { features, plans } from './data'
import ComparisonTable from './ComparisonTable.vue'
</script>

<template>
  <ComparisonTable :plans="plans" :features="features" />
</template>
