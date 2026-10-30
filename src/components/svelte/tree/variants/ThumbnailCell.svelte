<script lang="ts">
  import type { Component } from 'svelte'
  import Backpack from '@lucide/svelte/icons/backpack'
  import Camera from '@lucide/svelte/icons/camera'
  import Droplet from '@lucide/svelte/icons/droplet'
  import Headphones from '@lucide/svelte/icons/headphones'
  import Shirt from '@lucide/svelte/icons/shirt'
  import Watch from '@lucide/svelte/icons/watch'
  import type { ProductKind } from './data'

  const icons = {
    backpack: Backpack,
    headphones: Headphones,
    bottle: Droplet,
    watch: Watch,
    jacket: Shirt,
    camera: Camera,
  } satisfies Record<ProductKind, Component<any>>

  type Props = {
    kind: ProductKind
    depth: number
    isLast: boolean
    expanded: boolean
  }

  let { kind, depth, isLast, expanded }: Props = $props()

  const Icon = $derived(icons[kind])
</script>

{#if depth > 0}
  <!-- The bracket that links variants to their parent's thumbnail: a vertical
       rule with a rounded elbow into each variant, ending on the last one. -->
  <span
    aria-hidden="true"
    class="absolute top-0 left-1/2 h-1/2 w-3 rounded-bl-lg border-b-2 border-l-2 border-border"
  ></span>
  {#if !isLast}
    <span
      aria-hidden="true"
      class="absolute top-1/2 bottom-0 left-1/2 border-l-2 border-border"
    ></span>
  {/if}
{:else}
  <div class="flex size-9 items-center justify-center rounded-lg bg-muted">
    <Icon class="size-5" />
  </div>
  {#if expanded}
    <span
      aria-hidden="true"
      class="absolute top-[calc(50%+1.125rem)] bottom-0 left-1/2 border-l-2 border-border"
    ></span>
  {/if}
{/if}
