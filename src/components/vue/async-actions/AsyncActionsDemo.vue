<script setup lang="ts">
import AsyncActionsTable from './AsyncActionsTable.vue'
import { initialSources } from './data'
</script>

<template>
  <AsyncActionsTable :initial-data="initialSources" />
</template>
