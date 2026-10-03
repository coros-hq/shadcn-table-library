import * as React from 'react'
import { Code2, Eye } from 'lucide-react'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#/components/ui/tabs.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

export interface ComponentPreviewFile {
  path: string
  code: string
  language?: string
}

interface ComponentPreviewProps {
  preview: React.ReactNode
  files: ComponentPreviewFile[]
  // Optional Vue port of the same example; adds a React | Vue toggle to the Code tab
  vueFiles?: ComponentPreviewFile[]
  // Install commands shown under the Vue code (derived from the Vue sources' imports)
  vueDeps?: { npm: string[]; shadcn: string[]; valueUpdater?: boolean }
}

type Framework = 'react' | 'vue'

// Bridges TanStack's updater callbacks to Vue refs; shadcn-vue's Data Table guide uses the same helper
const VALUE_UPDATER = `import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

export function valueUpdater<T extends Updater<any>>(
  updaterOrValue: T,
  ref: Ref,
) {
  ref.value =
    typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}`

const FRAMEWORK_KEY = 'shad-table:framework'

function readFramework(): Framework {
  try {
    return localStorage.getItem(FRAMEWORK_KEY) === 'vue' ? 'vue' : 'react'
  } catch {
    return 'react'
  }
}

const barTrigger =
  'h-7 flex-none rounded-md px-2.5 text-xs font-normal text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-muted'

export function ComponentPreview({
  preview,
  files: reactFiles,
  vueFiles,
  vueDeps,
}: ComponentPreviewProps) {
  // Start on React so server and client markup match, then apply the saved choice
  const [framework, setFramework] = React.useState<Framework>('react')
  React.useEffect(() => setFramework(readFramework()), [])

  function changeFramework(next: string) {
    setFramework(next as Framework)
    try {
      localStorage.setItem(FRAMEWORK_KEY, next)
    } catch {
      // storage unavailable; the choice just won't persist
    }
  }

  const files = vueFiles && framework === 'vue' ? vueFiles : reactFiles

  return (
    // Preview and code share one card; the toggle lives in its top bar
    <Tabs
      defaultValue="preview"
      className="gap-0 overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex items-center border-b px-2 py-1.5">
        <TabsList className="h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="preview" className={barTrigger}>
            <Eye className="size-3.5" /> Preview
          </TabsTrigger>
          <TabsTrigger value="code" className={barTrigger}>
            <Code2 className="size-3.5" /> Code
          </TabsTrigger>
        </TabsList>
        {vueFiles ? (
          <Tabs
            value={framework}
            onValueChange={changeFramework}
            className="ml-auto"
          >
            <TabsList className="h-auto gap-1 bg-transparent p-0">
              <TabsTrigger value="react" className={barTrigger}>
                React
              </TabsTrigger>
              <TabsTrigger value="vue" className={barTrigger}>
                Vue
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
      </div>
      {/* Demos that paint bg-background (e.g. pinned columns) should match
          this surface, not the page, so redefine it here as an opaque tint */}
      <TabsContent
        value="preview"
        className="bg-background p-6 [--background:color-mix(in_oklch,var(--muted)_20%,var(--card))] sm:p-8"
      >
        {preview}
      </TabsContent>
      <TabsContent value="code">
        <Tabs key={framework} defaultValue={files[0]?.path} className="gap-0">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
            {files.map((file) => (
              <TabsTrigger
                key={file.path}
                value={file.path}
                className="flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-3 py-2 font-mono text-xs font-normal text-muted-foreground data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
              >
                {file.path.split('/').pop()}
              </TabsTrigger>
            ))}
          </TabsList>
          {files.map((file) => (
            <TabsContent key={file.path} value={file.path}>
              <CodeBlock
                filename={file.path}
                code={file.code}
                language={file.language}
                className="rounded-none border-0"
              />
            </TabsContent>
          ))}
        </Tabs>
        {vueFiles && framework === 'vue' && vueDeps ? (
          <CodeBlock
            filename="Install (Vue)"
            language="bash"
            code={[
              `npm i ${['@tanstack/vue-table@^8', ...vueDeps.npm].join(' ')}`,
              vueDeps.shadcn.length
                ? `npx shadcn-vue@latest add ${vueDeps.shadcn.join(' ')}`
                : null,
            ]
              .filter(Boolean)
              .join('\n')}
            className="rounded-none border-0 border-t"
          />
        ) : null}
        {vueFiles && framework === 'vue' && vueDeps?.valueUpdater ? (
          <CodeBlock
            filename="src/lib/utils.ts (add this helper)"
            code={VALUE_UPDATER}
            className="rounded-none border-0 border-t"
          />
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
