<script lang="ts">
  let { customer, email }: { customer: string; email: string } = $props()
</script>

<div class="flex flex-col">
  <span class="font-medium">{customer}</span>
  <span class="text-xs text-muted-foreground">{email}</span>
</div>
