# Design audit

Conformance pass of the docs site against [DESIGN.md](./DESIGN.md), [TOKENS.md](./TOKENS.md) and [BRAND.md](./BRAND.md). Audited 27 Nov 2026.

Rebased onto `origin/main` after #4 (v9 Svelte examples); the new Svelte v9 ports got the same copy, hue and weight fixes.

Scope: site chrome (`src/components/docs`, `src/routes`), the React live demos (`src/components/*`, v8 and their `src/components/v9/*` twins), and, where a fix is copy-level, the Vue and Svelte ports. `src/components/ui` primitives are only touched where TOKENS.md › Known gaps asks for it. Generated fixtures in `src/__gen_check`, stories and tests are out of scope.

Every row below is resolved as **fixed**, **deferred**, **needs decision** or **ok**.

Status: **fixed** · **deferred** (real drift, left for a follow-up, reason given) · **needs decision** (yours to call) · **ok** (checked, conforms, listed so the sweep is traceable).

## Color

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/styles.css` | Every surface, text and border token has chroma 0; dark `--card`/`--popover` (0.205) sit one step above `--background` (0.145) | — | — | ok |
| `src/components/ui/table.tsx` | Rows `hover:bg-muted/50`, `data-[state=selected]:bg-muted`, expanded `bg-muted/50` | — | — | ok |
| `src/styles.css`, TOKENS.md › Color: sidebar | `--sidebar-primary` is blue (`oklch(0.488 0.243 264.376)`) in dark mode | DESIGN.md › Principles 3 "Color has a job" | Recommend `oklch(0.922 0 0)` with `--sidebar-primary-foreground: oklch(0.205 0 0)` (same pair as `--primary` in dark). No nav element currently paints `sidebar-primary` (active marker uses `bg-primary`), so the change is invisible today and only matters to consumers who install the sidebar | needs decision |
| `src/components/builder/column-controls.tsx:76` | Pinned-column edge uses inline `boxShadow: '2px 0 4px -2px rgb(0 0 0 / 0.15)'` | DESIGN.md › Principles 2 (semantic tokens only) | Left: the value is the boundary affordance of the column-pinning demo and has no token equivalent; changing it is a behaviour-visible change in the builder's generated output | deferred |
| `src/components/{mobile-cards,tree/detail}/…`, v9 twins | `#1042`-style matches | — | Order numbers in data, not colors | ok |

