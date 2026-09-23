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
}

const barTrigger =
  'h-7 flex-none rounded-md px-2.5 text-xs font-normal text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-muted'

export function ComponentPreview({ preview, files }: ComponentPreviewProps) {
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
        <Tabs defaultValue={files[0]?.path} className="gap-0">
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
      </TabsContent>
    </Tabs>
  )
}
