<script lang="ts">
  import ArchiveButton from './ArchiveButton.svelte'
  import DeleteButton from './DeleteButton.svelte'
  import SyncButton from './SyncButton.svelte'
  import type { Source } from './data'

  type Props = {
    source: Source
    busy: boolean
    confirming: boolean
    onsync: () => void
    onarchive: () => void
    onrequestdelete: () => void
    onconfirmdelete: () => void
    oncanceldelete: () => void
  }

  let {
    source,
    busy,
    confirming,
    onsync,
    onarchive,
    onrequestdelete,
    onconfirmdelete,
    oncanceldelete,
  }: Props = $props()
</script>

<div class="flex items-center justify-end gap-1">
  <SyncButton status={source.status} {onsync} />
  <ArchiveButton
    name={source.name}
    disabled={busy}
    concealed={confirming}
    {onarchive}
  />
  <DeleteButton
    name={source.name}
    {confirming}
    disabled={busy}
    onrequest={onrequestdelete}
    onconfirm={onconfirmdelete}
    oncancel={oncanceldelete}
  />
</div>