## Status color

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/basic/columns.tsx` (+ v9, Vue, Svelte v8 and Svelte v9) | Data Table Status column ("Active", "Inactive", "Pending") is plain text | DESIGN.md › Status color | Soft pills: Active → emerald, Pending → amber, Inactive → neutral (`bg-muted text-muted-foreground`), `rounded-full px-2 py-0.5 text-xs font-medium` | fixed |
| `src/components/{utility,tree-select,tree-reorder,resizable-reorder,ssr/filter-example}/columns.tsx` (+ v9) | Same Active/Inactive/Pending values as plain text | DESIGN.md › Status color | Same soft pills as Data Table | fixed |
| `src/components/tree/columns.tsx` (+ v9) | Order status ("Delivered", "Processing", …) plain text | DESIGN.md › Status color | Soft pills, same mapping as tree/detail | fixed |
| `src/components/grouped/columns.tsx` (+ v9) | Paid / Pending / Refunded as plain text | DESIGN.md › Status color | Paid → emerald, Pending → amber, Refunded → neutral | fixed |
| `src/components/master-detail/columns.tsx` (+ v9) | Delivered / Processing / Cancelled plain text | DESIGN.md › Status color | Delivered → emerald, Processing → sky (in progress), Cancelled → neutral | fixed |
| `src/components/reorder/columns.tsx`, `toolbar-filter/columns.tsx` (+ v9) | Todo / In progress / Done (and Open) plain text | DESIGN.md › Status color | Done → emerald, In progress → sky, Todo/Open → neutral | fixed |
| `src/components/{column-pinning,export-config,mobile-cards}/columns.tsx` (+ v9) | Status rendered with the solid `default` Badge (Active, Paid) | DESIGN.md › Badges "Don't use the solid default variant for status" | Soft pills (emerald / amber / neutral) | fixed |
| `src/components/{crm-employees,crm-employees-multi,inventory-allocation,production-dashboard,conditional-formatting}/columns.tsx` (+ v9, Vue, Svelte) | Pills use `bg-*-100 text-*-800 dark:bg-*-500/15 dark:text-*-300`, or `bg-destructive/15 … dark:text-red-300` | DESIGN.md › Status color (500/10 bg, 700/400 text) | Normalised to the soft-pill recipe. Same for the "Expired" batch badge in `inventory-allocation/batch-detail.tsx` (all four frameworks). CRM "Probation" was violet; now amber (shares the hue with "On leave", told apart by label) | fixed |
| `src/components/tree/detail/columns.tsx` (+ v9) | "Out for delivery" is violet | DESIGN.md › Status color (violet is for non-status categories only; in-progress is sky) | sky | fixed |
| `src/components/job-queue/columns.tsx`, `job-errors.tsx` (+ v9) | "Running" uses blue | DESIGN.md › Status color (info / running = sky; blue is links and selection) | sky | fixed |
| `src/components/split-detail/columns.tsx` (+ v9) | "Open" uses blue; "High" priority dot `bg-orange-400` | DESIGN.md › Status color | Open → sky; High → `bg-amber-500` (Urgent stays red, Normal sky, Low neutral) | fixed |
| `src/components/animated-icons/data-table.tsx` (+ v9) | Active bell `text-blue-500` | DESIGN.md › Status color (600 light / 400 dark) | `text-blue-600 dark:text-blue-400` (blue = selection, which a toggled bell is) | fixed |
| `src/components/schedule-matrix/shift-cell.tsx` | "Changed" corner dot `bg-blue-500` | — | Selection/edit marker; blue is allowed for selection and the dot is 500 | ok |
| `src/components/draft-rows/data-table.tsx` | Draft rows tinted `bg-blue-50/60 dark:bg-blue-500/5` | DESIGN.md › Status color (`/10` soft backgrounds, one hue per meaning) | `bg-sky-500/5`, consistent with "in progress"; the row also carries a "Draft" label, so color isn't the only signal | fixed |
| `src/components/anomaly-investigation/{columns,history-chart}.tsx` (+ v9) | Spike = orange, Drop = violet | DESIGN.md › Status color (orange is not in the palette; violet is not for status) | Proposal: both are "worth a look" deviations, not good/bad; map Spike → amber, Drop → sky, keep the arrow icon + label. Left as is because it changes what the colors mean | needs decision |
| `src/components/{crm-employees,crm-employees-multi}/columns.tsx` | Department dots use blue/pink/orange/teal/violet/emerald | DESIGN.md › Status color "Category or tag accent: violet, used sparingly" | Categorical, labelled, not status. Either document a categorical palette in DESIGN.md or switch to neutral dots | needs decision |
| `src/components/file-browser/file-icon.tsx` | File-type icons tinted violet/blue/pink/… | Same as above | Same as above; icon + filename carry the meaning | needs decision |
| `src/components/heatmap/*` | Cells ramp the opacity of one blue | — | Matches "ramp the opacity of one hue"; heat is one of the jobs color is allowed | ok |
| `src/components/logs/columns.tsx` (+ v9) | Search-match highlight `bg-yellow-300/60` | — | It's a `<mark>` highlight, not status | ok |
| `src/components/docs/hero-table.tsx` | Leaf status is a colored dot with only a `title` | DESIGN.md › Status color "Never let color be the only signal" | Add an `sr-only` label next to the dot so assistive tech gets the status; the visible design is untouched per the brief | fixed |
| DESIGN.md › Status color | No rule for deltas | — | Added: delta color follows good/bad, not up/down (spend up = rose) | fixed |

## Typography

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| 83 example pages (`src/routes/**`, `src/components/**/…-page.tsx`) | "How it works" is `<h2 className="text-sm font-medium">` | DESIGN.md › Typography (h2 = Outfit 500–600, `text-xl`/`text-2xl tracking-tight`) | `text-xl font-medium tracking-tight` | fixed |
| `src/components/migration/migrate-v9-page.tsx` | Four h2s at `text-lg font-medium` | Same | `text-xl font-medium tracking-tight` | fixed |
| `src/components/ssr/pagination-example/filter-page.tsx` (+ v9) | `text-xl font-semibold tracking-tight` | — | Within spec | ok |
| 86 page h1s | `text-3xl font-normal tracking-tight sm:text-4xl`, no `text-balance` | DESIGN.md › Typography "Use `text-balance` on headings" | Added `text-balance` | fixed |
| DESIGN.md › Docs page shell | Says the page title is "an `h2`"; pages use an h1 | Doc drift | DESIGN.md updated to describe the h1 | fixed |
| `src/components/comparison/{data-table,comparison-table-page}.tsx` (+ v9, Vue, Svelte) | Plan price `text-2xl font-bold` | DESIGN.md › Typography (700 is README-banner only) | `font-semibold` | fixed |
| Numeric columns (all `text-right` cells) | `tabular-nums` present on every numeric cell checked | — | — | ok |

## Shape

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/docs/hero-table.tsx` | Card `rounded-xl border bg-card shadow-sm` | DESIGN.md › Shape (table surfaces are flat) | Removed `shadow-sm` | fixed |
| `src/components/docs/component-preview.tsx` | Frame `shadow-sm` unless `flat` | Same | Removed `shadow-sm`; the frame is always flat. The `flat` prop still strips inner control shadows, which is its remaining job | fixed |
| `src/components/permissions-matrix/index.tsx` | Segmented control active item `aria-pressed:shadow-sm` | DESIGN.md › Shape (shadows: `shadow-xs` outline, `shadow-md` floating) | `aria-pressed:shadow-xs` | fixed |
| `src/components/anomaly-investigation/history-chart.tsx` | Tooltip `shadow-md` | — | Floating layer | ok |

