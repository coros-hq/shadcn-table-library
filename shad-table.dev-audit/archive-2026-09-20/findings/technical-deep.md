# Technical SEO Deep Audit — shad-table.dev
Run 2026-09-20 per the `seo-technical` checklist. Builds on the full-site audit's [technical.md](technical.md); this file adds the categories that audit didn't cover in depth (security/SSL detail, URL structure, IndexNow, AI-crawler config, JS-canonical-conflict rule).

## Technical Score: 61/100

| Category | Status | Score |
|---|---|---|
| Crawlability | warn | 65/100 |
| Indexability | fail | 45/100 |
| Security | warn | 60/100 |
| URL Structure | pass | 85/100 |
| Mobile | pass (partial) | 80/100 |
| Core Web Vitals | unknown | n/a |
| Structured Data | fail | 45/100 |
| JS Rendering | pass | 95/100 |
| IndexNow | fail | 0/100 |

---

## 1. Crawlability — warn (65/100)
- `robots.txt` valid, `Disallow:` empty for `User-agent: *`, correctly references `Sitemap: https://shad-table.dev/sitemap.xml`.
- **No AI-crawler-specific rules at all** — no `GPTBot`, `Google-Extended`, `ClaudeBot`, `Bytespider`, or `PerplexityBot` entries. Everything falls through to the open `User-agent: *`. This is a deliberate-or-default choice, not a bug — for a library whose growth depends on developer discovery (including via AI coding assistants), staying fully open to AI crawlers is almost certainly the right call. Flagging only so it's a conscious decision, not an oversight. See `seo-geo` skill if you want to selectively block training crawlers while keeping citation-driving ones (`ChatGPT-User`, `PerplexityBot`) open.
- Sitemap `Disallow` reference itself uses the apex host `shad-table.dev` which 307-redirects — see Indexability below, same root cause.
- 27 live pages, all reachable within 1–2 clicks from the homepage via the component nav — good crawl depth, no orphaned pages found among the 27 discovered.
- Homepage and all sampled pages are server-rendered; no JS-dependent crawling risk (see JS Rendering section).

## 2. Indexability — fail (45/100)
This is the dominant issue for the whole site, carried over from the full audit:
- **Canonical tag on every page points at `https://shad-table.dev/...`, a URL that returns `HTTP/2 307` to `https://www.shad-table.dev/...`.** A canonical must point at the actual indexable (200, non-redirecting) URL. Right now every page's canonical is self-defeating.
- **`sitemap.xml` lists the same redirecting host**, and also **omits 12 of 27 live pages** (44%): `animated-icons-table`, `column-pinning-table`, `conditional-formatting-table`, `data-table`, `filter-state-shape-table`, `filter-toolbar-table`, `live-status-table`, `mobile-cards-table`, `params-filter-table`, `production-dashboard-table`, `server-combined-table`, `toolbar-filter-table`.
- Per Google's December 2025 JS-SEO guidance: canonical/meta-robots/structured-data conflicts between server HTML and JS-injected values can cause Google to pick either version. Good news here — **this site's canonical is already present in the raw server-rendered HTML** (verified directly, not JS-injected), so there's no HTML-vs-JS canonical mismatch, only the host mismatch above.
- No `noindex` tags found on any sampled page (5 example pages + homepage) — no accidental de-indexing.
- No pagination/`rel=next/prev` in use — not applicable at this page count.
- No hreflang — single-language, single-region site, not applicable.
- No meaningful index bloat — 27 pages, all substantive, no thin auto-generated pages.

