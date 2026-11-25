<script lang="ts">
  import Download from '@lucide/svelte/icons/download'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Dialog from '$lib/components/ui/dialog/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import { cn } from '$lib/utils.js'
  import { regions, statuses } from './columns'
  import { datePresets } from './export-config'
  import type { DatePreset, ExportConfig, ExportFormat } from './export-config'
  import CheckboxGroup from './CheckboxGroup.svelte'

  type Props = {
    columns: { id: string; label: string }[]
    matchCount: number
    total: number
    open: boolean
    config: ExportConfig
    onreset?: () => void
    onexport?: () => void
  }

  let {
    columns,
    matchCount,
    total,
    open = $bindable(),
    config = $bindable(),
    onreset,
    onexport,
  }: Props = $props()

  function set<TKey extends keyof ExportConfig>(key: TKey, value: ExportConfig[TKey]) {
    config = { ...config, [key]: value }
  }

  const labels = $derived(
    Object.fromEntries(columns.map((c) => [c.id, c.label])),
  )
  const canExport = $derived(matchCount > 0 && config.columns.length > 0)

  // Keep the table's column order, whatever order they were ticked in
  function setColumns(next: string[]) {
    set(
      'columns',
      columns.map((c) => c.id).filter((id) => next.includes(id)),
    )
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Export orders</Dialog.Title>
      <Dialog.Description>
        Choose which orders and columns to include. The table itself stays
        unfiltered.
      </Dialog.Description>
    </Dialog.Header>

    <div class="max-h-[60svh] space-y-5 overflow-y-auto py-1">
      <CheckboxGroup
        label="Status"
        options={statuses}
        bind:selected={() => config.statuses, (next) => set('statuses', next)}
      />
      <CheckboxGroup
        label="Region"
        options={regions}
        bind:selected={() => config.regions, (next) => set('regions', next)}
      />

      <div class="space-y-2">
        <p class="text-sm font-medium">Date</p>
        <Select.Root
          type="single"
          value={config.datePreset}
          onValueChange={(value) => set('datePreset', value as DatePreset)}
        >
          <Select.Trigger class="w-44" aria-label="Date range">
            {datePresets[config.datePreset].label}
          </Select.Trigger>
          <Select.Content>
            {#each Object.entries(datePresets) as [value, preset] (value)}
              <Select.Item {value} label={preset.label}>{preset.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <CheckboxGroup
        label="Columns"
        options={columns.map((c) => c.id)}
        getLabel={(id) => labels[id] ?? id}
        bind:selected={() => config.columns, setColumns}
      />

      <fieldset class="space-y-2">
        <legend class="text-sm font-medium">Format</legend>
        <div class="inline-flex rounded-md border p-0.5">
          {#each ['csv', 'excel'] as const satisfies ExportFormat[] as format (format)}
            <button
              type="button"
              aria-pressed={config.format === format}
              class={cn(
                'rounded-sm px-3 py-1 text-sm transition-colors',
                config.format === format
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onclick={() => set('format', format)}
            >
              {format === 'csv' ? 'CSV' : 'Excel'}
            </button>
          {/each}
        </div>
      </fieldset>
    </div>

    <Dialog.Footer class="items-center gap-2 sm:justify-between">
      <p class="text-sm text-muted-foreground" aria-live="polite">
        <span class="font-medium text-foreground tabular-nums">
          {matchCount} of {total}
        </span>
        rows will be exported
      </p>
      <div class="flex gap-2">
        <Button type="button" variant="ghost" onclick={() => onreset?.()}>
          Reset
        </Button>
        <Button type="button" variant="outline" onclick={() => (open = false)}>
          Cancel
        </Button>
        <Button type="button" disabled={!canExport} onclick={() => onexport?.()}>
          <Download class="size-3.5" />
          Export
        </Button>
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
