# Design

How the ShadTable docs site and its table components are put together visually. For identity and voice, see [BRAND.md](./BRAND.md). For raw values, see [TOKENS.md](./TOKENS.md).

## Principles

1. **The table is the product.** Docs chrome is neutral and low-contrast so the demo carries the attention.
2. **Fit any shadcn app.** Components use only semantic tokens (`bg-background`, `text-muted-foreground`, `border`) and stock shadcn/ui primitives, so they inherit the consumer's theme when installed.
3. **Color has a job.** Neutral by default. Hue only appears to carry meaning: status, severity, deltas, heat.
4. **Data reads in columns.** Numbers are right-aligned and use `tabular-nums`. IDs, hashes, timestamps and code use `font-mono`.
5. **Both themes and every density work.** Each component is checked in light and dark mode and at compact, comfortable and spacious density.
6. **Motion explains state and can be switched off.** Everything animated respects `prefers-reduced-motion`.

## Foundations

### Stack

shadcn/ui `new-york` style, base color `zinc`, CSS variables on, Tailwind CSS v4 (`@theme inline` in `src/styles.css`), `tw-animate-css` for enter and exit animations, `motion` for icon animation, and `lucide-react` for icons.

### Color

The theme is achromatic: every surface, text and border token has chroma 0 in OKLCH. There are two exceptions:

- `--destructive` is red.
- `--sidebar-primary` in dark mode is blue (`oklch(0.488 0.243 264.376)`), inherited from the shadcn default.

