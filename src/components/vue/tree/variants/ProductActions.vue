<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

defineProps<{ name: string }>()

const added = ref(false)
const watching = ref(false)
</script>

<template>
  <div class="flex items-center justify-end gap-1.5">
    <Button
      type="button"
      variant="outline"
      size="icon"
      :aria-pressed="added"
      :aria-label="`${added ? 'Remove' : 'Add'} ${name} ${added ? 'from' : 'to'} the purchase order`"
      :class="
        cn(
          'size-7 rounded-full text-amber-600 hover:text-amber-600 dark:text-amber-400',
          added && 'border-amber-500 bg-amber-500/10',
        )
      "
      @click="added = !added"
    >
      <Plus :class="cn('size-4 transition-transform', added && 'rotate-45')" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      :aria-pressed="watching"
      :aria-label="`${watching ? 'Stop watching' : 'Watch'} stock of ${name}`"
      class="size-7 text-amber-600 hover:text-amber-600 dark:text-amber-400"
      @click="watching = !watching"
    >
      <Bell :class="cn('size-4', watching && 'fill-current')" />
    </Button>
  </div>
</template>
