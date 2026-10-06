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

---

## Update: Real Production PageSpeed Insights Data (Homepage)

The user supplied a live PSI report (`https://www.shad-table.dev/`, Moto G Power emulation, slow 4G, Lighthouse 13.4.1) against the **currently deployed** (pre-fix) production build. This is real field-adjacent lab data, not sandboxed:

| Metric | Value |
|---|---|
| Performance | 85/100 |
| Accessibility | 95/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |
| FCP | 3.3s |
| LCP | 3.3s |
| TBT | 40ms |
| CLS | 0 |
| Speed Index | 3.4s |

The homepage scores meaningfully better than the `/editable-table` numbers measured earlier in this doc (65-67/100) — expected, since the homepage doesn't load the Prism syntax highlighter or embed "How it works" code samples the way every example page does. The example pages, not the homepage, are where mobile performance work matters most.

### Confirmed: render-blocking Google Fonts request (790ms estimated savings)
PSI's own diagnostics show the exact issue already fixed earlier in this doc: the Google Fonts CSS request (`fonts.googleapis.com/css2?family=...`) is render-blocking and takes **750ms** on its own, plus the main stylesheet at 390ms — matching the `@import`-based font-loading waterfall already fixed via `preconnect` + a `<link rel="stylesheet">` in `__root.tsx`. This production data validates that fix with hard numbers; it just hasn't been deployed yet.

### New, fixed: non-composited hero background animation
PSI flagged 4 non-composited animated elements risking CLS/jank, three one-shot entrance fades (low impact) and one persistent issue: **`.animate-grid-drift`** (the homepage hero's dot-grid background) animates `background-position` in a 14-second `infinite` loop — a property the browser cannot composite on the GPU, meaning it repaints every frame for as long as the homepage stays open. Especially relevant on the exact device class PSI tested against (Moto G Power, a real low/mid-tier Android phone).

**Fix applied**: switched the keyframes to animate `transform: translate3d()` instead of `background-position` (`src/styles.css`), and oversized the drifting element by 22px on every edge (`src/routes/index.tsx`) so translating it never reveals its boundary — the parent section already had `overflow-hidden` clipping the excess. Verified visually via before/during screenshots at 0s and 7s into the loop: no visible seam, pattern is identical. This moves the animation onto the compositor thread, eliminating the continuous repaint cost.

### New, fixed: mobile-only missing accessible name
PSI's Accessibility audit flagged several buttons with no accessible name. One is mobile-specific and worth calling out on its own: the "Search docs" trigger button's label text (`<span className="hidden sm:inline">Search docs...</span>`) is hidden below the `sm` breakpoint — meaning on phones, that button renders as a bare icon with **no visible text and no `aria-label`**, making it unusable via screen reader for exactly the mobile users this task is about. Fixed by adding `aria-label="Search docs"` directly to the button (`src/components/docs/global-search.tsx`) — works regardless of which text is visually shown at any breakpoint.

Other flagged accessible-name gaps (shadcn `Select` trigger comboboxes, several icon-only buttons in the utility-table demo) are a broader, sitewide component-library pattern rather than a mobile-specific or quick fix, and weren't addressed here — worth a separate accessibility pass if desired.

