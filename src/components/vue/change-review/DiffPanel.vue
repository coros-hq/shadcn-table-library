<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Check, ChevronDown, ChevronUp, X } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Change } from './data'
import { diffLines, fieldLabel, keysOf, rowState } from './diff'
import type { Decision, Decisions } from './diff'

const props = defineProps<{
  /** The change being reviewed; the panel is closed while this is null */
  change: Change | null
  /** "3 of 11", for the change being reviewed */
  position: { index: number; total: number }
  decisions: Decisions
}>()

const emit = defineEmits<{
  /** `advance` moves on to the next change to review */
  decide: [keys: string[], decision: Decision | null, advance?: boolean]
  previous: []
  next: []
  close: []
}>()

// Keeps the last change on screen while the panel slides out
const shown = ref<Change | null>(props.change)
watch(
  () => props.change,
  (change) => {
    if (change) shown.value = change
  },
)

// Moving focus to the heading tells screen readers which product is open.
// On close, focus goes back to that product's row in the table.
const heading = ref<HTMLHeadingElement | null>(null)
watch(
  () => props.change?.id,
  async (id, previous) => {
    await nextTick()
    if (id) heading.value?.focus()
    else if (previous) {
      document
        .querySelector<HTMLElement>(`[data-review-id="${previous}"]`)
        ?.focus()
    }
  },
)

const product = computed(() =>
  shown.value?.kind === 'create' ? shown.value.after : shown.value?.before,
)
const lines = computed(() => (shown.value ? diffLines(shown.value) : []))
const keys = computed(() => (shown.value ? keysOf(shown.value) : []))
const state = computed(() =>
  shown.value ? rowState(shown.value, props.decisions) : 'pending',
)
const pending = computed(() =>
  keys.value.filter((k) => !(k in props.decisions)),
)
// Several changes can be picked one by one; a single one is just the buttons
const pickable = computed(
  () => shown.value?.kind === 'update' && keys.value.length > 1,
)
const added = computed(
  () => lines.value.filter((l) => l.kind === 'added').length,
)
const removed = computed(
  () => lines.value.filter((l) => l.kind === 'removed').length,
)
const whole = computed(() =>
  shown.value && shown.value.kind !== 'update'
    ? props.decisions[keys.value[0]]
    : undefined,
)

// Partly decided: the buttons finish the rest instead of overwriting picks
const targets = computed(() =>
  state.value === 'partial' ? pending.value : keys.value,
)
const verb = computed(() =>
  shown.value?.kind === 'create'
    ? { accept: 'Add product', reject: 'Don’t add' }
    : shown.value?.kind === 'delete'
      ? { accept: 'Remove product', reject: 'Keep product' }
      : state.value === 'partial'
        ? { accept: 'Accept the rest', reject: 'Reject the rest' }
        : { accept: 'Accept changes', reject: 'Reject changes' },
)

const decisionOf = (line: (typeof lines.value)[number]) =>
  line.kind === 'context'
    ? undefined
    : line.key
      ? props.decisions[line.key]
      : whole.value

// The side that won't be used fades once decided
const dropped = (line: (typeof lines.value)[number]) => {
  const d = decisionOf(line)
  return (
    (line.kind === 'removed' && d === 'accepted') ||
    (line.kind === 'added' && d === 'rejected')
  )
}

const acceptedCount = computed(
  () => keys.value.filter((k) => props.decisions[k] === 'accepted').length,
)
</script>

