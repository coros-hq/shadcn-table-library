<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'

  type Props = {
    checked: boolean
    indeterminate?: boolean
    disabled?: boolean
    label: string
    onchange: (checked: boolean) => void
  }

  let {
    checked,
    indeterminate = false,
    disabled = false,
    label,
    onchange,
  }: Props = $props()
</script>

<Checkbox
  {checked}
  {indeterminate}
  {disabled}
  onCheckedChange={(value) => onchange(!!value)}
  aria-label={label}
/>
