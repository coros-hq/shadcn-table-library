<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js'
  import { cn } from '$lib/utils.js'
  import { fields } from './schema'
  import type { FieldId } from './schema'
  import type { Mapping } from './review'

  const SKIP = '__skip'

  /** A column header: the CSV's own name, and the field it is imported into */
  type Props = {
    header: string
    column: number
    mapping: Mapping
    onchange: (field: FieldId | null) => void
  }

  let { header, column, mapping, onchange }: Props = $props()

  const value = $derived(mapping[column])
  const usedElsewhere = (id: FieldId) =>
    mapping.some((f, i) => f === id && i !== column)
</script>

<div class="flex min-w-36 flex-col gap-1 py-2">
  <span
    class={cn(
      'truncate text-xs font-normal',
      value ? 'text-muted-foreground' : 'text-muted-foreground/70',
    )}
    title={header}
  >
    {header}
  </span>
  <Select.Root
    type="single"
    value={value ?? SKIP}
    onValueChange={(v) => onchange(v === SKIP ? null : (v as FieldId))}
  >
    <Select.Trigger
      size="sm"
      aria-label={`Import column "${header}" as`}
      class={cn(
        'w-full bg-background font-medium',
        !value && 'border-dashed font-normal text-muted-foreground',
      )}
    >
      <!-- Explicit text, so the hints inside the items stay out of the trigger -->
      {value ? fields.find((f) => f.id === value)?.label : "Don't import"}
    </Select.Trigger>
    <Select.Content>
      {#each fields as field (field.id)}
        <Select.Item value={field.id} label={field.label}>
          {field.label}
          {#if field.required}
            <span class="text-muted-foreground">required</span>
          {/if}
          {#if usedElsewhere(field.id)}
            <span class="text-muted-foreground">· moves here</span>
          {/if}
        </Select.Item>
      {/each}
      <Select.Separator />
      <Select.Item value={SKIP} label="Don't import">Don't import</Select.Item>
    </Select.Content>
  </Select.Root>
</div>