## Layout

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/routes/index.tsx` | `max-w-6xl px-6`, `7fr/5fr`, `gap-12 lg:gap-16`, `py-20` | — | — | ok |
| `src/components/docs/docs-layout.tsx` | `max-w-[96rem] px-6 pt-12 pb-20`, sticky `top-20`, `space-y-16`, `gap-8 lg:gap-12`, Sheet below `md` | — | — | ok |
| `src/components/docs/site-header.tsx` | `h-14`, sticky, `backdrop-blur-md bg-background/60`, transparent on home | — | — | ok |
| `src/components/docs/site-header.tsx` | Below `sm` the header is over-full: the mark sits 4.8px from the search button at 390px and touches it at 360px (same before and after this pass; the 8px wider ghost theme toggle is offset by `gap-2` below `sm`) | DESIGN.md › Layout | Hide the Discord link below `sm` (it's in the footer of most docs sites anyway), or drop the star count on mobile. Either removes a control, so I left it | needs decision |

## Header and logo

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/docs/site-header.tsx` | Mark `size-6 rounded-md`, not inverted; wordmark `text-sm font-semibold tracking-tight` with `from-foreground to-foreground/70` | — | — | ok |
| `src/components/docs/theme-toggle.tsx` | Bare `<button className="cursor-pointer">`, no focus ring | DESIGN.md › Buttons (ghost for toolbar icons), › Accessibility (focus ring) | shadcn `Button variant="ghost" size="icon-sm"` | fixed |
| `src/components/docs/site-header.tsx` (Discord), `github-stars.tsx`, `global-search.tsx` trigger, `version-switcher.tsx` links | No `focus-visible` ring | DESIGN.md › Accessibility | Added `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50` | fixed |

