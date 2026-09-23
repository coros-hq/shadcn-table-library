import type { PrismTheme } from 'prism-react-renderer'

// Colors come from CSS variables (see styles.css), so code blocks follow the
// light/dark toggle without re-rendering.
export const codeTheme: PrismTheme = {
  plain: { color: 'var(--code-fg)', backgroundColor: 'transparent' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--code-comment)' },
    },
    {
      types: ['punctuation', 'operator', 'keyword', 'attr-name', 'property'],
      style: { color: 'var(--code-muted)' },
    },
    {
      types: [
        'tag',
        'class-name',
        'function',
        'builtin',
        'number',
        'boolean',
        'constant',
        'symbol',
      ],
      style: { color: 'var(--code-accent)' },
    },
    {
      types: [
        'string',
        'attr-value',
        'char',
        'regex',
        'template-string',
        'url',
      ],
      style: { color: 'var(--code-string)' },
    },
    {
      types: ['variable', 'parameter', 'plain'],
      style: { color: 'var(--code-fg)' },
    },
  ],
}
