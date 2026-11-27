# Tokens

Every design token in ShadTable, taken from [`src/styles.css`](./src/styles.css), which is the source of truth. If this file and the CSS disagree, the CSS wins: update this file. For how the tokens are used, see [DESIGN.md](./DESIGN.md).

Tokens are CSS custom properties on `:root` (light) and `.dark`. They are exposed to Tailwind through `@theme inline`, so `--primary` becomes `bg-primary`, `text-primary` and so on. Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`.

## Color: surfaces and text

| Token | Tailwind | Light | Dark |
| --- | --- | --- | --- |
| `--background` | `bg-background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--card` | `bg-card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--card-foreground` | `text-card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--popover` | `bg-popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--popover-foreground` | `text-popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--primary` | `bg-primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` |
| `--primary-foreground` | `text-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--secondary` | `bg-secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--secondary-foreground` | `text-secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--muted` | `bg-muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--accent` | `bg-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--accent-foreground` | `text-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--destructive` | `bg-destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--destructive-foreground` | `text-destructive-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` |

## Color: lines and focus

| Token | Tailwind | Light | Dark |
| --- | --- | --- | --- |
| `--border` | `border-border` (the default for `*`) | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | `border-input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | `ring-ring` (`outline-ring/50` by default) | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

## Color: charts

The light and dark values are the same, a grey ramp from light to dark.

| Token | Value |
| --- | --- |
| `--chart-1` | `oklch(0.87 0 0)` |
| `--chart-2` | `oklch(0.556 0 0)` |
| `--chart-3` | `oklch(0.439 0 0)` |
| `--chart-4` | `oklch(0.371 0 0)` |
| `--chart-5` | `oklch(0.269 0 0)` |

## Color: sidebar

| Token | Light | Dark |
| --- | --- | --- |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

## Color: code highlighting (Vesper)

These are plain CSS variables and are not mapped into Tailwind. `src/components/docs/code-theme.ts` reads them.

| Token | Light | Dark |
| --- | --- | --- |
| `--code-fg` | `#171717` | `#ffffff` |
| `--code-muted` | `#737373` | `#a0a0a0` |
| `--code-comment` | `#a3a3a3` | `#6b6b6b` |
| `--code-accent` | `#b45309` | `#ffc799` |
| `--code-string` | `#0f766e` | `#99ffe4` |

## Color: status

These are not CSS variables. They come from the Tailwind palette and are used as classes. The full rules are in [DESIGN.md](./DESIGN.md#status-color).

| Meaning | Base | Dot | Text (light / dark) | Soft background |
| --- | --- | --- | --- | --- |
| success | emerald | `500` | `600` / `400` | `500/10` |
| warning | amber | `500` | `600`–`700` / `400` | `500/10` |
| error | red | `500` | `600` / `400` | `500/10` |
| info | sky | `500` | `600` / `400` | `500/10` |
| neutral | muted-foreground | `/40` | `muted-foreground` | `muted` |

## Color: brand (atmosphere only)

These are not CSS variables and are never used in components.

| Name | Value | Where |
| --- | --- | --- |
| Logo tile | `#1E1E1E` | `logo.svg`, banners |
| Banner gradient | `#FFFFFF → #F1EFFA` | `.github/assets/banner.svg` |
| Aurora (dark) | rgb `0.894 0.867 0.941` / `0.831 0.796 0.898` / `0.612 0.557 0.722`, intensity `0.4` | `aurora-background.tsx` |
| Aurora (light) | rgb `0.612 0.557 0.722` / `0.486 0.42 0.651` / `0.357 0.294 0.541`, intensity `0.28` | `aurora-background.tsx` |

## Typography

| Token | Value |
| --- | --- |
| `--font-sans` | `'Outfit', ui-sans-serif, system-ui, sans-serif` |
| `--font-mono` | `'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace` |

The fonts are self-hosted from `public/fonts/` with `font-display: swap`:

- Outfit comes as static files: `Outfit-Regular` (400), `Outfit-Medium` (500), `Outfit-SemiBold` (600) and `Outfit-Bold` (700).
- Geist Mono is one variable file covering 100–900, Latin subset: `GeistMono-Latin.woff2`.

The type scale is Tailwind's default (`text-xs` 12px through `text-5xl` 48px). The body has `antialiased`.

## Radius

| Token | Tailwind | Value | px |
| --- | --- | --- | --- |
| `--radius` | — | `0.625rem` | 10 |
| `--radius-sm` | `rounded-sm` | `calc(var(--radius) - 4px)` | 6 |
| `--radius-md` | `rounded-md` | `calc(var(--radius) - 2px)` | 8 |
| `--radius-lg` | `rounded-lg` | `var(--radius)` | 10 |
| `--radius-xl` | `rounded-xl` | `calc(var(--radius) + 4px)` | 14 |

## Density

These are TypeScript tokens rather than CSS, in `src/components/docs/density.ts`.

| Density | `densityHeadClass` | `densityCellClass` |
| --- | --- | --- |
| `compact` | `h-8 text-xs` | `py-1 text-xs` |
| `comfortable` | `h-10 text-sm` | `py-2 text-sm` |
| `spacious` | `h-14 text-base` | `py-4 text-base` |

## Sizing

| Element | Value |
| --- | --- |
| Button heights | `xs` 24px · `sm` 32px · default 36px · `lg` 40px |
| Icon in button | 16px (`size-4`), 12px at `xs` |
| Header height | 56px (`h-14`) |
| Homepage max width | `max-w-6xl` (72rem) |
| Docs max width | `max-w-[96rem]` |
| Focus ring | 3px, `ring/50` |

## Motion

| Token | Value |
| --- | --- |
| `@keyframes grid-drift` | `translate3d(0,0,0) → translate3d(-22px,-22px,0)` |
| `.animate-grid-drift` | `grid-drift 14s linear infinite`, set to `none` under `prefers-reduced-motion: reduce` |
| UI transition durations in use | 200ms, 300ms (default range); 700ms for the hero entrance; 1000ms for the Draft Rows saved-row highlight fade (color only) |

## Known gaps

- In dark mode, `--sidebar-primary` is the only chromatic UI token (blue, hue 264). It comes from the shadcn default. Decide whether to keep it or make it neutral to match the rest of the theme.