## 3. Security — warn (60/100)
- **HTTPS enforced correctly**: plain `http://shad-table.dev/` redirects straight to `https://www.shad-table.dev/` in one hop. No mixed content detected in sampled HTML (all asset URLs are protocol-relative `https`/root-relative paths).
- **SSL certificate valid**: `CN=www.shad-table.dev`, expires 2026-10-25, verifies cleanly (Vercel-managed, auto-renews).
- **HSTS present**: `strict-transport-security: max-age=63072000` (2 years) — good, though not confirmed on the HSTS preload list (not required at this traffic tier).
- **Missing headers**: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` are all absent from every response checked. Low ranking impact directly, but it's a one-line config addition on Vercel and closes an easy clickjacking/MIME-sniffing gap.

## 4. URL Structure — pass (85/100)
- Clean, descriptive, hyphenated slugs throughout (`/editable-table`, `/server-filter`, `/heatmap-table`) — no query-string content URLs, no session IDs, no uppercase.
- All URLs well under the 100-character flag threshold.
- **Trailing slash inconsistency**: `/editable-table` returns `200` directly, but `/editable-table/` (with trailing slash) returns a `307` redirect to strip the slash. Not broken, but any external link or old backlink using a trailing slash costs an extra hop. Minor — recommend a permanent redirect (301) if this is framework-default behavior you can't fully eliminate, but ideally normalize at the framework/router level so both forms don't require a round-trip.
- Redirect chain check: apex → www is exactly **1 hop** (no chaining) — good.

## 5. Mobile — pass, partial (80/100)
- `<meta name="viewport" content="width=device-width, initial-scale=1"/>` present and correct.
- Mobile-first indexing is universal now, and since this site serves identical, fully server-rendered HTML regardless of user agent (no separate mobile subdomain, no dynamic serving), there's no mobile/desktop content parity risk.
- **Not verifiable from this environment**: touch target sizing (48×48px minimum), font-size ≥16px base, and absence of horizontal scroll require real browser rendering (Playwright/Lighthouse), which wasn't available in this install. Given the recent commit history includes an explicit "fix mobile-card bugs" change, recommend a manual mobile pass in Chrome DevTools device mode as a follow-up, particularly on the newer example pages.

## 6. Core Web Vitals — unknown
Could not collect trustworthy lab or field data from this environment — repeated `curl` timing showed a flat, suspicious ~10s connect time on every request regardless of payload size (1KB robots.txt to 330KB JS bundle alike), indicating a sandbox network artifact, not real site latency. This is a low-traffic site so CrUX (real-user field data) may also not have enough samples yet.
**Action**: run `https://pagespeed.web.dev/analysis?url=https://www.shad-table.dev` directly, or Lighthouse locally, for real LCP/INP/CLS numbers before treating performance as a finding either way.

## 7. Structured Data — fail (45/100)
- Homepage has one valid `WebSite` JSON-LD block, no `SearchAction`.
- Zero schema on all 27 example pages.
- Full detail and recommendations in [schema.md](schema.md).

## 8. JavaScript Rendering — pass (95/100)
- Site is server-rendered: title, meta description, canonical, H1, and body copy are all present in the raw HTML response (verified via direct `curl`, not a headless browser) — no reliance on client-side JS execution for core content or metadata.
- Single JS bundle (~330KB) and single CSS file (~91KB) handle interactivity/hydration; this doesn't gate indexability of the content itself.
- No non-200 status codes observed on any real content page that would trigger Google's "no JS rendering on non-200 pages" rule.

## 9. IndexNow — fail (0/100)
- No IndexNow key file found (`/indexnow-key.txt` → 404) and no evidence of IndexNow submission integration.
- Low effort to add for a frequently-updated site like this (new example pages ship regularly per commit history) — would give faster indexing on Bing/Yandex/Naver, which is otherwise a slow, passive crawl-and-wait process for a low-traffic site.

---

## Critical Issues (fix immediately)
1. Canonical tags + sitemap `<loc>` + `og:image`/`og:url` all reference `shad-table.dev` (apex), which 307-redirects to `www.shad-table.dev`. Pick one canonical host and align everything to it.
2. `sitemap.xml` omits 12 of 27 live pages (44%).

## High Priority (fix within 1 week)
3. Change apex→www redirect from `307` to `301`/`308` (it's permanent, not temporary).
4. Add missing security headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
5. Add schema (`BreadcrumbList`, `SoftwareSourceCode`/`TechArticle`) to the 27 example pages via shared layout.

## Medium Priority (fix within 1 month)
6. Normalize trailing-slash handling so `/page/` doesn't cost an extra redirect hop.
7. Implement IndexNow for faster Bing/Yandex indexing.
8. Get real Core Web Vitals data via PageSpeed Insights/CrUX and act on whatever it shows.
9. Manually verify mobile touch-target sizing and horizontal-scroll on the newest example pages (Chrome DevTools device mode), given recent "fix mobile-card bugs" commit history.

## Low Priority (backlog)
10. Decide and document an explicit AI-crawler policy in `robots.txt` (currently fully open by default, which is likely correct for this audience, but should be a stated choice).
