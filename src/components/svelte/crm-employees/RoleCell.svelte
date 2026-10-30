<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { Department } from './data'

  const departmentDot: Record<Department, string> = {
    Engineering: 'bg-blue-500',
    Design: 'bg-pink-500',
    Sales: 'bg-emerald-500',
    Marketing: 'bg-orange-500',
    Finance: 'bg-teal-500',
    'People Ops': 'bg-violet-500',
    Support: 'bg-amber-500',
  }

  let { role, department }: { role: string; department: Department } = $props()
</script>

<div>
  <p>{role}</p>
  <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
    <span aria-hidden="true" class={cn('size-1.5 rounded-full', departmentDot[department])}></span>
    {department}
  </p>
</div>
