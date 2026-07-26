# ShadTable

A collection of composable table components built on [shadcn/ui](https://ui.shadcn.com) and [TanStack Table](https://tanstack.com/table), each one demonstrating a different real-world table pattern — SSR pagination, tree/grouped data, drag-and-drop, inline editing, dashboard analytics, and more. Every example is documented with a "How it works" breakdown and installable individually via the `shadcn` CLI.

Live docs: https://shadcn-table-library.vercel.app/

## Install a component

Every example is published as a [shadcn registry](https://ui.shadcn.com/docs/registry) item. Copy the install command shown above any example on the docs site, or run it directly:

```bash
npx shadcn add https://shadcn-table-library.vercel.app/r/tree-table.json
```

This drops the component's files into `components/tables/<name>/` in your project (respecting your own `components.json` aliases), installs its npm dependencies, and pulls in any shadcn/ui primitives (`table`, `button`, `select`, ...) it depends on.

Full list of installable names is in [`registry.json`](./registry.json).

## What's included

- **Data Table** — sortable, filterable, paginated, entirely client-side
- **SSR** — Pagination, Filter (resolved server-side via a route loader)
- **Structure / Hierarchy** — Tree Table, Grouped Table, Pivot Table, Master-Detail Table
- **Interaction-heavy** — Tree Table Selection, Tree Table Reorder, Reorderable Table, Editable Table, Resizable/Reorderable Columns
- **Dashboard / Analytics-specific** — Summary/KPI Table, Comparison Table, Heatmap Table
- **Export / Density Variants** — Density & Export (compact/comfortable/spacious, CSV/Excel/PDF export)

## Local development

```bash
npm install
npm run dev
```

The docs site runs at `http://localhost:3000`.

Other scripts:

```bash
npm run build             # production build
npm run test               # run tests (Vitest)
npm run lint                # eslint
npm run format              # prettier --write + eslint --fix
npm run check                # prettier --check
npm run storybook             # Storybook dev server
```

## Regenerating the registry

Registry item JSON files are generated from [`registry.json`](./registry.json) into `public/r/`. Run this after adding or editing a component so the served `/r/*.json` files stay in sync with source:

```bash
npx shadcn build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add a new table example.

## Stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (file-based routing, SSR)
- [TanStack Table](https://tanstack.com/table)
- [shadcn/ui](https://ui.shadcn.com) (`new-york` style) on [Tailwind CSS v4](https://tailwindcss.com)
- [@dnd-kit](https://dndkit.com) for drag-and-drop examples (row/column reordering, resizing)
