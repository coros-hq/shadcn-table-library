<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import type { EmployeeStatus } from './data'

  const statusClassName: Record<EmployeeStatus, string> = {
    Active:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    Remote: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    'On leave':
      'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    Probation:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  }

  let { status }: { status: EmployeeStatus } = $props()
</script>

<Badge variant="outline" class={cn('border-transparent', statusClassName[status])}>
  {status}
</Badge>
