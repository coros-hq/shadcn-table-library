<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import type { EmployeeStatus } from './data'

  const statusClassName: Record<EmployeeStatus, string> = {
    Active:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    Remote: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    'On leave':
      'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    Probation:
      'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  }

  let { status }: { status: EmployeeStatus } = $props()
</script>

<Badge variant="outline" class={cn('border-transparent', statusClassName[status])}>
  {status}
</Badge>
