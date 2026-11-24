<script lang="ts">
  let { customer, email }: { customer: string; email: string } = $props()
</script>

<div>
  <div class="font-medium">{customer}</div>
  <div class="text-xs text-muted-foreground">{email}</div>
</div>
