'use client'

import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Check, Copy } from 'lucide-react'

import { Button } from '#/components/ui/button.tsx'

const REGISTRY_BASE_URL = 'https://www.shad-table.dev/r'

interface InstallCommandProps {
  name: string
  /** Full override for the command text — for registry items that don't live at REGISTRY_BASE_URL (e.g. a third-party registry). When set, `name` is ignored. */
  command?: string
}

export function InstallCommand({
  name,
  command: commandOverride,
}: InstallCommandProps) {
  const [copied, setCopied] = useState(false)
  const isV9 = useRouterState({
    select: (s) =>
      s.location.pathname === '/v9' || s.location.pathname.startsWith('/v9/'),
  })
  const command =
    commandOverride ??
    `npx shadcn add ${REGISTRY_BASE_URL}/${name}${isV9 ? '-v9' : ''}.json`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      // clipboard blocked (insecure context or denied); don't claim success
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-1.5">
      <code
        tabIndex={0}
        className="min-w-0 overflow-x-auto rounded-sm font-mono text-xs whitespace-nowrap text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="text-muted-foreground select-none">$ </span>
        <span className="select-all">{command}</span>
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={copied ? 'Copied' : 'Copy install command'}
        onClick={handleCopy}
        className="size-7 shrink-0 text-muted-foreground"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  )
}
