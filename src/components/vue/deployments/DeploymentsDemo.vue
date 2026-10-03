<script setup lang="ts">
import { columns } from './columns'
import DeploymentsTable from './DeploymentsTable.vue'
import { deployments } from './data'
</script>

<template>
  <DeploymentsTable :columns="columns" :data="deployments" />
</template>
