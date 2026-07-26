# Contributing

## Adding a new table example

Every example in this library follows the same shape. Look at an existing folder (e.g. `src/components/tree/`) for a concrete reference while you work through these steps.

### 1. Component folder

Create `src/components/<name>/` with:

- **`columns.tsx`** — the data type and `ColumnDef<T>[]` for the table. If a column's cell needs to close over component state (an expand toggle, a checkbox, a drag handle), build that column inline inside `data-table.tsx` instead and keep only the static columns here.
- **`data-table.tsx`** — the table component itself: `useReactTable`, row model imports, and the actual `<Table>`/`<TableHeader>`/`<TableBody>` markup using the shadcn/ui primitives from `#/components/ui/table.tsx`.
- **`index.tsx`** — a demo wrapper that supplies sample data and renders the table. This is what gets shown in the docs page's live preview.

Keep sample datasets small (5-25 rows) and realistic — they show up verbatim in the docs site's "Code" tab.

### 2. Docs page

Add `src/components/<name>/<name>-page.tsx`:

- A short intro (`h2` title + one-paragraph description).
- `<InstallCommand name="..." />` (from `#/components/docs/copy-install-command.tsx`) with the same name you'll register in `registry.json` — see step 4.
- `<ComponentPreview preview={<YourDemo />} files={files} />`, where `files` is an array of `{ path, code }` built from `?raw` imports of the actual source files (so the "Code" tab always matches what's really in the repo, not a hand-copied snippet).
- A "How it works" section: an array of steps, each `{ title, description, file, code }`, rendered as numbered, always-expanded (no accordion) entries — description first, then a focused code snippet of exactly the lines it's describing. Explain *why* a non-obvious decision was made, not what the code does line-by-line.

### 3. Route

Add `src/routes/<route>.ts`:

```ts
import { createFileRoute } from '@tanstack/react-router'
import { YourTablePage } from '#/components/<name>/<name>-page'

export const Route = createFileRoute('/<route>')({
  component: YourTablePage,
})
```

TanStack Router's Vite plugin regenerates `src/routeTree.gen.ts` automatically in dev — you don't edit that file by hand.

### 4. Navigation

Add an entry to `navGroups` in `src/components/docs/docs-layout.tsx`, in the group that best matches what the example demonstrates (SSR, Structure / Hierarchy, Interaction-heavy, Dashboard / Analytics-specific, Export / Density Variants — or a new group if it doesn't fit any of those).

### 5. Registry entry

Add an item to [`registry.json`](./registry.json) so the example is installable via the CLI:

```json
{
  "name": "your-table",
  "type": "registry:block",
  "title": "Your Table",
  "description": "One sentence describing what makes this example distinct.",
  "files": [
    { "path": "src/components/<name>/columns.tsx", "type": "registry:component", "target": "@components/tables/your-table/columns.tsx" },
    { "path": "src/components/<name>/data-table.tsx", "type": "registry:component", "target": "@components/tables/your-table/data-table.tsx" },
    { "path": "src/components/<name>/index.tsx", "type": "registry:component", "target": "@components/tables/your-table/index.tsx" }
  ],
  "registryDependencies": ["table"],
  "dependencies": ["@tanstack/react-table"]
}
```

- `registryDependencies` are shadcn/ui primitive names (`table`, `button`, `select`, `input`, `checkbox`, ...) — list whatever your `data-table.tsx`/`columns.tsx` actually import from `#/components/ui/`.
- `dependencies` are real npm packages beyond `@tanstack/react-table` — e.g. the `@dnd-kit/*` packages for drag-and-drop examples.
- `target` always points into `@components/tables/<item-name>/...` so installs land in a predictable, collision-free folder in a consumer's project. Route files are the exception — target them at a literal `src/routes/<file>.ts`.

Then regenerate the built registry files:

```bash
npx shadcn build
```

This writes `public/r/<name>.json`. Commit the regenerated files alongside your `registry.json` change.

### 6. Verify

- `npm run dev`, visit your new route, and confirm it renders with no console errors.
- Actually interact with the feature (click, drag, type — whatever the example demonstrates) rather than only checking that it renders.
- `npm run lint` and `npm run check` before opening a PR.

## Code conventions

- Import shadcn/ui primitives from `#/components/ui/*` and shared utilities from `#/lib/utils.ts` (the `cn()` helper for conditional class names) — these aliases are defined in `components.json`/`tsconfig`.
- Mark files that use hooks or event handlers with `'use client'` at the top, matching the existing examples.
- Prefer TanStack Table's built-in features (row models, `aggregationFn`, `getSubRows`, column resizing, row selection cascade) over hand-rolled equivalents — most of these examples exist specifically to show what the library already does for you.
- No comments explaining *what* code does — the "How it works" section on the docs page is where that explanation belongs. A comment is only warranted for a non-obvious constraint the reader couldn't infer from the code itself.
