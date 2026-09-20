# Action Plan — shad-table.dev

## Phase 1: Critical Fixes (This Week)
- [ ] **Fix canonicalization conflict**: choose `www` or apex as the single canonical host (recommend `www.shad-table.dev` since that's already the redirect target/final URL). Update every page's `<link rel="canonical">`, `og:url`, `og:image`, and the `WebSite` JSON-LD `url` field to match.
- [ ] **Change the host redirect from `307` to `301`** (permanent redirect) at the Vercel/framework config level.
- [ ] **Regenerate `sitemap.xml`** to include all 27 live pages (12 currently missing: `animated-icons-table`, `column-pinning-table`, `conditional-formatting-table`, `data-table`, `filter-state-shape-table`, `filter-toolbar-table`, `live-status-table`, `mobile-cards-table`, `params-filter-table`, `production-dashboard-table`, `server-combined-table`, `toolbar-filter-table`), using the corrected canonical host from the item above.

## Phase 2: High-Impact Improvements (Weeks 2–3)
- [ ] Automate sitemap generation from the route manifest so new example pages can't silently drop out of it again.
- [ ] Add missing security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` or `frame-ancestors 'none'`, a baseline `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`) via Vercel/Next headers config.
- [ ] Add `BreadcrumbList` JSON-LD to the shared example-page layout (propagates to all 27 pages in one change).
- [ ] Add `SoftwareSourceCode` or `TechArticle` JSON-LD per example page (component name, description, `programmingLanguage: TypeScript`, link to source).
- [ ] Run PageSpeed Insights against the homepage and 2–3 representative example pages to get real LCP/INP/CLS field data (blocked from this environment — see report methodology note).

## Phase 3: Content & Authority (Month 2)
- [ ] Add a 2–4 sentence unique "what this is / when to use it" intro to each of the 27 example pages, specifically for the near-duplicate cluster (`filter-toolbar-table`, `toolbar-filter-table`, `params-filter-table`, `filter-state-shape-table`, `server-filter`) to reduce cannibalization risk and improve AI-citation quality.
- [ ] Add `llms.txt` summarizing ShadTable, install command, and links to all component pages.
- [ ] Add `SearchAction` to the homepage `WebSite` schema if the "Search docs" feature has a queryable URL pattern.

## Phase 4: Monitoring & Iteration (Ongoing)
- [ ] Re-crawl `sitemap.xml` vs. actual routes on every deploy (CI check) to prevent future drift.
- [ ] Track indexation of the 12 previously-missing pages in Google Search Console once resubmitted.
- [ ] Re-run a real Lighthouse/PageSpeed pass post-launch of any new example pages.
