# SEO Audit — shad-table.dev

**Date**: 2026-09-20
**Business type detected**: Developer tool / open-source component library (shadcn/ui + TanStack Table add-on components), marketing/docs site, no e-commerce, no local presence, no blog.
**Pages found**: 27 live pages (16 in sitemap + 12 undeclared example pages; homepage counted once)
**SEO Health Score: 68 / 100**

## Methodology note
The `seo-audit` skill's bundled `render_page.py` script and Playwright screenshot tooling were not present in this installation, and no Google/DataForSEO/Moz credentials are configured. This audit was run manually via `curl` + HTML parsing against the live site instead of the full scripted pipeline. Screenshots, real-browser rendering checks, and field Core Web Vitals were **not** collected — see Performance section. Everything else (HTML structure, meta tags, sitemap, robots.txt, headers, internal link graph) was verified directly against the live site.

## Executive Summary

### Top 5 Issues
1. **Critical** — Canonical tags, sitemap `<loc>` values, and the `og:image` URL all point at `https://shad-table.dev/...`, which 307-redirects to `https://www.shad-table.dev/...`. Conflicting canonicalization signal across the whole site. ([technical.md](findings/technical.md#1-canonical-tag-and-sitemap-point-at-a-url-that-redirects-away))
2. **Critical** — `sitemap.xml` is missing 12 of 27 live pages (44%), including all six pages from the most recent "six new table examples" commit. ([technical.md](findings/technical.md#2-sitemap-is-missing-12-of-27-live-pages-44-of-the-site), [sitemap.md](findings/sitemap.md))
3. **High** — Apex → www redirect uses `307` (temporary) instead of `301`/`308` (permanent) for what is clearly a permanent host preference.
4. **High** — No security headers beyond HSTS (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`, `Referrer-Policy` all absent).
5. **Medium** — Only one JSON-LD block on the entire site (homepage `WebSite`); no schema on any of the 27 example pages, no `BreadcrumbList`, no `SearchAction`. ([schema.md](findings/schema.md))

### Top 5 Quick Wins
1. Regenerate `sitemap.xml` from the real route list — includes the 12 missing pages, near-zero effort if scripted into the build.
2. Point sitemap/canonical/OG tags at whichever host is actually served (pick `www` since that's the redirect target) and switch the redirect to `301`.
3. Add `llms.txt` — one static file, immediate GEO benefit for a dev-tool audience.
4. Add security headers via `vercel.json` / Next config — one config change, no code risk.
5. Add a `BreadcrumbList` + `SoftwareSourceCode`/`TechArticle` JSON-LD template applied across all 27 example pages via the shared layout — one component change, propagates everywhere.

## Technical SEO — see [findings/technical.md](findings/technical.md)
Score: 55/100 — the canonicalization conflict and sitemap gap are the two most consequential findings in this audit.

## Content Quality — see [findings/content.md](findings/content.md)
Score: 72/100 — solid unique titles/descriptions/H1s; thin unique prose per example page and several near-duplicate page names/topics that risk cannibalization.

## On-Page SEO
Titles, meta descriptions, canonicals (modulo the host issue above), and H1s are unique and well-formed across every page sampled. No missing `alt` text found. No `noindex` tags found anywhere.

## Schema & Structured Data — see [findings/schema.md](findings/schema.md)
Score: 45/100 — minimal `WebSite` schema only; no per-page schema despite 27 pages that are natural fits for `SoftwareSourceCode`/`TechArticle` + `BreadcrumbList`.

## Performance
**Not reliably measurable from this environment** — every asset request (HTML, CSS, JS) showed a suspicious flat ~10s `time_connect` regardless of file size, which points to a network/proxy artifact in the sandbox rather than genuine site latency. Do not treat this as a finding. **Recommend**: run https://pagespeed.web.dev/analysis?url=https://www.shad-table.dev directly for trustworthy LCP/INP/CLS field data before prioritizing any performance work.

Static observations that don't depend on timing: the homepage ships one CSS file (~91 KB) and one JS bundle (~330 KB) — reasonable for a component-demo-heavy site, not bloated.

## Images
All sampled `<img>` tags include `alt` attributes. Logo is preloaded correctly (`rel="preload" as="image"`). No oversized/unoptimized images identified from static inspection; recommend running Lighthouse for byte-level image audit since visual/network tooling wasn't available here.

## AI Search Readiness (GEO) — see [findings/geo.md](findings/geo.md)
Score: 60/100 — crawler access is wide open (good), but no `llms.txt` and thin differentiating prose per page limit citation quality.

## Sitemap — see [findings/sitemap.md](findings/sitemap.md)
