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

export function ComponentPreview({ preview, files }: ComponentPreviewProps) {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">
          <Eye /> Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          <Code2 /> Code
        </TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="rounded-lg border p-6">
        {preview}
      </TabsContent>
      <TabsContent value="code">
        <Tabs defaultValue={files[0]?.path} className="gap-0">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none rounded-t-lg border border-b-0 bg-muted/40 p-0">
            {files.map((file) => (
              <TabsTrigger
                key={file.path}
                value={file.path}
                className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-3 py-2 font-mono text-xs text-muted-foreground data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
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
                className="rounded-t-none border-t-0"
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}
