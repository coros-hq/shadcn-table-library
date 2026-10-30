<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'

  type Props = {
    checked: boolean
    indeterminate?: boolean
    label: string
    onchange: (checked: boolean) => void
  }

  let { checked, indeterminate = false, label, onchange }: Props = $props()
</script>

<Checkbox
  {checked}
  {indeterminate}
  onCheckedChange={(value) => onchange(!!value)}
  aria-label={label}
/>
