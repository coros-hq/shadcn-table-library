<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import type { Status } from './data'
import { statusStyle } from './styles'

defineProps<{ status: Status }>()
</script>

<template>
  <Badge variant="outline" :class="statusStyle[status].className">
    {{ statusStyle[status].label }}
  </Badge>
</template>
