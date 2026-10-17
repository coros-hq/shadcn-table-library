<script setup lang="ts">
import { RotateCw, TriangleAlert } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    title: string
    description: string
    canRetry?: boolean
    isRetrying?: boolean
    /** `panel` fills an empty table body; `banner` sits above stale rows */
    variant?: 'panel' | 'banner'
  }>(),
  { canRetry: true, isRetrying: false, variant: 'panel' },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    v-if="variant === 'banner'"
    role="alert"
    class="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
  >
    <TriangleAlert class="size-4 shrink-0 text-destructive" />
    <div class="min-w-0 flex-1 text-sm">
      <p class="font-medium">{{ title }}</p>
      <p class="text-muted-foreground">{{ description }}</p>
    </div>
    <Button
      v-if="canRetry"
      variant="outline"
      size="sm"
      :disabled="isRetrying"
      @click="emit('retry')"
    >
      <RotateCw :class="cn(isRetrying && 'animate-spin')" />
      {{ isRetrying ? 'Retrying...' : 'Try again' }}
    </Button>
  </div>
  <div
    v-else
    role="alert"
    class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
  >
    <div
      class="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"
    >
      <TriangleAlert class="size-5" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-medium">{{ title }}</p>
      <p class="max-w-sm text-sm text-balance text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <Button
      v-if="canRetry"
      variant="outline"
      size="sm"
      :disabled="isRetrying"
      @click="emit('retry')"
    >
      <RotateCw :class="cn(isRetrying && 'animate-spin')" />
      {{ isRetrying ? 'Retrying...' : 'Try again' }}
    </Button>
  </div>
</template>
