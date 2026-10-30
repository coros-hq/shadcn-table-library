<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js'
  import { cn } from '$lib/utils.js'

  type Props = {
    value: number
    /** Return an error message to block the commit, or null to accept it. */
    validate?: (value: number) => string | null
    suffix?: string
    label: string
    disabled?: boolean
    oncommit?: (value: number) => void
  }

  let { value, validate, suffix, label, disabled, oncommit }: Props = $props()

  let draft = $state<string | null>(null)
  let error = $state<string | null>(null)

  function commit() {
    if (draft === null) return
    const n = Number(draft)
    const message =
      draft.trim() === '' || !Number.isInteger(n) || n < 0
        ? 'Enter a whole number ≥ 0'
        : (validate?.(n) ?? null)

    // An invalid value keeps the input open so the user can fix it in place,
    // rather than silently snapping back to the old number.
    if (message) {
      error = message
      return
    }
    draft = null
    error = null
    if (n !== value) oncommit?.(n)
  }

  function cancel() {
    draft = null
    error = null
  }
</script>

{#if draft !== null}
  <div class="w-24">
    <Input
      type="number"
      inputmode="numeric"
      min="0"
      aria-label={label}
      aria-invalid={error ? true : undefined}
      value={draft}
      class="h-7 px-2 tabular-nums"
      oninput={(e) => {
        draft = e.currentTarget.value
        error = null
      }}
      onblur={() => (error ? cancel() : commit())}
      onkeydown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') cancel()
      }}
      {@attach (el) => el.focus()}
    />
    {#if error}
      <p role="alert" class="mt-1 text-xs text-destructive">
        {error}
      </p>
    {/if}
  </div>
{:else}
  <button
    type="button"
    {disabled}
    aria-label="Edit {label}"
    class={cn(
      '-mx-1.5 rounded border border-dashed border-transparent px-1.5 py-1 text-left tabular-nums',
      'hover:border-border hover:bg-muted focus-visible:border-ring focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent disabled:hover:bg-transparent',
    )}
    onclick={() => (draft = String(value))}
  >
    {value.toLocaleString()}
    {#if suffix}
      <span class="text-muted-foreground"> {suffix}</span>
    {/if}
  </button>
{/if}
