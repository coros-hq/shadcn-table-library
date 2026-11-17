<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'

  type Props = {
    checked: boolean | 'indeterminate'
    label: string
    onchange: (on: boolean) => void
  }

  let { checked, label, onchange }: Props = $props()
</script>

<Checkbox
  checked={checked === true}
  indeterminate={checked === 'indeterminate'}
  onCheckedChange={(value) => onchange(value === true)}
  aria-label={label}
/>
