<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Priority } from './data'
import { priorityStyle } from './styles'

defineProps<{ priority: Priority }>()
</script>

<template>
  <span class="flex items-center gap-1.5 whitespace-nowrap">
    <span
      aria-hidden="true"
      :class="cn('size-2 rounded-full', priorityStyle[priority].dot)"
    />
    {{ priorityStyle[priority].label }}
  </span>
</template>
