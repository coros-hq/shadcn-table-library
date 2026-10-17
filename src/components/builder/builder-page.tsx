import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Check, Link2, Redo2, Undo2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { decodeState, encodeState, featureBlocks, pagerStyles } from './schema'
import type { BuilderState, FeatureId } from './schema'
import { generate, registryCommand } from './generate'
import { PreviewTable } from './preview-table'
import { FiltersEditor } from './filters-editor'
import { SchemaEditor } from './schema-editor'
import { StatesEditor } from './states-editor'
import type { PreviewView } from './states-editor'

const previewViews: { value: PreviewView; label: string }[] = [
  { value: 'data', label: 'Data' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Empty' },
]

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

function Block({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string
  label: string
  hint: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 py-1 font-normal"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <span className="space-y-0">
        <span className="block text-sm leading-tight">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Label>
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

  const files = useMemo(() => generate(state), [state])

  return (
    <DocsLayout hideSidebar>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Table Builder
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Add your own columns, name them, pick a type, set up filters and
            features, then copy the code. An early prototype: it generates the
            table and filters, but not cell editing yet.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          {/* On desktop the card is pinned to the row height set by the preview, so it scrolls inside */}
          <div className="relative lg:min-h-[32rem]">
            <div className="space-y-4 rounded-xl border bg-card p-3 sm:p-4 lg:absolute lg:inset-0 lg:overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Schema</h2>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canUndo}
                    onClick={undo}
                    aria-label="Undo"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Undo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canRedo}
                    onClick={redo}
                    aria-label="Redo"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                    Redo
                  </Button>
                </div>
              </div>
              <SchemaEditor state={state} onChange={setState} />
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-medium">Features</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {featureBlocks.map((f) => (
                    <Block
                      key={f.id}
                      id={`feat-${f.id}`}
                      label={f.label}
                      hint={f.hint}
                      checked={state.features.includes(f.id)}
                      onChange={() =>
                        setState({
                          ...state,
                          features: toggle<FeatureId>(state.features, f.id),
                        })
                      }
                    />
                  ))}
                </div>
              </fieldset>
              <StatesEditor
                state={state}
                onChange={setState}
                onPreview={setView}
              />
              {state.features.includes('filters') ? (
                <FiltersEditor state={state} onChange={setState} />
              ) : null}
              {state.features.includes('pagination') ? (
                <fieldset className="space-y-2">
                  <legend className="mb-2 text-sm font-medium">
                    Pagination
                  </legend>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">Buttons</span>
                    <div className="inline-flex rounded-md border p-0.5">
                      {pagerStyles.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          aria-pressed={state.pager.style === p.value}
                          onClick={() =>
                            setState({
                              ...state,
                              pager: { ...state.pager, style: p.value },
                            })
                          }
                          className="h-7 rounded px-3 text-xs text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Block
                    id="pager-size"
                    label="Rows per page"
                    hint="Select to change the page size"
                    checked={state.pager.sizeSelect}
                    onChange={() =>
                      setState({
                        ...state,
                        pager: {
                          ...state.pager,
                          sizeSelect: !state.pager.sizeSelect,
                        },
                      })
                    }
                  />
                </fieldset>
              ) : null}
              <div className="flex flex-col gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Your table lives in the URL, so you can share it.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
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
          </div>

          <div className="min-w-0 space-y-4">
            <InstallCommand name="" command={registryCommand(encoded)} />

            <ComponentPreview
              flat
              // Row models are cached by TanStack on first use, so a different
              // feature set needs a fresh table rather than an updated one
              preview={
                <div className="space-y-3">
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
                    key={state.features.join()}
                    state={state}
                    view={view}
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
