import { useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, FileSpreadsheet, Upload } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { parseCsv } from './csv'
import type { CsvData } from './csv'
import { ReviewTable } from './data-table'
import {
  assign,
  autoMap,
  inView,
  missingRequired,
  review,
  toRecords,
} from './review'
import type { CustomerRecord, Mapping, View } from './review'
import { sampleCsv } from './sample'

interface ImportFile {
  name: string
  csv: CsvData
  mapping: Mapping
}

const sample = (): ImportFile => {
  const csv = parseCsv(sampleCsv)
  return { name: 'customers-export.csv', csv, mapping: autoMap(csv.headers) }
}

const views: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'attention', label: 'Needs fixing' },
  { id: 'ready', label: 'Ready' },
  { id: 'skipped', label: 'Skipped' },
]

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function CsvImportDemo() {
  const [file, setFile] = useState<ImportFile>(sample)
  const [skipped, setSkippedIds] = useState<ReadonlySet<string>>(new Set())
  const [view, setView] = useState<View>('all')
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState<CustomerRecord[] | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const rows = useMemo(
    () => review(file.csv, file.mapping, skipped),
    [file, skipped],
  )
  const missing = missingRequired(file.mapping)
  const count = (v: View) => rows.filter((r) => inView(r.status, v)).length
  const ready = count('ready')
  const attention = count('attention')

  function load(next: ImportFile) {
    setFile(next)
    setSkippedIds(new Set())
    setView('all')
    setError(null)
    setImported(null)
  }

  async function upload(chosen: File | undefined) {
    if (!chosen) return
    try {
      const csv = parseCsv(await chosen.text())
      load({ name: chosen.name, csv, mapping: autoMap(csv.headers) })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This file could not be read.')
    }
  }

  const meta = {
    mapping: file.mapping,
    setField: (column: number, field: Mapping[number]) =>
      setFile((f) => ({ ...f, mapping: assign(f.mapping, column, field) })),
    setCell: (rowId: string, column: number, value: string) =>
      setFile((f) => ({
        ...f,
        csv: {
          ...f.csv,
          rows: f.csv.rows.map((cells, i) =>
            String(i) === rowId
              ? cells.map((c, j) => (j === column ? value : c))
              : cells,
          ),
        },
      })),
    setSkipped: (ids: string[], skip: boolean) =>
      setSkippedIds((current) => {
        const next = new Set(current)
        for (const id of ids) {
          if (skip) next.add(id)
          else next.delete(id)
        }
        return next
      }),
  }

  if (imported) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border p-6">
        <CircleCheck className="size-6 text-emerald-600" />
        <div>
          <p className="font-medium">
            Imported {plural(imported.length, 'customer')}
          </p>
          <p className="text-sm text-muted-foreground">
            Values were cleaned up on the way in: emails lowercased, plans and
            country codes in canonical form, seats as numbers.
          </p>
        </div>
        <pre className="max-h-48 w-full overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(imported.slice(0, 2), null, 2)}
        </pre>
        <Button variant="outline" size="sm" onClick={() => load(sample())}>
          Start over
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{file.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {plural(rows.length, 'row')}
          </span>
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => load(sample())}>
            Use sample file
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => input.current?.click()}
          >
            <Upload /> Upload CSV
          </Button>
          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              void upload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {missing.length ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" />
          Choose a column for {missing.map((f) => f.label).join(' and ')} in the
          table header before importing.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Show rows"
          className="inline-flex rounded-md border p-0.5"
        >
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {v.label}
              <span
                className={cn(
                  'text-xs tabular-nums',
                  v.id === 'attention' && attention > 0 && 'text-destructive',
                )}
              >
                {count(v.id)}
              </span>
            </button>
          ))}
        </div>
        {attention > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              meta.setSkipped(
                rows
                  .filter((r) => inView(r.status, 'attention'))
                  .map((r) => r.id),
                true,
              )
            }
          >
            Skip {plural(attention, 'row')} with problems
          </Button>
        ) : null}
      </div>

      <ReviewTable
        headers={file.csv.headers}
        rows={rows}
        view={view}
        meta={meta}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {ready} of {plural(rows.length, 'row')} ready.
          {attention > 0
            ? ` ${plural(attention, 'row')} with problems won't be imported until fixed or skipped.`
            : ''}
        </p>
        <Button
          size="sm"
          disabled={missing.length > 0 || ready === 0}
          onClick={() => setImported(toRecords(rows, file.mapping))}
        >
          Import {plural(ready, 'customer')}
        </Button>
      </div>
    </div>
  )
}
