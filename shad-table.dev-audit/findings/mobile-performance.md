# Mobile Performance — shad-table.dev

Run 2026-09-20. Earlier reports in this audit series noted Core Web Vitals were unmeasurable because this sandbox's outbound network to the live internet is unreliable (~10s connect times on every request). That's now confirmed precisely: Lighthouse against the *live* site failed with `NO_FCP` (page never painted within timeout), but the same Lighthouse run against a **local build of this exact codebase** (served on localhost, bypassing the sandbox's external-network issue) worked and produced real, trustworthy mobile lab data. All numbers below are real Lighthouse output, not estimates.

## Real Mobile Lighthouse Results (`/editable-table`, simulated slow mobile network + CPU throttling)

| Metric | Before | After font fix | Target |
|---|---|---|---|
| Performance score | 65/100 | 67/100 | — |
| First Contentful Paint | 5.6s | 5.3s | <1.8s good |
| Largest Contentful Paint | 5.6s | 5.4s | <2.5s good |
| Total Blocking Time | 0ms | 0ms | <200ms good |
| Cumulative Layout Shift | 0 | 0 | <0.1 good |
| Speed Index | 5.6s | 5.3s | — |
| Time to Interactive | 5.6s | 5.4s | — |
| Total page weight | 910 KiB | 907 KiB | — |

**TBT and CLS are already excellent (0ms / 0)** — there's no JS-execution jank or layout-shift problem on mobile. The entire performance ceiling here is **network payload weight** on a throttled connection: FCP/LCP are both in "poor" territory (>4s) purely because ~900KB has to download and parse before anything paints.

## Fix Applied — Font-loading waterfall
**Root cause**: the Google Fonts stylesheet was loaded via `@import url(...)` at the top of `src/styles.css`. A CSS `@import` is discovered only *after* the browser downloads and starts parsing the main stylesheet, then triggers a second request to `fonts.googleapis.com`, whose response must itself be parsed before the actual `.woff2` file request to `fonts.gstatic.com` even starts — a serial waterfall of 3 round trips before font text can render, worse on high-latency mobile networks.

**Fix**: moved the font load to a `<link rel="stylesheet">` in `src/routes/__root.tsx` (discovered immediately by the browser's preload scanner, in parallel with the main CSS) and added `<link rel="preconnect">` for both `fonts.googleapis.com` and `fonts.gstatic.com` so DNS/TLS setup for those origins starts immediately instead of only after the font CSS request resolves.

**Verified impact**: FCP/LCP/Speed Index/TTI each improved by ~0.2–0.3s in a real before/after Lighthouse run against the same local build. Modest but real, zero risk, zero behavior change.

## Investigated, Not Changed — Shared vendor chunk "unused JS"
Lighthouse flags **243 KiB of estimated JS savings**, almost entirely from two chunks:
- `index-*.js` (330 KB, 144 KB unused on this page) — the app shell: React + TanStack Router core, loaded once per session.
- `table-*.js` (198 KB, 104 KB unused on this page) — `@tanstack/react-table`, bundled as one shared chunk because 56 different component files across the site import from it.

**Why this wasn't "fixed"**: these are legitimate shared vendor chunks that the browser downloads once and caches across all 27 example pages in a session. Splitting them into smaller per-page bundles would improve this *single-page* Lighthouse score but would very likely make the real, multi-page-browsing experience worse — most visitors to a component-demo site click through several examples in one visit, and a shared cached chunk beats re-downloading page-specific slices of the same library repeatedly. This is a genuine architecture tradeoff, not a bug, and not something to change without deliberately deciding to trade "single-page Lighthouse score" for "cross-page real-world byte count" — flagging for a decision rather than guessing.

## Investigated, Not Changed — Tailwind class-attribute weight
The `/editable-table` HTML document is ~107 KB uncompressed, and roughly 57 KB of that (728 elements, ~78 characters of class names each) is Tailwind/shadcn utility class strings. This is inherent to utility-first CSS + `cva`-generated variant classes, and is largely mitigated in practice: this kind of highly repetitive text compresses extremely well under gzip/Brotli (Vercel serves both), so the actual wire-size cost is much smaller than the raw-byte figure suggests — consistent with the site's CSS file itself compressing from 104 KB raw to 17 KB gzip. Reducing it further would mean refactoring shared UI components to consolidate repeated utility combinations via `@apply`, which risks visual regressions across dozens of components for a benefit that's already substantially absorbed by compression. Not recommended as a priority.

## Recommendation
The highest-leverage next step, if you want to keep pushing mobile LCP down, is auditing whether the `@tanstack/react-table` shared chunk can be split by *feature* (sorting/filtering/pagination vs. grouping/pivoting/virtualization) rather than by *page*, so pages that never use grouping/pivoting don't pay for that code even in the shared chunk — but that's a deliberate architecture change, not a drop-in fix, and should be scoped separately if you want to pursue it.