## Table anatomy and states

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/ui/table.tsx` | Scroll container, `border-b` rows, last row borderless, footer `border-t bg-muted/50 font-medium`, checkbox alignment | — | — | ok |
| `src/components/error-state/data-table.tsx` | Panel title "Something went wrong" | BRAND.md › Microcopy (Error: what failed + recovery) | "Couldn't load invoices" | fixed |
| `src/components/error-state/error-state.tsx` (+ page snippet) | Retry button "Try again" / "Retrying..." and `animate-spin` ungated | BRAND.md › Microcopy ("Retry"), › Ellipses; DESIGN.md › Motion | "Retry" / "Retrying…", `motion-safe:animate-spin` | fixed |
| `src/components/empty-state/data-table.tsx` | No-results title "No results found" | BRAND.md › Microcopy ("No results. Try a different filter.") | "No results" (description already says what to do next) | fixed |
| Loading / stale-data / first-use vs no-results | Loading State, Error State and Empty State examples already implement skeleton rows, banner over stale rows and the two empty variants | — | — | ok |

## Density

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/docs/hero-table.tsx` | Cells `px-3 py-2.5`, heads `px-3` | DESIGN.md › Density (`px-2` at every density, `py-2` comfortable) | `densityCellClass.comfortable` / `densityHeadClass.comfortable` from `density.ts`, primitive `px-2` | fixed |
| `src/components/utility/data-table.tsx`, `crm-employees*` | Local copies of the density maps, values identical to `density.ts` | — | Kept local on purpose: they ship through the registry as standalone files | ok |

## Buttons

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| Homepage | One `default` (Browse components) + one `outline` (GitHub) | — | — | ok |
| `src/components/ui/button.tsx`, `badge.tsx` | Destructive variants use `text-white` | TOKENS.md › Known gaps | `text-destructive-foreground`, token defined (see Tokens) | fixed |

## Badges

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/docs/nav-content.tsx` `NewBadge` | `rounded-full bg-primary/10 px-1.5 py-px text-[10px] text-primary` | DESIGN.md › Badges | Renders the shadcn `Badge variant="secondary"`, which is `rounded-full px-2 py-0.5 text-xs font-medium` | fixed |
| `src/components/docs/nav-content.tsx` | 24 "New" badges (19 items + 5 groups); flag never expires | BRAND.md › Microcopy (badge must keep its meaning) | `isNew` replaced with `newUntil` (ISO date, page added + 45 days, from git history). Items already past it are dropped; groups show the badge while any item is new. Expiry is checked against the build date (Vite `define`), because pages are prerendered and a runtime clock would make the HTML and the client disagree. Badges drop off on the first deploy after `newUntil`. Today: 13 items + 4 groups (was 19 + 5) | fixed |

## Docs page shell

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| Example pages | h1 + intro → InstallCommand → ComponentPreview → How it works (numbered, always expanded, description + snippet) | — | — | ok |
| `src/components/docs/component-preview.tsx` | Vue/Svelte selected: no note about limits | BRAND.md › Voice "Be honest about limits" | `text-xs text-muted-foreground` line: "Source only. There's no live preview or registry item for Vue." (Svelte likewise) | fixed |

## Code blocks

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/docs/code-theme.ts`, `code-block.tsx` | Vesper `--code-*` tokens, Geist Mono | — | — | ok |

