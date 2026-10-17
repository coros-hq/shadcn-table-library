<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RotateCw } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import DataTable from './DataTable.vue'
import { fetchInvoices } from './data'
import type { Invoice } from './data'

const data = ref<Invoice[]>([])
const isLoading = ref(true)
const isFetching = ref(false)
let requestId = 0

async function load(mode: 'initial' | 'refetch') {
  const id = ++requestId
  if (mode === 'initial') {
    data.value = []
    isLoading.value = true
  } else {
    isFetching.value = true
  }
  const result = await fetchInvoices()
  // Ignore a response that a newer request has already superseded
  if (id !== requestId) return
  data.value = result
  isLoading.value = false
  isFetching.value = false
}

onMounted(() => load('initial'))
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="isLoading || isFetching"
        @click="load('initial')"
      >
        <RotateCw /> Reload (skeleton)
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="isLoading || isFetching || data.length === 0"
        @click="load('refetch')"
      >
        <RotateCw /> Refetch (keep rows)
      </Button>
    </div>
    <DataTable :data="data" :is-loading="isLoading" :is-fetching="isFetching" />
  </div>
</template>
