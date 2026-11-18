<script lang="ts">
  import type { Person } from './data'

  // Scheduled hours against the contract
  let {
    person,
    hours,
    diff,
    status,
  }: {
    person: Person
    hours: number
    diff: number
    status: 'under' | 'exact' | 'over'
  } = $props()
</script>

<div class="flex min-w-20 flex-col items-end gap-1">
  <span class="text-sm tabular-nums">
    {hours}<span class="text-muted-foreground"> / {person.contract}h</span>
  </span>
  <span
    class="text-xs tabular-nums {status === 'over'
      ? 'font-medium text-amber-700 dark:text-amber-400'
      : 'text-muted-foreground'}"
  >
    {status === 'exact'
      ? 'On contract'
      : status === 'over'
        ? `${diff}h over`
        : `${-diff}h free`}
  </span>
</div>
