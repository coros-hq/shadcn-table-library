<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { LogLevel } from './data'
import { levelStyles } from './level-styles'

/** Level marker, shared by the table and the Level filter menu */
defineProps<{ level: LogLevel }>()
</script>

<template>
  <span
    aria-hidden="true"
    :class="cn('size-1.5 shrink-0 rounded-full', levelStyles[level].dot)"
  />
</template>
