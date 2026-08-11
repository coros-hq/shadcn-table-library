'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button } from '#/components/ui/button.tsx'

const REGISTRY_BASE_URL = 'https://shad-table.dev/r'

interface InstallCommandProps {
  name: string
  /** Full override for the command text — for registry items that don't live at REGISTRY_BASE_URL (e.g. a third-party registry). When set, `name` is ignored. */
  command?: string
}

export function InstallCommand({ name, command: commandOverride }: InstallCommandProps) {
  const [copied, setCopied] = useState(false)
  const command = commandOverride ?? `npx shadcn add ${REGISTRY_BASE_URL}/${name}.json`

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-2.5">
      <code className="overflow-x-auto font-mono text-sm text-foreground">
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={copied ? 'Copied' : 'Copy install command'}
        onClick={handleCopy}
        className="size-7 shrink-0 text-muted-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}
