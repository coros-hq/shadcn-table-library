<script lang="ts">
  import type { Snippet } from 'svelte'
  import * as Tabs from '$lib/components/ui/tabs/index.js'

  type View = 'mobile' | 'desktop'

  const MOBILE_WIDTH = 375
  // Comfortably past the table's 768px container-query threshold. This is a
  // min-width, not a width — the preview pane itself is often narrower than
  // 768px once the docs sidebar is accounted for, so "Desktop" has to force
  // the simulated width (with horizontal scroll if needed) rather than just
  // taking whatever room happens to be available, the same way a browser's
  // device toolbar forces its simulated viewport.
  const DESKTOP_MIN_WIDTH = 900

  let { children }: { children: Snippet } = $props()

  let view = $state<View>('desktop')

  const frameStyle = $derived(
    view === 'mobile'
      ? `width: ${MOBILE_WIDTH}px; max-width: 100%`
      : `min-width: ${DESKTOP_MIN_WIDTH}px`,
  )
</script>

<div>
  <Tabs.Root bind:value={view} class="mb-3">
    <Tabs.List>
      <Tabs.Trigger value="mobile">Mobile</Tabs.Trigger>
      <Tabs.Trigger value="desktop">Desktop</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>
  <div class="overflow-x-auto">
    <div class="mx-auto" style={frameStyle}>
      {@render children()}
    </div>
  </div>
</div>
