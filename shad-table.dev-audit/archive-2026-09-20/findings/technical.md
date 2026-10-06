# Technical SEO Findings — shad-table.dev

## Critical

### 1. Canonical tag and sitemap point at a URL that redirects away
- The domain resolves at both hosts, but `https://shad-table.dev/` returns `HTTP/2 307` → `Location: https://www.shad-table.dev/`.
- Every page's `<link rel="canonical">` and the `sitemap.xml` `<loc>` entries use the **non-www** (`shad-table.dev`) host — i.e., they point at the version of the URL that immediately redirects to a different host.
- `og:image` also points at `https://shad-table.dev/logo512.png`, which itself 307s.
- This is a conflicting-signals setup: Google usually resolves it correctly by following the redirect and indexing the www version regardless of canonical, but it wastes crawl budget, can cause inconsistent indexing/ranking signals between hosts, and unreliable social-card fetching (many OG scrapers — Slack, some older LinkedIn/Facebook fetchers — don't reliably follow 3xx redirects for `og:image`).
- **Fix**: Pick one canonical host. Either (a) 301/308-redirect `www → apex` and keep canonical/sitemap/OG as `shad-table.dev`, or (b) keep the current `apex → www` redirect and switch all canonical tags, sitemap `<loc>` values, and OG/Twitter image+url tags to `https://www.shad-table.dev/...`. Also change the redirect status from `307` (temporary) to `301` (permanent) since this is a permanent host preference, not a temporary one.

### 2. Sitemap is missing 12 of 27 live pages (44% of the site)
- Crawling internal links across the homepage and example pages surfaced 27 distinct table-example pages, all returning `200`.
- `sitemap.xml` (dated `2026-07-27`) lists only 16 of them. Missing: `/animated-icons-table`, `/column-pinning-table`, `/conditional-formatting-table`, `/data-table`, `/filter-state-shape-table`, `/filter-toolbar-table`, `/live-status-table`, `/mobile-cards-table`, `/params-filter-table`, `/production-dashboard-table`, `/server-combined-table`, `/toolbar-filter-table`.
- These match the pages added in the recent "Add six new table examples..." commit plus several older ones that were apparently never added to the sitemap generation step.
- These pages are still crawlable via internal links, but omission from the sitemap means slower discovery/re-crawl priority and no `lastmod`/`priority` signal for them.
- **Fix**: Regenerate `sitemap.xml` from the actual route list (ideally automated at build time so this can't drift again) and keep it in sync with new example pages going forward.

## High

### 3. Missing common security headers
`curl -I` against the homepage shows only `strict-transport-security`. No `X-Content-Type-Options`, `X-Frame-Options` / `frame-ancestors`, `Content-Security-Policy`, or `Referrer-Policy`. Not a direct ranking factor, but Google's security review signals and some AI-crawler trust heuristics do look at baseline hardening, and it's a no-cost fix on Vercel via `next.config`/`vercel.json` headers.

## Info / Not Verifiable From This Environment
- `robots.txt` is permissive (`Disallow:` empty) and correctly references the sitemap — good.
- No `noindex` meta tags found on sampled pages.
- Homepage and sampled example pages are **server-rendered** (title/description/H1 all present in the raw HTML response, not injected client-side only) — good for crawlability, no JS-rendering risk for core content.
- Core Web Vitals (LCP/INP/CLS) could not be measured reliably from this sandboxed environment — `curl` timing showed anomalous ~10s connect times on every request (including tiny assets), which looks like an artifact of this environment's network path rather than the live site's real-world performance. **Recommend running PageSpeed Insights / CrUX directly** (`https://pagespeed.web.dev/analysis?url=https://www.shad-table.dev`) for trustworthy field data.