## Motion

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/routes/index.tsx` | Hero entrance `animate-in … duration-700` plays under reduced motion (tw-animate-css has no reduced-motion rule) | DESIGN.md › Motion | `motion-reduce:animate-none` | fixed |
| `src/components/docs/live-status-label.tsx` | `animate-in fade-in` ungated | Same | `motion-reduce:animate-none` | fixed |
| `src/components/docs/aurora-background.tsx` | Static under reduced motion, coarse pointer and < 768px | — | — | ok |
| `src/styles.css` `.animate-grid-drift`, `src/components/docs/reveal.tsx` | Defined, reduced-motion safe, but **not rendered anywhere**; DESIGN.md › Motion and BRAND.md › Visual identity describe a drifting dot grid and reveal-on-scroll on the homepage | Doc drift | Either restore the dot grid behind the hero or drop it (and `Reveal`) from the docs. Adding it back would be a visual addition, so I left it | needs decision |
| `src/components/deployments/columns.tsx`, `async-actions/data-table.tsx` | `animate-pulse` on Building/Syncing dots | DESIGN.md › Motion | Deployments already `motion-safe:`; async-actions gated with `motion-safe:` | fixed |
| `src/lib/animated-icon.ts:80` | `useHover()` hard-coded `const reduced = false`, so Trash, Archive, Star and Bell icons still played once per hover under reduced motion (only the repeat loop was gated) | DESIGN.md › Motion (animated icons gated by `useReducedMotion()`) | `reduced = useReducedMotion() ?? false`; the icons already render their static glyph when `reduced` is true. Verified in Chromium: static under `reduce`, animating under `no-preference` | fixed |
| `src/components/draft-rows/data-table.tsx` | Saved-row highlight fades over `duration-1000` | DESIGN.md › Motion (≤ 300ms) | Left: it's a color-only decay that tells you which row just saved, closer to atmosphere than to a UI transition. Documented in TOKENS.md › Motion | ok |

## Accessibility

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| Icon-only buttons (47 `size="icon*"`) | All carry `aria-label` or `sr-only` text | — | — | ok |
| Hero sort headers, expand buttons | `<button>`s with `aria-label` / focus ring | — | — | ok |
| Focus ring on header controls | See Header and logo | — | — | fixed |
| `src/components/docs/component-preview.tsx` | The Preview panel (Radix `TabsContent`, `tabIndex=0`) took focus with no visible ring | DESIGN.md › Accessibility | `focus-visible:ring-[3px] ring-ring/50 ring-inset` on the panel (inset because the frame clips overflow). Tab-through of /data-table in both themes: 60 stops, all with a visible ring | fixed |

## Copy and voice

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/components/docs/nav-content.tsx` | Groups "Advanced Filters", "Structure / Hierarchy", "Dashboard / Analytics-specific", "Export / Density Variants"; guide "v8 → v9 Migration" | BRAND.md › Voice (sentence case; component names exempt) | "Advanced filters", "Structure / hierarchy", "Dashboard / analytics-specific", "Export / density variants", "v8 → v9 migration". "Table Builder" kept as a proper name | fixed |
| `src/components/docs/global-search.tsx`, Data Table search, other demo inputs, error retry, filter command input (React, v9, Vue, Svelte, and the matching "How it works" snippets) | Three periods ("Search docs...", "Search...", "Retrying...") | BRAND.md voice / microcopy | "…" | fixed |
| `src/components/ui/command.tsx` | Default description "Search for a command to run..." | Same | Left: shadcn primitive, not to be forked; never rendered (the dialog passes its own description) | ok |
| `src/components/builder/generate.ts`, `schema.ts` | Generated code emits `"Search..."`, `"Loading..."` | Same | Left: changes the Table Builder's output and its snapshot fixtures; follow-up | deferred |
| Hype words | Only in code comments (`styles.css`, an icon comment) | — | Not user-facing | ok |
| Brand spelling | No "Shad Table" / "Shadtable" / "shadTable" | — | — | ok |

## Homepage proof points

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/routes/index.tsx` | Lead states the count only | BRAND.md › Proof points | One `text-sm text-muted-foreground` line under the CTAs: TanStack Table v8 and v9 · React live demos, Vue and Svelte source · MIT licensed | fixed |
| `src/routes/index.tsx` | "49" | BRAND.md › Proof points | Already derived from `navGroups` + `topLevelLinks` (`tableCount`), not a literal | ok |

## Meta and domain

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/routes/index.tsx` | Title correct; `og:description` differs from the meta description | BRAND.md › Tagline and short copy | `og:description` = BRAND.md meta description | fixed |
| `src/routes/__root.tsx` | Default description "A collection of composable table components … installable via npx shadcn add." | Same | BRAND.md meta description, word for word | fixed |
| BRAND.md, `__root.tsx`, `docs-layout.tsx` (`SITE_URL`), every route's canonical / `og:url` / JSON-LD, `copy-install-command.tsx` (`REGISTRY_BASE_URL`), README, `public/robots.txt`, `public/sitemap.xml` | BRAND.md says `shad-table.dev`; the site redirects to `www.shad-table.dev` and every URL uses `www` | BRAND.md › Name | Pick one host. If `www` stays canonical, change BRAND.md only. If apex wins, swap every URL listed here (and flip the redirect) | needs decision |

