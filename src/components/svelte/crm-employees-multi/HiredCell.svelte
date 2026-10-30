<script lang="ts">
  let { hireDate }: { hireDate: string } = $props()

  // Dates are stored as ISO strings; formatting in UTC keeps the server and the
  // browser from disagreeing about which day it is.
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  // A fixed "today" keeps tenure stable across renders and between server and
  // client; swap it for Date.now() in a real app.
  const REFERENCE_DATE = Date.UTC(2025, 9, 1)

  function tenure(hireDate: string) {
    const months = Math.max(
      0,
      Math.floor(
        (REFERENCE_DATE - new Date(`${hireDate}T00:00:00Z`).getTime()) /
          (1000 * 60 * 60 * 24 * 30.44),
      ),
    )
    const years = Math.floor(months / 12)
    return years > 0 ? `${years}y ${months % 12}m` : `${months}m`
  }
</script>

<div class="tabular-nums">
  <p>{dateFormat.format(new Date(`${hireDate}T00:00:00Z`))}</p>
  <p class="text-xs text-muted-foreground">{tenure(hireDate)}</p>
</div>
