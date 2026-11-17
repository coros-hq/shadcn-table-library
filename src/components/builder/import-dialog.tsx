import { useDeferredValue, useMemo, useRef, useState } from 'react'
import {
  Calendar,
  FileUp,
  Hash,
  List,
  Lock,
  SquareCheck,
  Type,
  Upload,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  ImportError,
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ROWS,
  inferImport,
  parseInput,
} from './import'
import type { ImportedData } from './import'
import { MAX_COLUMNS, columnTypes } from './schema'
import type { ColumnSpec, ColumnType } from './schema'

const typeIcon: Record<ColumnType, LucideIcon> = {
  text: Type,
  number: Hash,
  select: List,
  date: Calendar,
  checkbox: SquareCheck,
}

const typeLabel = Object.fromEntries(
  columnTypes.map((t) => [t.value, t.label]),
) as Record<ColumnType, string>

const EXAMPLE = `[
  { "name": "Ada Lovelace", "plan": "Pro", "seats": 12, "renews": "2025-09-01", "active": true },
  { "name": "Alan Turing", "plan": "Free", "seats": 1, "renews": "2025-03-15", "active": false }
]`

type Result =
  | { ok: true; columns: ColumnSpec[]; data: ImportedData }
  | { ok: false; error: string }

function read(input: string, source: string): Result | null {
  if (!input.trim()) return null
  try {
    return { ok: true, ...inferImport(parseInput(input), source) }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof ImportError
          ? error.message
          : 'This data could not be read.',
    }
  }
}

export function ImportDialog({
  onImport,
}: {
  /** Called with the inferred columns and the records, keyed by column id */
  onImport: (columns: ColumnSpec[], data: ImportedData) => void
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('paste')
  const [pasted, setPasted] = useState('')
  const [file, setFile] = useState<{ name: string; text: string } | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  // Typing in a large paste shouldn't wait on parsing every keystroke
  const deferred = useDeferredValue(pasted)
  const result = useMemo(
    () =>
      tab === 'paste'
        ? read(deferred, 'Pasted data')
        : file
          ? read(file.text, file.name)
          : null,
    [tab, deferred, file],
  )

  async function pick(chosen: File | undefined) {
    setFileError(null)
    if (!chosen) return
    if (chosen.size > MAX_IMPORT_BYTES) {
      setFile(null)
      setFileError('That file is more than 5 MB. Try a smaller export.')
      return
    }
    setFile({ name: chosen.name, text: await chosen.text() })
  }

  function confirm() {
    if (!result?.ok) return
    onImport(result.columns, result.data)
    setOpen(false)
  }

  function reset(next: boolean) {
    setOpen(next)
    if (!next) {
      setPasted('')
      setFile(null)
      setFileError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shadow-none"
        >
          <Upload className="h-3.5 w-3.5" />
          Import data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import data</DialogTitle>
          <DialogDescription>
            Paste JSON or CSV, or upload a file. Columns and their types are
            worked out from the data, and you can correct them afterwards.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="paste">Paste</TabsTrigger>
            <TabsTrigger value="file">Upload file</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="space-y-2">
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={EXAMPLE}
              aria-label="Data to import, as JSON or CSV"
              spellCheck={false}
              className="h-48 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            />
            <p className="text-xs text-muted-foreground">
              JSON: an array of objects, or an object holding one (
              <code>{'{ "data": [...] }'}</code>). CSV: a header row first;
              commas, semicolons and tabs all work.
            </p>
          </TabsContent>
          <TabsContent value="file">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                void pick(e.dataTransfer.files[0])
              }}
              className={`flex h-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm ${
                dragging ? 'border-ring bg-muted' : ''
              }`}
            >
              <FileUp className="size-6 text-muted-foreground" />
              <p>
                {file ? (
                  <span className="font-medium">{file.name}</span>
                ) : (
                  'Drop a CSV or JSON file here'
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInput.current?.click()}
              >
                {file ? 'Choose another file' : 'Choose a file'}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,.tsv,.txt,.json,text/csv,application/json"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  void pick(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <p className="text-xs text-muted-foreground">Up to 5 MB</p>
            </div>
          </TabsContent>
        </Tabs>

        <div aria-live="polite" className="space-y-2">
          {fileError && tab === 'file' ? (
            <p className="text-sm text-destructive">{fileError}</p>
          ) : null}
          {result && !result.ok ? (
            <p className="text-sm text-destructive">{result.error}</p>
          ) : null}
          {result?.ok ? (
            <Summary columns={result.columns} data={result.data} />
          ) : null}
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Your rows stay in this browser tab. The share link and the install
          command carry only the columns (names, types and select options),
          never the rows.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => reset(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!result?.ok} onClick={confirm}>
            Use this data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Summary({
  columns,
  data,
}: {
  columns: ColumnSpec[]
  data: ImportedData
}) {
  const rows = data.records.length
  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="text-sm">
        <span className="font-medium">
          {rows.toLocaleString('en-US')} row{rows === 1 ? '' : 's'}
        </span>{' '}
        and{' '}
        <span className="font-medium">
          {columns.length} column{columns.length === 1 ? '' : 's'}
        </span>{' '}
        found. Importing replaces your current columns (Undo brings them back).
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {columns.map((column) => {
          const Icon = typeIcon[column.type]
          return (
            <li
              key={column.id}
              className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
            >
              <Icon className="size-3.5 text-muted-foreground" />
              <span className="max-w-40 truncate">{column.name}</span>
              <span className="text-muted-foreground">
                {typeLabel[column.type]}
                {column.type === 'select'
                  ? ` · ${column.options?.length ?? 0}`
                  : ''}
              </span>
            </li>
          )
        })}
      </ul>
      {data.truncatedRows > 0 ? (
        <p className="text-xs text-muted-foreground">
          Only the first {MAX_IMPORT_ROWS.toLocaleString('en-US')} rows are
          imported; {data.truncatedRows.toLocaleString('en-US')} more were left
          out.
        </p>
      ) : null}
      {data.droppedFields > 0 ? (
        <p className="text-xs text-muted-foreground">
          The builder holds {MAX_COLUMNS} columns, so the last{' '}
          {data.droppedFields} field
          {data.droppedFields === 1 ? ' was' : 's were'} left out.
        </p>
      ) : null}
    </div>
  )
}
