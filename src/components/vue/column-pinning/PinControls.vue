<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'
import { ArrowLeftToLine, ArrowRightToLine, PinOff } from '@lucide/vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{ column: Column<TData, unknown> }>()
</script>

<template>
  <Button
    v-if="props.column.getIsPinned()"
    type="button"
    variant="ghost"
    size="icon"
    class="size-6 shrink-0 opacity-0 group-hover/head:opacity-100 data-[pinned=true]:opacity-100"
    data-pinned="true"
    :aria-label="`Unpin ${String(props.column.columnDef.header)} column`"
    @click="props.column.pin(false)"
  >
    <PinOff class="size-3.5" />
  </Button>
  <div
    v-else
    class="flex shrink-0 items-center gap-0.5 opacity-0 group-hover/head:opacity-100"
  >
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="size-6"
      :aria-label="`Pin ${String(props.column.columnDef.header)} column left`"
      @click="props.column.pin('left')"
    >
      <ArrowLeftToLine class="size-3.5" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="size-6"
      :aria-label="`Pin ${String(props.column.columnDef.header)} column right`"
      @click="props.column.pin('right')"
    >
      <ArrowRightToLine class="size-3.5" />
    </Button>
  </div>
</template>
