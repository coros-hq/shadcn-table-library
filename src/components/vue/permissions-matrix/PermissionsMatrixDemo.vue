<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { Lock } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { initialGrants, resourceGroups, roles } from './data'
import type { Grants } from './data'
import PermissionsTable from './PermissionsTable.vue'
import { cellsFor } from './columns'
import type { Cell } from './permissions'
import { cellState, changes, getRole, isOn, setCells } from './permissions'

const allCells = cellsFor(resourceGroups.flatMap((g) => g.resources))

// Grants hold Sets that are only ever replaced, never mutated, so a shallow ref is enough
const saved = shallowRef<Grants>(initialGrants)
const grants = shallowRef<Grants>(initialGrants)
const roleId = ref('editor')

const role = computed(() => getRole(roleId.value))
const changed = computed(() => changes(saved.value, grants.value))

const states = computed(() =>
  allCells
    .map((cell) => cellState(roleId.value, cell, grants.value))
    .filter((s) => s.kind !== 'unavailable'),
)
const granted = computed(() => states.value.filter(isOn).length)
const inherited = computed(
  () => states.value.filter((s) => s.kind === 'inherited').length,
)

const isDirty = (id: string) =>
  [...changed.value].some((c) => c.startsWith(`${id}:`))

function update(cells: Cell[], on: boolean) {
  grants.value = setCells(grants.value, roleId.value, cells, on)
}

const roleNote = computed(() => {
  const r = role.value
  if (r.locked)
    return 'System role. It always has every permission and cannot be edited.'
  if (r.inherits) {
    const parent = getRole(r.inherits).name
    return `Inherits everything ${parent} can do. Change those on the ${parent} tab.`
  }
  return 'A base role. Roles that inherit from it get these permissions too.'
})
</script>

<template>
  <div class="space-y-3">
    <div
      role="group"
      aria-label="Role"
      class="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
    >
      <button
        v-for="r in roles"
        :key="r.id"
        type="button"
        :aria-pressed="r.id === roleId"
        class="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
        @click="roleId = r.id"
      >
        <Lock v-if="r.locked" class="size-3.5" />
        {{ r.name }}
        <template v-if="isDirty(r.id)">
          <span aria-hidden="true" class="size-1.5 rounded-full bg-amber-500" />
          <span class="sr-only">(unsaved changes)</span>
        </template>
      </button>
    </div>

    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div class="space-y-0.5">
        <p class="text-sm">
          <span class="font-medium">{{ role.name }}</span>
          {{ ' ' }}
          <span class="text-muted-foreground">{{ role.description }}</span>
        </p>
        <p class="text-xs text-muted-foreground">{{ roleNote }}</p>
      </div>
      <ul
        aria-label="Legend"
        class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
      >
        <li class="flex items-center gap-1.5">
          <Checkbox
            :model-value="true"
            :tabindex="-1"
            aria-hidden="true"
            class="pointer-events-none"
          />
          Granted
        </li>
        <li class="flex items-center gap-1.5">
          <Checkbox
            :model-value="true"
            :tabindex="-1"
            aria-hidden="true"
            class="pointer-events-none data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground"
          />
          Inherited
        </li>
        <li class="flex items-center gap-1.5">
          <Checkbox
            :model-value="true"
            :tabindex="-1"
            aria-hidden="true"
            class="pointer-events-none opacity-50"
          />
          Required by another action
        </li>
        <li class="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            class="w-4 text-center text-muted-foreground/50"
            >–</span
          >
          Not available
        </li>
      </ul>
    </div>

    <PermissionsTable
      :role-id="roleId"
      :grants="grants"
      :changed="changed"
      :set-cells="update"
    />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground tabular-nums">
        {{ granted }} of {{ states.length }} permissions{{
          inherited ? `, ${inherited} inherited` : ''
        }}
      </p>
      <div class="flex items-center gap-2">
        <span
          aria-live="polite"
          :class="
            cn(
              'text-sm whitespace-nowrap tabular-nums',
              changed.size ? 'text-foreground' : 'text-muted-foreground',
            )
          "
        >
          {{
            changed.size
              ? `${changed.size} unsaved change${changed.size === 1 ? '' : 's'}`
              : 'All changes saved'
          }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!changed.size"
          @click="grants = saved"
        >
          Discard
        </Button>
        <Button size="sm" :disabled="!changed.size" @click="saved = grants">
          Save changes
        </Button>
      </div>
    </div>
  </div>
</template>
