<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { LogLevel } from './data'
import LevelDot from './LevelDot.vue'
import { levelStyles } from './level-styles'

defineProps<{ level: LogLevel }>()
</script>

<template>
  <span
    :class="cn('flex items-center gap-2 font-medium capitalize', levelStyles[level].text)"
  >
    <LevelDot :level="level" />
    {{ level }}
  </span>
</template>
