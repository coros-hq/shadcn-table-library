import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Check, Link2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { decodeState, encodeState, featureBlocks } from './schema'
import type { BuilderState, FeatureId } from './schema'
import { generate, installCommand } from './generate'
import { PreviewTable } from './preview-table'
import { SchemaEditor } from './schema-editor'

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
      className="flex cursor-pointer items-start gap-3 rounded-md border bg-background px-3 py-2 font-normal has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <span className="space-y-0.5">
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Label>
  )
}

export function BuilderPage() {
  const search = useSearch({ from: '/builder' })
  const navigate = useNavigate({ from: '/builder' })
  // The URL seeds the state once. After that the page owns it, so typing in a
  // name field never waits on a navigation round trip.
  const [state, setState] = useState<BuilderState>(() => decodeState(search.t))
  const [copied, setCopied] = useState(false)
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
    <DocsLayout>
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

        <div className="space-y-6 rounded-xl border bg-card p-4 sm:p-6">
          <SchemaEditor state={state} onChange={setState} />
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Features</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Filters you add in the preview become the defaults in the code.
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

        <InstallCommand name="" command={installCommand(state)} />

        <ComponentPreview
          // Row models are cached by TanStack on first use, so a different
          // feature set needs a fresh table rather than an updated one
          preview={
            <PreviewTable
              key={state.features.join()}
              state={state}
              onFiltersChange={(filters) => setState({ ...state, filters })}
            />
          }
          files={files}
        />
      </section>
    </DocsLayout>
  )
}
