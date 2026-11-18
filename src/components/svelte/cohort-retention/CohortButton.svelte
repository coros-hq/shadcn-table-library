<script lang="ts">
  // The cohort's name; pressing it highlights the row
  let {
    id,
    label,
    pressed,
    ontoggle,
  }: { id: string; label: string; pressed: boolean; ontoggle: () => void } =
    $props()
</script>

<button
  type="button"
  aria-pressed={pressed}
  data-cohort={id}
  onclick={ontoggle}
  class="rounded-sm text-left font-medium whitespace-nowrap outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:underline"
>
  {label}
</button>
