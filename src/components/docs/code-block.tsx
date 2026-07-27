import { Suspense, lazy, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { Button } from '#/components/ui/button.tsx'

const CodeBlockHighlight = lazy(() => import('./code-block-highlight.tsx'))

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

export function CodeBlock({
  code,
  language = 'tsx',
  filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const trimmed = code.trim()

  async function handleCopy() {
    await navigator.clipboard.writeText(trimmed)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn('rounded-lg border bg-muted/40', className)}>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {filename ?? ' '}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copied ? 'Copied' : 'Copy code'}
          onClick={handleCopy}
          className="size-6 text-muted-foreground"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <Suspense
          fallback={
            <pre className="p-4 text-sm leading-relaxed text-muted-foreground">
              {trimmed}
            </pre>
          }
        >
          <CodeBlockHighlight code={trimmed} language={language} />
        </Suspense>
      </div>
    </div>
  )
}
