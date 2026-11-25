import { useEffect, useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'

// Same key the example previews use, so choosing Svelte once carries across
// the docs pages
const FRAMEWORK_KEY = 'shad-table:framework'

// Kept in sync with the preview toggle without a shared store
const FRAMEWORK_EVENT = 'shad-table:framework-change'

export type SnippetFramework = 'react' | 'svelte'

const trigger =
  'h-7 flex-none rounded-md px-2.5 text-xs font-normal text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-muted'

function readFramework(): SnippetFramework {
  try {
    return localStorage.getItem(FRAMEWORK_KEY) === 'svelte' ? 'svelte' : 'react'
  } catch {
    return 'react'
  }
}

/**
 * Remembers the React/Svelte choice for prose code samples. Starts on React so
 * server and client markup match, then applies the saved choice after mount.
 */
export function useSnippetFramework() {
  const [framework, setFramework] = useState<SnippetFramework>('react')
  useEffect(() => {
    setFramework(readFramework())
    const sync = (event: Event) => {
      const next = (event as CustomEvent<string>).detail
      if (next === 'react' || next === 'svelte') setFramework(next)
    }
    window.addEventListener(FRAMEWORK_EVENT, sync)
    return () => window.removeEventListener(FRAMEWORK_EVENT, sync)
  }, [])

  function changeFramework(next: string) {
    setFramework(next as SnippetFramework)
    try {
      localStorage.setItem(FRAMEWORK_KEY, next)
    } catch {
      // storage unavailable; the choice just won't persist
    }
    window.dispatchEvent(new CustomEvent(FRAMEWORK_EVENT, { detail: next }))
  }

  return [framework, changeFramework] as const
}

export function FrameworkToggle({
  value,
  onChange,
}: {
  value: SnippetFramework
  onChange: (next: string) => void
}) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="h-auto gap-1 bg-transparent p-0">
        <TabsTrigger value="react" className={trigger}>
          React
        </TabsTrigger>
        <TabsTrigger value="svelte" className={trigger}>
          Svelte
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
