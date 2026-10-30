<script lang="ts">
  type Props = {
    data: number[]
    width?: number
    height?: number
    class?: string
  }

  let { data, width = 96, height = 28, class: className }: Props = $props()

  const points = $derived.by(() => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1)

    return data
      .map((value, i) => {
        const x = i * stepX
        const y = height - ((value - min) / range) * height
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  })
</script>

{#if data.length >= 2}
  <svg
    class={className}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    aria-hidden="true"
  >
    <polyline
      {points}
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/if}
