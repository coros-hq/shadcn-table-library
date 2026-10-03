<script setup lang="ts">
import { ref } from 'vue'
import { columns } from './columns'
import type { Task } from './columns'
import ReorderableTable from './ReorderableTable.vue'

const initialData: Task[] = [
  { id: 'task-1', title: 'Design landing page', priority: 'High', status: 'In progress' },
  { id: 'task-2', title: 'Set up CI pipeline', priority: 'Medium', status: 'Todo' },
  { id: 'task-3', title: 'Write onboarding docs', priority: 'Low', status: 'Todo' },
  { id: 'task-4', title: 'Fix pagination bug', priority: 'High', status: 'In progress' },
  { id: 'task-5', title: 'Add dark mode toggle', priority: 'Medium', status: 'Done' },
  { id: 'task-6', title: 'Audit accessibility', priority: 'Low', status: 'Todo' },
]

const data = ref(initialData)
</script>

<template>
  <ReorderableTable v-model:data="data" :columns="columns" />
</template>
