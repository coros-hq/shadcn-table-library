<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { ChevronDown, ChevronUp, SendHorizontal, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { agents, priorities, statuses } from './data'
import type { Ticket } from './data'
import PriorityLabel from './PriorityLabel.vue'
import { statusStyle } from './styles'
import { formatTime, initials } from './tickets'
import type { Changes } from './tickets'

const props = defineProps<{
  /** The ticket to show, or null when the panel is closed */
  ticket: Ticket | null
  /** "3 of 9" in the current filter and sort */
  position: { index: number; total: number }
  hasPrevious: boolean
  hasNext: boolean
  /** Where focus goes on close when the ticket's row is gone */
  fallbackFocus: () => void
}>()

const emit = defineEmits<{
  previous: []
  next: []
  close: []
  change: [changes: Changes]
  reply: [body: string]
}>()

// Keeps the last ticket on screen while the panel slides out
const shown = shallowRef(props.ticket)
watch(
  () => props.ticket,
  (t) => {
    if (t) shown.value = t
  },
)

const open = computed(() => props.ticket !== null)
const panel = ref<HTMLElement>()
const heading = ref<HTMLElement>()

watch(
  () => props.ticket?.id ?? null,
  async (openId, lastId) => {
    await nextTick()
    if (openId) {
      // Opened from the table: announce the ticket by focusing its subject.
      // Switched with the panel's own buttons: leave focus where it is.
      if (!panel.value?.contains(document.activeElement)) heading.value?.focus()
    } else if (lastId) {
      // Closed: back to the subject that opened it
      const row = document.querySelector<HTMLElement>(
        `[data-ticket-id="${lastId}"]`,
      )
      if (row) row.focus()
      else props.fallbackFocus()
    }
  },
)

// A half-written reply doesn't follow you to the next ticket
const reply = ref('')
const sent = ref('')
watch(
  () => shown.value?.id,
  () => {
    reply.value = ''
    sent.value = ''
  },
)

const thread = ref<HTMLElement>()
async function send() {
  const t = shown.value
  if (!t || !reply.value.trim()) return
  emit('reply', reply.value)
  sent.value =
    t.status === 'open'
      ? 'Reply sent. The ticket is now pending.'
      : 'Reply sent.'
  reply.value = ''
  await nextTick()
  thread.value?.lastElementChild?.scrollIntoView({ block: 'nearest' })
}

function onKeydown(e: KeyboardEvent) {
  // Escape in a Select's list (rendered elsewhere in the page) closes only
  // the list, not the panel
  if (e.key === 'Escape' && panel.value?.contains(e.target as Node))
    emit('close')
}

const field = (id: string) => `${shown.value?.id}-${id}`
</script>

<template>
  <section
    id="ticket-panel"
    ref="panel"
    aria-label="Ticket details"
    :aria-hidden="!open"
    :inert="!open"
    :class="
      cn(
        'shrink-0 overflow-hidden bg-background duration-300 ease-out motion-reduce:transition-none max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-20',
        // Pushes the table aside as it widens (on phones it covers it
        // instead). Visible at once when opening, so the heading can take
        // focus; hidden only after closing, so it can't be tabbed to
        open
          ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
          : 'invisible w-0 transition-[width,visibility]',
      )
    "
    @keydown="onKeydown"
  >
    <!-- A fixed width inside, so the content doesn't reflow while it widens -->
    <div v-if="shown" class="flex h-full w-full flex-col sm:w-[26rem]">
      <header class="space-y-2 border-b p-4">
        <div class="flex items-center justify-between gap-2">
          <p class="font-mono text-xs text-muted-foreground">{{ shown.id }}</p>
          <div class="flex items-center gap-1">
            <span class="mr-1 text-xs text-muted-foreground tabular-nums">
              {{ position.index + 1 }} of {{ position.total }}
            </span>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Previous ticket"
              :disabled="!hasPrevious"
              @click="emit('previous')"
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Next ticket"
              :disabled="!hasNext"
              @click="emit('next')"
            >
              <ChevronDown />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Close ticket"
              @click="emit('close')"
            >
              <X />
            </Button>
          </div>
        </div>
        <h2
          ref="heading"
          tabindex="-1"
          class="text-base leading-snug font-semibold outline-none"
        >
          {{ shown.subject }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ shown.customer.name }} · {{ shown.customer.company }} ·
          <span class="break-all">{{ shown.customer.email }}</span>
        </p>
      </header>

      <div class="flex-1 space-y-5 overflow-y-auto p-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1.5">
            <Label :for="field('status')" class="text-xs">Status</Label>
            <Select
              :model-value="shown.status"
              @update:model-value="
                (v) => emit('change', { status: v as Ticket['status'] })
              "
            >
              <SelectTrigger :id="field('status')" class="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in statuses" :key="s" :value="s">
                  {{ statusStyle[s].label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <Label :for="field('priority')" class="text-xs">Priority</Label>
            <Select
              :model-value="shown.priority"
              @update:model-value="
                (v) => emit('change', { priority: v as Ticket['priority'] })
              "
            >
              <SelectTrigger :id="field('priority')" class="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="p in priorities" :key="p" :value="p">
                  <PriorityLabel :priority="p" />
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="col-span-2 space-y-1.5">
            <Label :for="field('assignee')" class="text-xs">Assignee</Label>
            <Select
              :model-value="shown.assignee"
              @update:model-value="
                (v) => emit('change', { assignee: v as Ticket['assignee'] })
              "
            >
              <SelectTrigger :id="field('assignee')" class="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="a in agents" :key="a" :value="a">
                  {{ a }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <section aria-label="Conversation" class="space-y-3">
          <h3 class="text-xs font-medium text-muted-foreground">
            Conversation
          </h3>
          <ol ref="thread" class="space-y-3">
            <li v-for="(m, i) in shown.messages" :key="i" class="flex gap-2.5">
              <span
                aria-hidden="true"
                :class="
                  cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
                    m.from === 'agent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )
                "
              >
                {{ initials(m.author) }}
              </span>
              <div class="min-w-0 flex-1 space-y-1">
                <p class="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span class="font-medium">{{ m.author }}</span>
                  <span class="text-xs text-muted-foreground tabular-nums">
                    {{ formatTime(m.at) }}
                  </span>
                </p>
                <p
                  :class="
                    cn(
                      'rounded-md px-3 py-2 text-sm',
                      m.from === 'agent' ? 'bg-muted/60' : 'border',
                    )
                  "
                >
                  {{ m.body }}
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <form class="space-y-2 border-t p-4" @submit.prevent="send">
        <Label :for="field('reply')" class="sr-only">
          Reply to {{ shown.customer.name }}
        </Label>
        <textarea
          :id="field('reply')"
          v-model="reply"
          rows="3"
          :placeholder="`Reply to ${shown.customer.name.split(' ')[0]}…`"
          class="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          @input="sent = ''"
          @keydown.meta.enter.prevent="send"
          @keydown.ctrl.enter.prevent="send"
        />
        <div class="flex items-center justify-between gap-2">
          <p aria-live="polite" class="text-xs text-muted-foreground">
            {{ sent || '⌘ Enter to send' }}
          </p>
          <Button type="submit" size="sm" :disabled="!reply.trim()">
            <SendHorizontal /> Send reply
          </Button>
        </div>
      </form>
    </div>
  </section>
</template>
