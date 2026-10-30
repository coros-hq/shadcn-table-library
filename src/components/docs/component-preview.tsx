import * as React from 'react'
import { Code2, Eye } from 'lucide-react'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#/components/ui/tabs.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import svelteAdapterSource from '#/components/svelte/shared/data-table/data-table.svelte.ts?raw'
import svelteFlexRenderSource from '#/components/svelte/shared/data-table/flex-render.svelte?raw'
import svelteIndexSource from '#/components/svelte/shared/data-table/index.ts?raw'
import svelteRenderHelpersSource from '#/components/svelte/shared/data-table/render-helpers.ts?raw'

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
  // Optional Svelte 5 port of the same example; adds Svelte to the framework toggle
  svelteFiles?: ComponentPreviewFile[]
  // Install commands shown under the Svelte code; `adapter` adds the table-core helper files
  svelteDeps?: { npm: string[]; shadcn: string[]; adapter?: boolean }
  // Drops the card and control shadows for a flat look
  flat?: boolean
}

type Framework = 'react' | 'vue' | 'svelte'

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

// @tanstack/svelte-table v8 only supports Svelte 3/4, so Svelte 5 code drives
// @tanstack/table-core through this adapter (the same one shadcn-svelte ships)
const SVELTE_ADAPTER_FILES: ComponentPreviewFile[] = [
  {
    path: 'src/lib/components/ui/data-table/data-table.svelte.ts',
    code: svelteAdapterSource,
  },
  {
    path: 'src/lib/components/ui/data-table/flex-render.svelte',
    code: svelteFlexRenderSource,
  },
  {
    path: 'src/lib/components/ui/data-table/render-helpers.ts',
    code: svelteRenderHelpersSource,
  },
  {
    path: 'src/lib/components/ui/data-table/index.ts',
    code: svelteIndexSource,
  },
]

const FRAMEWORK_KEY = 'shad-table:framework'

function readFramework(): Framework {
  try {
    const saved = localStorage.getItem(FRAMEWORK_KEY)
    return saved === 'vue' || saved === 'svelte' ? saved : 'react'
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
  svelteFiles,
  svelteDeps,
  flat,
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

  // A saved choice may not exist on this page; fall back to React
  const active: Framework =
    (framework === 'vue' && vueFiles) || (framework === 'svelte' && svelteFiles)
      ? framework
      : 'react'
  const files =
    active === 'vue'
      ? vueFiles!
      : active === 'svelte'
        ? svelteFiles!
        : reactFiles

  return (
    // Preview and code share one card; the toggle lives in its top bar
    <Tabs
      defaultValue="preview"
      className={`gap-0 overflow-hidden rounded-xl border bg-card ${
        flat ? 'shadow-none [&_*]:shadow-none' : 'shadow-sm'
      }`}
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
        {vueFiles || svelteFiles ? (
          <Tabs
            value={active}
            onValueChange={changeFramework}
            className="ml-auto"
          >
            <TabsList className="h-auto gap-1 bg-transparent p-0">
              <TabsTrigger value="react" className={barTrigger}>
                React
              </TabsTrigger>
              {vueFiles ? (
                <TabsTrigger value="vue" className={barTrigger}>
                  Vue
                </TabsTrigger>
              ) : null}
              {svelteFiles ? (
                <TabsTrigger value="svelte" className={barTrigger}>
                  Svelte
                </TabsTrigger>
              ) : null}
            </TabsList>
          </Tabs>
        ) : null}
      </div>
      {/* Demos that paint bg-background (e.g. pinned columns) should match
          this surface, not the page, so redefine it here as an opaque tint */}
      <TabsContent
        value="preview"
        className="bg-background p-4 [--background:color-mix(in_oklch,var(--muted)_20%,var(--card))] sm:p-6"
      >
        {preview}
      </TabsContent>
      <TabsContent value="code">
        <Tabs key={active} defaultValue={files[0]?.path} className="gap-0">
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
        {vueFiles && active === 'vue' && vueDeps ? (
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
        {vueFiles && active === 'vue' && vueDeps?.valueUpdater ? (
          <CodeBlock
            filename="src/lib/utils.ts (add this helper)"
            code={VALUE_UPDATER}
            className="rounded-none border-0 border-t"
          />
        ) : null}
        {svelteFiles && active === 'svelte' && svelteDeps ? (
          <CodeBlock
            filename="Install (Svelte)"
            language="bash"
            code={[
              `npm i ${['@tanstack/table-core@^8', ...svelteDeps.npm].join(' ')}`,
              svelteDeps.shadcn.length
                ? `npx shadcn-svelte@latest add ${svelteDeps.shadcn.join(' ')}`
                : null,
            ]
              .filter(Boolean)
              .join('\n')}
            className="rounded-none border-0 border-t"
          />
        ) : null}
        {svelteFiles && active === 'svelte' && svelteDeps?.adapter ? (
          <Tabs defaultValue={SVELTE_ADAPTER_FILES[0].path} className="gap-0">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-y bg-transparent p-0">
              {SVELTE_ADAPTER_FILES.map((file) => (
                <TabsTrigger
                  key={file.path}
                  value={file.path}
                  className="flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-3 py-2 font-mono text-xs font-normal text-muted-foreground data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
                >
                  {file.path.split('/').pop()}
                </TabsTrigger>
              ))}
            </TabsList>
            {SVELTE_ADAPTER_FILES.map((file) => (
              <TabsContent key={file.path} value={file.path}>
                <CodeBlock
                  filename={`${file.path} (add this helper)`}
                  code={file.code}
                  className="rounded-none border-0"
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