Brand lilac never appears in components. See [BRAND.md](./BRAND.md#visual-identity).

Layering, back to front:

| Layer | Token | Typical use |
| --- | --- | --- |
| Page | `background` | Body |
| Raised | `card`, `popover` | Preview frame, menus, dialogs. In dark mode they sit one step lighter than the page. |
| Subtle fill | `muted` / `accent` / `secondary` | Row hover (`muted/50`), selected row (`muted`), table footer, ghost button hover |
| Lines | `border`, `input` | Row dividers, inputs, outline buttons |
| Focus | `ring` | `ring-[3px] ring-ring/50` on every focusable element |

### Status color

The table examples use the Tailwind palette directly for status. Keep one hue per meaning across the library:

| Meaning | Hue | Dot / fill | Text | Soft pill |
| --- | --- | --- | --- | --- |
| Success, healthy, up, done | emerald | `bg-emerald-500` | `text-emerald-600 dark:text-emerald-400` | `bg-emerald-500/10 text-emerald-700 dark:text-emerald-400` |
| Warning, pending, degraded | amber | `bg-amber-500` | `text-amber-600 dark:text-amber-400` | `bg-amber-500/10 text-amber-700 dark:text-amber-400` |
| Error, failed, down | red (rose for softer negatives such as deltas) | `bg-red-500` | `text-red-600 dark:text-red-400` | `bg-red-500/10 text-red-700 dark:text-red-400` |
| Info, running, in progress | sky (blue for links or selection) | `bg-sky-500` | `text-sky-600 dark:text-sky-400` | `bg-sky-500/10 text-sky-700 dark:text-sky-400` |
| Neutral, debug, unknown | muted | `bg-muted-foreground/40` | `text-muted-foreground` | `bg-muted text-muted-foreground` |
| Category or tag accent | violet | used sparingly for non-status categories | | |

Rules:

- Use 600 for text on light backgrounds and 400 on dark. Use 500 for dots and fills, and `/10` for soft backgrounds.
- Never let color be the only signal. Pair it with a label, an icon or a dot plus text.
- Delta color follows good/bad, not up/down. For spend, an increase is rose and a decrease is emerald; for revenue it's the other way round.
- For heatmaps and conditional formatting, ramp the opacity of one hue rather than mixing hues, unless the scale diverges.
- Charts use `--chart-1…5`, a grey ramp, so a consumer's theme recolors them.

### Typography

| Role | Font | Classes |
| --- | --- | --- |
| Hero heading | Outfit 400 | `text-4xl sm:text-5xl tracking-tight text-balance` |
| Hero lead | Outfit 400 | `text-lg text-muted-foreground text-balance`, `max-w-xl` |
| Page title (`h1`) | Outfit 400 | `text-3xl sm:text-4xl font-normal tracking-tight text-balance` |
| Section heading (`h2`) | Outfit 500–600 | `text-2xl` / `text-xl tracking-tight` ("How it works" is `text-xl font-medium tracking-tight`) |
| Body / UI | Outfit 400–500 | `text-sm` |
| Meta, captions, badges | Outfit 500 | `text-xs` (`text-muted-foreground` for meta) |
| Table body | Outfit 400 | `text-sm`, and density changes it (see below) |
| Table header | Outfit 500 | `font-medium text-foreground whitespace-nowrap` |
| Code, IDs, timestamps | Geist Mono | `font-mono`, usually `text-xs` |

- Headings are light. The hero uses `font-normal`. Weight 700 only appears in the README banner.
- Use `tabular-nums` on every numeric column, counter and timer.
- Use `text-balance` on headings and lead paragraphs.

### Shape

- Base radius is `0.625rem` (10px). The scale is `rounded-sm` 6px, `rounded-md` 8px, `rounded-lg` 10px and `rounded-xl` 14px.
- Buttons, inputs, menus and cells with a fill use `rounded-md`. Cards and preview frames use `rounded-lg` / `rounded-xl`. Badges, status pills and dots use `rounded-full`.
- Shadows are rare. Outline buttons use `shadow-xs`, and floating layers (popovers, menus) use `shadow-md`. Table surfaces are flat and separated by borders.

### Spacing and layout

- Tailwind's 4px scale throughout.
- **Homepage:** `max-w-6xl px-6`, a two-column hero (`7fr / 5fr`, `gap-12 lg:gap-16`) with `py-20`.
- **Docs:** `max-w-[96rem] px-6 pt-12 pb-20`. A sticky sidebar (`top-20`) sits beside `main` with `space-y-16` between sections, and the gap is `gap-8 lg:gap-12`.
- **Header:** `h-14`, sticky, `backdrop-blur-md` over `bg-background/60`. It is transparent on the homepage so the aurora shows through.
- The sidebar is hidden below `md`. A `Sheet` takes over on mobile.

### Density

Tables support three densities (`src/components/docs/density.ts`):

| Density | Header row | Cell |
| --- | --- | --- |
| compact | `h-8 text-xs` | `py-1 text-xs` |
| comfortable (default) | `h-10 text-sm` | `py-2 text-sm` |
| spacious | `h-14 text-base` | `py-4 text-base` |

Horizontal cell padding stays at `px-2` at every density. Only vertical rhythm and type size change.

## Components

### Table anatomy

From `src/components/ui/table.tsx`:

- The container is `relative w-full overflow-x-auto`. Tables scroll horizontally and never squash columns.
- Rows have `border-b`, `hover:bg-muted/50`, and `data-[state=selected]:bg-muted`. Expanded rows get `bg-muted/50` too.
- The last body row has no border, because the frame provides it.
- The footer is `border-t bg-muted/50 font-medium`.
- Checkbox columns drop their right padding and nudge the checkbox `translate-y-[2px]` to align it optically.

Patterns used across the examples:

- **Toolbar** above the table: search input on the left, filters and view options on the right, `gap-2`, `size="sm"` controls.
- **Pagination** below: row count and selection summary on the left in `text-muted-foreground text-sm`, page controls on the right.
- **Loading**: skeleton rows that match the real row height. On refetch, dim the existing rows instead of replacing them.
- **Empty**: a centered message inside a single full-width cell. Separate first use ("no data yet") from no results ("nothing matches").
- **Error**: an inline panel with a retry action. When there is stale data, show a banner above it rather than wiping the rows.

### Buttons

`default` (primary, near-black in light mode and near-white in dark) for the single main action. `outline` for secondary actions. `ghost` for toolbar icons. `destructive` only for irreversible actions. Sizes run `xs` 24px, `sm` 32px, default 36px and `lg` 40px, with matching `icon-*` squares. Icons inside buttons are 16px (`size-4`), or 12px at `xs`.

### Badges

`rounded-full px-2 py-0.5 text-xs font-medium`. Use `outline` / `secondary` for neutral tags and the soft status pills above for state. Don't use the solid `default` variant for status.

The sidebar **New** badge is the `secondary` variant. Nav items set `newUntil` (ship date + 45 days) rather than a boolean, so the badge expires on its own; a group shows it while any of its items do.

### Docs page shell

Each example page follows the same order: an `h1` page title (`text-3xl sm:text-4xl font-normal tracking-tight text-balance`) and a one-paragraph intro, then `<InstallCommand>`, then `<ComponentPreview>` with Preview and Code tabs (the bar has a React | Vue | Svelte toggle; picking Vue or Svelte shows a `text-xs text-muted-foreground` note that the port is source only, with no live preview or registry item), then "How it works" as numbered, always-expanded steps, each with a description followed by a focused snippet. See [CONTRIBUTING.md](./CONTRIBUTING.md).

### Code blocks

Highlighting uses the Vesper palette (`--code-*` tokens). It is darkened in light mode for contrast, with amber for keywords and accents and teal for strings. Code is set in Geist Mono.

## Motion

| Effect | Where | Spec |
| --- | --- | --- |
| Aurora | Homepage background | WebGL shader with lilac bands at time × 0.15. Off on reduced motion, coarse pointers and widths under 768px. |
| Dot-grid drift | Hero backdrop | 22px tile, `transform` only, 14s linear infinite. Off on reduced motion. |
| Enter | Hero table, reveals | `animate-in fade-in slide-in-from-bottom-2`, 700ms on the hero and 200–300ms elsewhere |
| Hover and state | Rows, buttons | `transition-colors` / `transition-all`, default duration |
| Animated icons | Animated Icons, Async Actions | `motion`, gated by `useReducedMotion()` |

Animate `transform` and `opacity` only, never layout properties. Keep UI transitions at 300ms or less. Anything longer is atmosphere.

## Accessibility

- Every interactive element has the shared visible focus ring (`focus-visible:ring-[3px] ring-ring/50`).
- Icon-only buttons need an `aria-label`.
- Use status color together with text. Keep muted text on `background` and `muted` at WCAG AA or better.
- Sortable headers are buttons, and expandable rows expose `aria-expanded`.
- Respect `prefers-reduced-motion` everywhere (see Motion).
