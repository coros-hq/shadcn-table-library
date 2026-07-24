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
      <TabsContent value="code" className="space-y-4">
        {files.map((file) => (
          <CodeBlock
            key={file.path}
            filename={file.path}
            code={file.code}
            language={file.language}
          />
        ))}
      </TabsContent>
    </Tabs>
  )
}