## Tokens

| File | Now | Rule broken | Fix | Status |
| --- | --- | --- | --- | --- |
| `src/styles.css` | `--color-destructive-foreground` maps to an undefined `--destructive-foreground` | TOKENS.md › Known gaps | Defined `--destructive-foreground: oklch(1 0 0)` in `:root` and `.dark`; Button and Badge destructive variants use `text-destructive-foreground`; TOKENS.md updated | fixed |
| `--sidebar-primary` (dark) | Blue | See Color | — | needs decision |

## Not done in this pass

- **Registry dist.** Demo source changed (status pills, copy). The published registry JSON under `public/r` was not rebuilt, per the brief. Run `npm run registry:build` when you're ready to ship the new source to installers.
- **Vue / Svelte parity for status pills.** Data Table is ported; the other ports keep plain-text status until a follow-up. Copy fixes (ellipses) are applied to all three frameworks.
- **Pre-existing failures not caused by this pass.** `tsc` reports 14 errors, all in `src/__gen_check` (builder fixtures). ESLint reports 12, all on lines this pass didn't touch: import-style rules in v9 files and `badge.tsx`, plus 2 in `aurora-background.tsx`. The same counts appear on the unmodified tree.

## Verification

- `npm run typecheck`: 0 errors outside `src/__gen_check`. `npm run lint` on changed files: no new errors. `vitest --project unit`: 794 passed, including a new `component-preview` case for the source-only note. `npm run build`: exit 0, prerender OK.
- Screenshots before/after (in `docs/design-audit/`): homepage, /data-table, /heatmap-table and /error-state-table, light and dark, 1440px and 390px, plus /utility-table at compact, comfortable and spacious.
- Reduced motion (Chromium emulation): the hero entrance's `animation-name` is `none`, the aurora frame is identical across 1.5s, and the hover icons are static. With `no-preference`, all three animate. The dot-grid drift isn't rendered anywhere (see Motion).
- Focus: tabbing through the header, sidebar, preview and table on /data-table gives a visible ring at every stop, in light and dark.
- Vue/Svelte note: shows "Source only. There's no live preview or registry item for Vue." (and for Svelte) when that framework is selected.

## Sweep re-run: what still matches, and why

| Sweep | Remaining matches | Why they stay |
| --- | --- | --- |
| Hard-coded colors | `builder/column-controls.tsx` pinned-edge `rgb()`; `#1042`-style order numbers | Deferred (see Color); data, not colors |
| Lilac / violet | `aurora-background.tsx` (comment); anomaly Drop; CRM department dot; file-browser image icon; schedule-matrix shift tone | Atmosphere; needs decision (anomaly, departments, file icons); shift tone is a non-status category tag, which is the allowed violet use |
| Off-palette hues | CRM department dots, file-type icons, anomaly Spike (orange), logs `<mark>` highlight (yellow) | Needs decision for the first three; the highlight is a search match, not status |
| Heavy weights | none | — |
| `text-right` without `tabular-nums` | Header labels only (`<div className="text-right">Amount</div>`), the docs pager and builder alignment maps | Not numeric content |
| Animations | All `animate-*` on UI are `motion-safe:` / `motion-reduce:` gated or are primitives' enter/exit | — |
| Hype words | Two code comments ("seamless" loop) | Not user-facing |
| Brand misspellings | none | — |
| `size="icon"` | All 47 labelled | — |
| `...` | `builder/*` (generated output), `ui/command.tsx` default prop | Deferred / primitive |
