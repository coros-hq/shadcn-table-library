<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  description: string
  class?: string
}>()
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        $props.class,
      )
    "
  >
    <div
      class="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
    >
      <slot name="icon" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-medium">{{ title }}</p>
      <p class="max-w-sm text-sm text-balance text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <!-- Primary call to action, e.g. a "Create" or "Clear filters" button -->
    <slot name="action" />
  </div>
</template>
