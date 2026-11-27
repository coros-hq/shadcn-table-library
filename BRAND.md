# Brand

How ShadTable presents itself: name, promise, voice and visual identity. For how the UI is built, see [DESIGN.md](./DESIGN.md). For exact values, see [TOKENS.md](./TOKENS.md).

## Name

- **ShadTable**, one word, capital S and T. Not "Shad Table", "Shadtable" or "shadTable".
- The domain is `shad-table.dev`, and the npm/registry paths use `shad-table`. Only use the hyphen in URLs and code.
- In page titles, follow the name with an em dash: `ShadTable — Shadcn Data Table & Table Components`.

## What it is

A collection of copy-paste table components built on shadcn/ui and TanStack Table. Each example shows one real-world table pattern and comes with a live demo, its full source, and a "How it works" walkthrough. Each one installs on its own with the `shadcn` CLI.

### Positioning

> Table components for the parts of your app that a design system doesn't cover.

shadcn/ui gives you a `<Table>` primitive. ShadTable covers what you build on top of it: server-side pagination, trees, pivots, inline editing, spreadsheets, dashboards, and loading, empty and error states.

### Tagline and short copy

| Use | Copy |
| --- | --- |
| Tagline | Table components for shadcn/ui |
| One-liner | Copy-paste tables built on TanStack Table. Own the code. |
| Meta description | Copy-paste table components for shadcn/ui and TanStack Table: data tables, server-side pagination, trees, pivots and editable grids. Own the code. |

### Proof points

Say these only while they are still true, and update counts when components are added:

- The number of components. The homepage computes it from the nav, so don't hard-code it in the UI.
- TanStack Table v8 and v9 variants of every example
- React with live demos, plus Vue and Svelte ports as source only
- MIT licensed: copy it, change it, ship it

## Voice

ShadTable talks like a senior engineer explaining their own code to a colleague: direct, specific, and unhurried.

- **Concrete over clever.** "Server-side pagination resolved in a route loader" beats "blazing-fast data at scale".
- **Explain why, not what.** "How it works" steps explain the non-obvious decisions. They don't narrate the code line by line.
- **Own the code** is the core idea. Readers copy the source and it becomes theirs, so never describe a component as a black box or a dependency.
- **No hype words**: avoid "powerful", "seamless", "blazing", "next-gen", "supercharge" and "effortless".
- **Sentence case** for headings, buttons and nav labels ("Browse components", not "Browse Components"). Component names in the nav are the exception, since they are proper names (Tree Table, Master-Detail).
- **Be honest about limits.** The Vue and Svelte ports have no live preview and no registry items, and the docs say so.

### Microcopy patterns

| Situation | Pattern |
| --- | --- |
| Primary CTA | Verb + object: "Browse components", "Copy install command" |
| Empty state | What happened + what to do next: "No results. Try a different filter." |
| Error | What failed + recovery: "Couldn't load rows. Retry" |
| Badge for new content | **New** on the sidebar item and on the group that contains it |

## Logo

The mark is a rounded table: a soft-cornered rectangle split by one vertical and two horizontal rules, drawn as a 1.5px white stroke on a `#1E1E1E` tile with 10px corner radius. The full logo adds two diagonal hairlines at the bottom-right corner.

| Asset | Path | Use |
| --- | --- | --- |
| Logo (full) | `.github/assets/logo.svg` | README, social |
| Favicon / header mark | `public/logo.svg` | Site header, shown at 24px (`size-6 rounded-md`) |
| Banner | `.github/assets/banner.svg` | README hero, Open Graph |
| Install banner | `.github/assets/banner-install.svg` | README install section |

Rules:

- Keep the dark tile in both themes. Don't invert the mark on dark backgrounds, because the tile gives it its own contrast.
- In the header, the wordmark sits to the right of the mark in Outfit SemiBold, `text-sm`, with tight tracking and a subtle `foreground → foreground/70` gradient.
- Don't recolor, stretch, outline or add effects to the mark.

## Visual identity

- **Neutral at its core.** The UI is shadcn's zinc/neutral palette (`new-york` style). The product is meant to drop into someone else's design system, so the chrome stays out of the way and the tables carry the attention.
- **Lilac is the one brand color.** It shows up only in atmosphere: the homepage aurora shader and the banner gradient (`#FFFFFF → #F1EFFA`). Don't use it in buttons, links or component UI.
- **Type:** Outfit for interface and display, Geist Mono for code, IDs, timestamps and numbers that need to line up.
- **Status color is semantic, never decorative.** Emerald, amber, red and sky mean success, warning, error and info inside the tables. See [DESIGN.md](./DESIGN.md#status-color).
- **Motion is quiet**: a slow aurora, a drifting dot grid, and reveal-on-scroll. All of it turns off under `prefers-reduced-motion`.
