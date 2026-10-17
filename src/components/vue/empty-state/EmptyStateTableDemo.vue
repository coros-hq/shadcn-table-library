<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import DataTable from './DataTable.vue'
import { invoices } from './data'
import type { Invoice } from './data'

const data = ref<Invoice[]>([])
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="data.length === 0"
        @click="data = []"
      >
        Empty the table
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="data.length > 0"
        @click="data = invoices"
      >
        Load invoices
      </Button>
    </div>
    <DataTable :data="data" @create="data = invoices" />
  </div>
</template>
