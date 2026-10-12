<script setup lang="ts">
import { columns } from './columns'
import { departments, employees, statuses } from './data'
import DataTable from './DataTable.vue'
</script>

<template>
  <DataTable
    :columns="columns"
    :data="employees"
    :departments="departments"
    :statuses="statuses"
  />
</template>
