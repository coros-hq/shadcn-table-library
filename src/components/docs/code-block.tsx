import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Check, Copy } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { Button } from '#/components/ui/button.tsx'
import { useTheme } from '#/hooks/use-theme.ts'

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
  const { theme } = useTheme()
  const trimmed = code.trim()

  async function handleCopy() {
    await navigator.clipboard.writeText(trimmed)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn('rounded-lg border bg-muted/40', className)}
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {filename ?? ' '}
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
        <Highlight
          code={trimmed}
          language={language}
          theme={theme === 'dark' ? themes.oneDark : themes.oneLight}
        >
          {({
            className: highlightClassName,
            style,
            tokens,
            getLineProps,
            getTokenProps,
          }) => (
            <pre
              className={cn(
                highlightClassName,
                'p-4 text-sm leading-relaxed',
              )}
              style={{ ...style, background: 'transparent' }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}
