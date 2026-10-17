<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import DataTable from './DataTable.vue'
import { invoices } from './data'
import type { Invoice } from './data'

const data = ref<Invoice[]>([])
const error = ref<Error | null>(new Error('Request failed with status 503'))
const isRetrying = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => clearTimeout(timer))

// Stand-in for refetching: succeeds after a short delay
function retry() {
  isRetrying.value = true
  timer = setTimeout(() => {
    data.value = invoices
    error.value = null
    isRetrying.value = false
  }, 1200)
}

function failWith(rows: Invoice[]) {
  clearTimeout(timer)
  isRetrying.value = false
  data.value = rows
  error.value = new Error('Request failed with status 503')
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" @click="failWith([])">
        Fail with no data
      </Button>
      <Button variant="outline" size="sm" @click="failWith(invoices)">
        Fail with stale data
      </Button>
    </div>
    <DataTable
      :data="data"
      :error="error"
      :is-retrying="isRetrying"
      @retry="retry"
    />
  </div>
</template>
