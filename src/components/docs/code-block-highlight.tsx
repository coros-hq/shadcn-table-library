import { Highlight } from 'prism-react-renderer'

import { cn } from '#/lib/utils.ts'
import { codeTheme } from '#/components/docs/code-theme.ts'

interface CodeBlockHighlightProps {
  code: string
  language: string
}

export default function CodeBlockHighlight({
  code,
  language,
}: CodeBlockHighlightProps) {
  return (
    <Highlight code={code} language={language} theme={codeTheme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(className, 'p-4 text-sm leading-relaxed')}
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
  )
}
