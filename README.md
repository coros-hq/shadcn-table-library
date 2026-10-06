# ShadTable

A collection of 34 copy-paste table components built on [shadcn/ui](https://ui.shadcn.com) and [TanStack Table](https://tanstack.com/table). Each one demonstrates a real-world table pattern — server-side data, trees, drag-and-drop, inline editing, spreadsheets, infinite scroll, dashboards, and more. Every example has a live demo, the full source, and a "How it works" walkthrough, and is installable on its own with the `shadcn` CLI.

Live docs: https://www.shad-table.dev/

## Install a component

Every example is a [shadcn registry](https://ui.shadcn.com/docs/registry) item. Copy the install command shown above any example on the docs site, or run it directly:

```bash
npx shadcn add https://www.shad-table.dev/r/tree-table.json
```

This drops the component's files into `components/tables/<name>/` in your project (respecting your own `components.json` aliases), installs its npm dependencies, and pulls in any shadcn/ui primitives (`table`, `button`, `select`, ...) it needs.

The full list of installable names is in [`registry.json`](./registry.json), and the published index is at https://www.shad-table.dev/r/registry.json.

## TanStack Table v8 and v9

Every example ships for both major versions of `@tanstack/react-table`:

| Version | Install                                                    | Docs pages            |
| ------- | ---------------------------------------------------------- | --------------------- |
| v8      | `npx shadcn add https://www.shad-table.dev/r/<name>.json`    | `/<page>`             |
| v9      | `npx shadcn add https://www.shad-table.dev/r/<name>-v9.json` | `/v9/<page>`          |

The v8 items pin `@tanstack/react-table@^8.21.3` and the v9 items pin `^9`, so installing one never changes your major version by accident. Use the **v8 / v9** switch in the docs header to compare the same example in both. Moving an existing table over? Read the [v8 → v9 migration guide](https://www.shad-table.dev/migrate-v9).

## Vue

The docs pages have a **React | Vue** toggle on the Code tab with a Vue port of each example, written for `@tanstack/vue-table@^8` and [shadcn-vue](https://www.shadcn-vue.com). The Vue code is source only: there is no live Vue preview and no Vue registry items yet.

## What's included

- **Data Table** — sortable, filterable, paginated, entirely client-side
- **SSR** — Pagination, Filter, and Sort + Filter + Pagination, resolved on the server through a route loader (needs TanStack Start)
- **Advanced Filters** — Toolbar Filter, Filter State Shape, Filter Toolbar, Params Filter (URL state with nuqs), Deployments, Logs
- **Structure / Hierarchy** — Tree Table (org chart, product variants, and a one-child-per-parent table with a details card), Grouped, Pivot, Master-Detail
- **Interaction-heavy** — Tree Selection and Reorder, Reorderable rows, Editable, Resizable / Reorderable columns, Column Pinning, Inventory Allocation, Infinite Scroll, Excel-like spreadsheet
- **Animated** — Animated Icons ([Iconimate](https://iconimate.app)), Live Status Indicators, Async Row Actions
- **Dashboard / Analytics** — Summary / KPI, Comparison, Heatmap, Conditional Formatting, Production Dashboard
- **Export / Density** — Density & Export, Export Configuration, Export Selected Rows
- **Responsive** — Mobile Cards

New and recently changed pages carry a **New** badge in the docs sidebar, and so does the group that contains them.

## Local development

```bash
npm install
npm run dev
```

The docs site runs at `http://localhost:3000`.

Other scripts:

```bash
npm run build           # production build (prerenders the docs pages)
npm run typecheck       # tsc --noEmit
npm run test:unit       # smoke and integrity tests (Vitest + jsdom)
npm run lint            # eslint (advisory in CI)
npm run format          # prettier --write + eslint --fix
npm run check           # prettier --check
npm run storybook       # Storybook dev server
```

## Tests and CI

`npm run test:unit` takes a few seconds and checks that:

- every example demo renders in React v8 and v9 without console errors
- every navigation link has a route, a v9 route where it should, a sitemap entry, and an `llms.txt` entry
- every registry item points at real files, pins the right TanStack Table major, declares every package and shadcn/ui primitive it imports, and only imports files that are installed with it
- the spreadsheet formula engine evaluates correctly, including its error cases

GitHub Actions (`.github/workflows`) runs the type check, unit tests, and build on every push and pull request, and reports lint results without blocking.

## Regenerating the registry

Registry item JSON files are generated from [`registry.json`](./registry.json) into `public/r/`, including the `-v9` twin of every item. Run this after adding or editing a component so the served `/r/*.json` files stay in sync with source, and commit the result:

```bash
npm run registry:build
```

Then check that every item installs and compiles in a clean project, using the real shadcn CLI (needs network access):

```bash
npm run registry:check                               # every item, about 4 minutes
npm run registry:check -- --only tree-table,tree-table-v9
```

CI runs the same check on pull requests that touch the registry or components, and weekly, since npm and shadcn change independently of this repo.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add a new table example.

## Stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (file-based routing, SSR)
- [TanStack Table](https://tanstack.com/table) v8, with v9 variants of every example
- [shadcn/ui](https://ui.shadcn.com) (`new-york` style) on [Tailwind CSS v4](https://tailwindcss.com)
- [@dnd-kit](https://dndkit.com) for drag-and-drop examples (row/column reordering, resizing)
- [Iconimate](https://iconimate.app) ([source](https://github.com/smammar100/Iconimate)) for the animated icon set, installed via its own `shadcn` registry
- [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) for tests
