<script lang="ts">
  // Right-aligned figures: the attempts count, the duration and their headings
  type Props = {
    text: string
    /** Shown muted after the text, e.g. " / 3" */
    suffix?: string
    muted?: boolean
    title?: string
  }

  let { text, suffix, muted = false, title }: Props = $props()
</script>

<span
  class="block text-right tabular-nums {muted ? 'text-muted-foreground' : ''}"
  {title}
>
  {text}{#if suffix}<span class="text-muted-foreground">{suffix}</span>{/if}
</span>