<template>
  <!-- A card that opens at the right of the table's frame and pushes the
       table aside, so the highlighted row stays in view next to its diff -->
  <section
    aria-label="Review changes"
    :aria-hidden="change === null"
    :inert="change === null"
    :class="
      cn(
        'shrink-0 overflow-hidden bg-background duration-300 ease-out motion-reduce:transition-none max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-20',
        // Pushes the table aside as it widens (on phones it covers it instead).
        // Visible at once when opening, so the heading can take focus; hidden
        // only after closing, so it can't be tabbed to while closed
        change
          ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
          : 'invisible w-0 transition-[width,visibility]',
      )
    "
    @keydown.escape="emit('close')"
  >
    <!-- A fixed width inside, so the content doesn't reflow while the panel widens -->
    <div class="flex h-full w-full flex-col sm:w-[26rem]">
      <template v-if="shown && product">
        <header class="relative flex flex-col gap-1 border-b p-4 pr-12">
          <Button
            variant="ghost"
            size="icon"
            class="absolute top-3 right-3 size-7"
            aria-label="Close"
            @click="emit('close')"
          >
            <X />
          </Button>
          <div class="flex items-center gap-2">
            <h3
              ref="heading"
              tabindex="-1"
              class="font-semibold text-foreground outline-none"
            >
              {{ product.name }}
            </h3>
            <Badge
              v-if="shown.kind === 'create'"
              variant="outline"
              class="border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
            >
              New
            </Badge>
            <Badge
              v-else-if="shown.kind === 'delete'"
              variant="outline"
              class="border-red-500/40 text-red-700 dark:text-red-400"
            >
              Removed
            </Badge>
          </div>
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-xs text-muted-foreground">
              {{ product.sku }}
            </p>
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <span class="tabular-nums">
                {{ position.index + 1 }} of {{ position.total }}
              </span>
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
                aria-label="Previous product with changes"
                @click="emit('previous')"
              >
                <ChevronUp />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
                aria-label="Next product with changes"
                @click="emit('next')"
              >
                <ChevronDown />
              </Button>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-4">
          <div class="overflow-hidden rounded-md border font-mono text-xs">
            <div
              class="flex items-center justify-between border-b bg-muted/50 px-3 py-2 text-muted-foreground"
            >
              <span>products/{{ product.sku }}</span>
              <span>
                <span
                  v-if="added"
                  class="text-emerald-700 dark:text-emerald-400"
                >
                  +{{ added }}
                </span>
                {{ ' ' }}
                <span v-if="removed" class="text-red-700 dark:text-red-400">
                  −{{ removed }}
                </span>
              </span>
            </div>
            <table class="w-full border-collapse">
              <tbody>
                <tr
                  v-for="(line, i) in lines"
                  :key="i"
                  :class="
                    cn(
                      line.kind === 'added' &&
                        'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
                      line.kind === 'removed' &&
                        'bg-red-500/10 text-red-900 dark:text-red-200',
                      line.kind === 'context' && 'text-muted-foreground',
                      dropped(line) && 'opacity-40',
                    )
                  "
                >
                  <td v-if="pickable" class="w-8 pl-3 align-middle">
                    <Checkbox
                      v-if="line.kind === 'added' && line.key"
                      class="bg-background"
                      :model-value="decisions[line.key] === 'accepted'"
                      :aria-label="`Accept new ${fieldLabel[line.field].toLowerCase()}: ${line.value}`"
                      @update:model-value="
                        (on) =>
                          emit(
                            'decide',
                            [line.key!],
                            on === true ? 'accepted' : 'rejected',
                          )
                      "
                    />
                  </td>
                  <td
                    aria-hidden="true"
                    class="w-6 py-1.5 pl-3 text-center select-none"
                  >
                    {{
                      line.kind === 'added'
                        ? '+'
                        : line.kind === 'removed'
                          ? '−'
                          : ' '
                    }}
                  </td>
                  <td class="w-24 py-1.5 pr-2">{{ fieldLabel[line.field] }}</td>
                  <td
                    :class="
                      cn(
                        'py-1.5 pr-3 break-words',
                        dropped(line) && 'line-through',
                      )
                    "
                  >
                    <span class="sr-only">
                      {{
                        line.kind === 'added'
                          ? 'New: '
                          : line.kind === 'removed'
                            ? 'Old: '
                            : 'Unchanged: '
                      }}
                    </span>
                    {{ line.value }}
                    <span
                      v-if="line.kind === 'added' && line.moved"
                      class="ml-2 opacity-70"
                    >
                      {{ line.moved }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-if="pickable && state !== 'accepted' && state !== 'rejected'"
            class="mt-3 text-xs text-muted-foreground"
          >
            Tick the changes to keep, or decide them all at once below.
          </p>
        </div>

        <footer class="flex items-center justify-end gap-2 border-t p-4">
          <template v-if="state === 'pending' || state === 'partial'">
            <!-- On phones the two share the row instead of wrapping -->
            <Button
              variant="outline"
              class="flex-1 sm:flex-none"
              @click="emit('decide', targets, 'rejected', true)"
            >
              <X /> {{ verb.reject }}
            </Button>
            <Button
              class="flex-1 sm:flex-none"
              @click="emit('decide', targets, 'accepted', true)"
            >
              <Check /> {{ verb.accept }}
            </Button>
          </template>
          <template v-else>
            <span
              :class="
                cn(
                  'mr-auto text-sm',
                  state === 'accepted'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-muted-foreground',
                )
              "
            >
              {{
                state === 'accepted'
                  ? 'Accepted'
                  : state === 'rejected'
                    ? 'Rejected'
                    : `${acceptedCount} of ${keys.length} accepted`
              }}
            </span>
            <Button variant="ghost" @click="emit('decide', keys, null)">
              Undo
            </Button>
            <Button variant="outline" @click="emit('next')">
              Next <ChevronDown />
            </Button>
          </template>
        </footer>
      </template>
    </div>
  </section>
</template>
