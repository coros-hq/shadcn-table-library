import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Check, Database, Link2, Redo2, Undo2, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { decodeState, encodeState, replaceColumns } from './schema'
import type { BuilderState } from './schema'
import { generate, registryCommand } from './generate'
import { PreviewTable } from './preview-table'
import { FeaturesPanel } from './features-panel'
import { SchemaEditor } from './schema-editor'
import { StatesEditor } from './states-editor'
import type { PreviewView } from './states-editor'
import { templates } from './templates'
import { ImportDialog } from './import-dialog'
import { coerceRows, matchesData, withDataOptions } from './import'
import type { ImportedData } from './import'

const previewViews: { value: PreviewView; label: string }[] = [
  { value: 'data', label: 'Data' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Empty' },
]

type PanelTab = 'columns' | 'features' | 'states'

function Count({ children }: { children: number }) {
  return (
    <span className="rounded-full bg-muted-foreground/15 px-1.5 text-xs tabular-nums text-muted-foreground">
      {children}
    </span>
  )
}

// Undo/redo over whole-state snapshots. Changes landing within COALESCE_MS of
// each other (typing in a name) collapse into one step.
const COALESCE_MS = 600
const HISTORY_LIMIT = 100

function useHistory(initial: () => BuilderState) {
  const [history, setHistory] = useState(() => ({
    past: [] as BuilderState[],
    present: initial(),
    future: [] as BuilderState[],
  }))
  const lastChange = useRef(0)

  const set = useCallback((next: BuilderState) => {
    const now = Date.now()
    const coalesce = now - lastChange.current < COALESCE_MS
    lastChange.current = now
    setHistory((h) => {
      if (next === h.present) return h
      return {
        past:
          coalesce && h.past.length > 0
            ? h.past
            : [...h.past, h.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    lastChange.current = 0
    setHistory((h) =>
      h.past.length === 0
        ? h
        : {
            past: h.past.slice(0, -1),
            present: h.past[h.past.length - 1],
            future: [h.present, ...h.future],
          },
    )
  }, [])

  const redo = useCallback(() => {
    lastChange.current = 0
    setHistory((h) =>
      h.future.length === 0
        ? h
        : {
            past: [...h.past, h.present],
            present: h.future[0],
            future: h.future.slice(1),
          },
    )
  }, [])

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}

export function BuilderPage() {
  const search = useSearch({ from: '/builder' })
  const navigate = useNavigate({ from: '/builder' })
  // The URL seeds the state once. After that the page owns it, so typing in a
  // name field never waits on a navigation round trip.
  const {
    state,
    set: setState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(() => decodeState(search.t))
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<PreviewView>('data')
  const [tab, setTab] = useState<PanelTab>('columns')

  // ⌘Z / ⇧⌘Z (Ctrl on other systems), except while typing, where the field's
  // own undo is what people expect
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable]')) return
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])
  // Imported rows live here and nowhere else: not in BuilderState, so never
  // in the URL, the history or the registry command
  const [imported, setImported] = useState<ImportedData | null>(null)
  const importedRows = useMemo(
    () =>
      imported && matchesData(state.columns, imported)
        ? coerceRows(state.columns, imported)
        : undefined,
    [imported, state.columns],
  )
  // A column switched to select takes its options from the data
  const editSchema = (next: BuilderState) =>
    setState(imported ? withDataOptions(state, next, imported) : next)
  const encoded = useMemo(() => encodeState(state), [state])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(
      () =>
        navigate({ search: { t: encoded }, replace: true, resetScroll: false }),
      300,
    )
    return () => clearTimeout(timer)
  }, [encoded, navigate])

  async function copyLink() {
    const url = new URL(window.location.href)
    url.search = `?t=${encoded}`
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const files = useMemo(
    () => generate(state, { rows: importedRows }),
    [state, importedRows],
  )

  return (
    <DocsLayout hideSidebar>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Table Builder
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Set up your columns, switch on the features you need, and copy the
            code. Start from scratch, from one of the examples, or from your own
            data.
          </p>
        </div>

        {/* Everything that acts on the whole table, in one place */}
        <div className="flex flex-wrap items-center gap-2">
          <ImportDialog
            onImport={(columns, data) => {
              setState(replaceColumns(state, columns))
              setImported(data)
              setView('data')
              setTab('columns')
            }}
          />
          <Select
            value=""
            onValueChange={(id) => {
              const template = templates.find((t) => t.id === id)
              if (!template) return
              // Goes through history, so Undo brings the old table back
              setState(template.state)
              // A template has its own columns, which the data won't fit
              setImported(null)
            }}
          >
            <SelectTrigger
              size="sm"
              className="w-full shadow-none sm:w-64"
              aria-label="Start from an example"
            >
              <SelectValue placeholder="Start from an example…" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex flex-col items-start">
                    <span>{t.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.description}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={!canUndo}
              onClick={undo}
              aria-label="Undo"
              title="Undo (⌘Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={!canRedo}
              onClick={redo}
              aria-label="Redo"
              title="Redo (⇧⌘Z)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-1 shadow-none"
              onClick={copyLink}
              title={
                imported
                  ? 'The link saves your columns and settings, not your imported rows'
                  : 'The link saves your columns and settings'
              }
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          {/* On desktop the card is pinned to the row height set by the preview, so it scrolls inside */}
          <div className="relative lg:min-h-[36rem]">
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as PanelTab)}
              className="gap-0 overflow-hidden rounded-xl border bg-card lg:absolute lg:inset-0"
            >
              <div className="border-b p-2">
                <TabsList className="w-full">
                  <TabsTrigger value="columns">
                    Columns
                    <Count>{state.columns.length}</Count>
                  </TabsTrigger>
                  <TabsTrigger value="features">
                    Features
                    <Count>{state.features.length}</Count>
                  </TabsTrigger>
                  <TabsTrigger value="states">States</TabsTrigger>
                </TabsList>
              </div>
              <div className="p-3 sm:p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                <TabsContent value="columns">
                  <SchemaEditor state={state} onChange={editSchema} />
                </TabsContent>
                <TabsContent value="features">
                  <FeaturesPanel
                    state={state}
                    onChange={setState}
                    onOpenColumns={() => setTab('columns')}
                  />
                </TabsContent>
                <TabsContent value="states" className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    What the table shows with no rows, and while rows load.
                    Editing a message switches the preview to it.
                  </p>
                  <StatesEditor
                    state={state}
                    onChange={setState}
                    onPreview={setView}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="min-w-0 space-y-4">
            <InstallCommand name="" command={registryCommand(encoded)} />

            <ComponentPreview
              flat
              // Row models are cached by TanStack on first use, so a different
              // feature set needs a fresh table rather than an updated one
              preview={
                <div className="space-y-3">
                  {importedRows && imported ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                      <Database className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        Previewing{' '}
                        <span className="font-medium">
                          {importedRows.length.toLocaleString('en-US')} rows
                        </span>{' '}
                        from {imported.source}. They stay in this tab and are
                        left out of the link and the install command.
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => setImported(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Use sample data
                      </Button>
                    </div>
                  ) : null}
                  <div className="inline-flex rounded-md border p-0.5">
                    {previewViews.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        aria-pressed={view === v.value}
                        onClick={() => setView(v.value)}
                        className="h-7 rounded px-3 text-xs text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <PreviewTable
                    // Pins only seed the table's initial state, so a new
                    // pin layout needs a fresh table too
                    key={`${state.features.join()}|${state.columns
                      .map((c) => c.pin ?? '')
                      .join()}`}
                    state={state}
                    view={view}
                    rows={importedRows}
                  />
                </div>
              }
              files={files}
            />
          </div>
        </div>
      </section>
    </DocsLayout>
  )
}
