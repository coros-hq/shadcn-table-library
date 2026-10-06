# SEO Audit — shad-table.dev

**Date**: 2026-10-06 (previous audit: 2026-09-20, archived in `archive-2026-09-20/`)
**Business type**: Developer tool / open-source component library (docs + live demos, installable via shadcn registry). No e-commerce, no local presence, no blog.
**Pages audited**: 40 HTML pages (37 in the sitemap + 3 `/v9/*` samples) plus `robots.txt`, `sitemap.xml`, `llms.txt`, the 404 page, and the `/r/*.json` registry.
**SEO Health Score: 77 / 100** (was 68)

## Method and limits
Fetched every sitemap URL over HTTPS and parsed titles, descriptions, canonicals, headings, Open Graph, JSON-LD, images and links; inspected response headers, redirects, `robots.txt`, `llms.txt`; measured load performance in headless Chromium (mobile and desktop emulation) and took screenshots.

Not available, so **not assessed**: Google Search Console (indexation, queries, clicks), field Core Web Vitals (the PageSpeed API quota was exhausted; the numbers below are lab measurements on an unthrottled connection), backlink profile, rankings. The audit says nothing about how the site actually performs in search today.

## What improved since 2026-09-20
| Previous finding | Now |
|---|---|
| Canonical/sitemap/OG pointed at apex that redirected | Fixed: all 40 canonicals are self-referencing on `www`; sitemap uses `www` |
| Apex redirect was 307 | Fixed: 308 permanent |
| Sitemap missing 12 of 27 pages | Fixed: all 37 nav pages listed, including the new ones |
| No security headers | Mostly fixed: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, HSTS present (no CSP) |
| No page-level schema | Fixed: `SoftwareSourceCode` + `BreadcrumbList` on every page, `TechArticle` on the migration guide |
| No `llms.txt` | Fixed: present, lists every sitemap page |
| Mobile performance | Strong (see Performance) |

## Executive summary

### Top 5 issues
1. **High — `robots.txt` blocks AI assistants and AI search fetchers.** The Cloudflare-managed block disallows `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Google-Agent`, `GPTBot`, `ClaudeBot`, `anthropic-ai`, `Claude-Web`, `CCBot`, `Google-Extended` and ~40 others. Blocking *training* crawlers is a legitimate choice, but the `*-User` agents fetch a page when a person asks an assistant about it, so ShadTable cannot be read or cited in those answers, which undercuts the `llms.txt` work.
2. **High — three sitemap URLs redirect.** `/server-table`, `/server-filter`, `/server-combined-table` answer `307` to the same URL plus default query parameters, and take 1.2–2.2 s to respond (the rest are 0.2–0.7 s). Sitemaps should list final 200 URLs.
3. **High — `/v9/*` pages compete with their v8 twins.** Two of the three v9 pages sampled (`/v9/tree-table`, `/v9/spreadsheet-table`) have a title and description identical to the v8 page, each self-canonical, and none are in the sitemap. Only `/v9/data-table` is differentiated ("TanStack Table v9 Example"). This is also the best untapped keyword angle: "TanStack Table v9" + shadcn.
4. **Medium — descriptions are too long.** 38 of 40 meta descriptions exceed 160 characters (average 215, longest 272), so Google will truncate most of them.
5. **Medium — thin homepage that does not link to the examples.** 93 words of text and only two internal page links in the HTML (`/data-table`, `/v9`). Every example page is reachable only through the sidebar; the homepage passes no link equity to them.

### Top 5 quick wins
1. Allow the AI search/user agents in Cloudflare's managed `robots.txt` (keep training blocks if you want them).
2. Trim every meta description to ≤155 characters.
3. Make `/server-*` render with default params instead of redirecting.
4. Give each `/v9/*` page a unique title ("… — TanStack Table v9") and add them to the sitemap.
5. Turn "How it works" and the step titles into real `<h2>`/`<h3>` headings (39 of 40 pages have no H2).

## Technical SEO — score 78
**Works**: HTTPS everywhere; apex→www 308; all canonicals correct; no `noindex` anywhere; real 404 status for unknown URLs; compression (Brotli); sitemap and `robots.txt` reference each other.

**Findings**
- **High** — sitemap URLs that redirect (above).
- **High** — v9 duplicates / not in sitemap (above).
- **Medium** — sitemap `<lastmod>` is stale: 28 of 37 URLs say `2026-09-20` although pages have changed since (new tabs, schema, nav). Derive `lastmod` from the real last change, or omit it; Google ignores lastmod that proves unreliable.
- **Low** — no `Content-Security-Policy` or `Permissions-Policy`. The other headers are in place.
- **Low** — `http://shad-table.dev` takes two redirects (http→https apex, then apex→www). Fine, but could be one.
- **Info** — Cloudflare returns 403 to Python's default `urllib` user agent. Confirm in Cloudflare that verified Googlebot and Bingbot are not challenged (Search Console's URL Inspection live test will show it).

## Content quality — score 74
**Works**: every page has a unique H1, a dedicated install command, a live demo, full source and a numbered "How it works"; average ~710 words, minimum 490 on example pages. Content is specific and evidence-based (real code, concrete explanations of *why*).

**Findings**
- **Medium** — homepage is 93 words with no feature list, FAQ, comparison, or links into the catalogue (above).
- **Medium** — near-duplicate topics still overlap: `filter-toolbar-table`, `toolbar-filter-table`, `params-filter-table`, `filter-state-shape-table`, `server-filter`. Their titles differ, but a short "when to use this one" intro (planned in the previous audit) would reduce cannibalization.
- **Low** — homepage claims "36 copy-paste tables" while the registry has 34 items. Make the number derive from one source.
- **Opportunity** — the new migration guide (`/migrate-v9`, 1,189 words, `TechArticle` schema) is the strongest content asset and a natural link target. Link to it from every `/v9/*` page and from the homepage.

## On-page SEO — score 72
- **Medium** — descriptions >160 chars (38/40).
- **Medium** — heading structure: 39 of 40 pages have H1 only. "How it works" and each step title are `<p>` elements, which hides the page outline from search engines and AI summarizers.
- **Low** — `/logs-table` title is short (29 chars) and could carry a keyword ("Logs Table — shadcn/ui Log Explorer").
- **OK** — titles all ≤60 chars, unique per page except the v9 duplicates; viewport and `lang="en"` on every page.

## Schema — score 82
**Works**: valid JSON-LD on all 40 pages: `WebSite` (homepage and shared), `SoftwareSourceCode`, `BreadcrumbList` with absolute `www` URLs, `TechArticle` on the guide.

**Findings**
- **Low** — `SoftwareSourceCode` is minimal (name, description, repository, language). Add `url`, `license` (the repo's licence), `author`/`publisher`, `isAccessibleForFree: true` and `runtimePlatform`.
- **Low** — v9 pages emit the same schema as v8 with no indication of the TanStack Table major version.
- **Low** — no `Organization`/author entity on the homepage for brand recognition.

## Performance — score 95 (lab only)
Chromium, unthrottled connection, 6 key pages × mobile and desktop:

| | TTFB | FCP | LCP | CLS | Long-task time |
|---|---|---|---|---|---|
| Typical page | 60–280 ms | 100–330 ms | = FCP | 0–0.004 | ≤6 ms |
| Worst (`/`, mobile) | 177 ms | 392 ms | 392 ms | 0 | 6 ms |

25–34 requests per page, no horizontal overflow on mobile. Static pages are served from the CDN. The only slow responses are the three `/server-*` pages (1.2–2.2 s, server-rendered). **Verify with field data** (Search Console → Core Web Vitals, or PageSpeed Insights once quota allows) before treating this as final.

## AI search readiness — score 60
**Works**: `llms.txt` is present and complete (38 URLs, matches the sitemap); `SoftwareSourceCode` schema; install commands and code are in plain HTML; headings in step lists are descriptive.

**Findings**
- **High** — `robots.txt` blocks the assistant fetchers (above). `OAI-SearchBot`, `PerplexityBot` and `Claude-SearchBot` are *not* blocked, so search-style indexing still works, but on-demand fetches by users' assistants do not.
- **Medium** — missing semantic headings (above) reduces how well passages can be extracted and cited.
- **Low** — no `llms-full.txt` (single-file full documentation); optional but useful for a docs site this size.

## Images and social — score 90
- 121 `<img>` tags across pages; the sampled page has 0 missing `alt` attributes (2 empty `alt=""`, correct for decorative images). Icons are inline SVG.
- **Medium** — every page uses the same 512×512 logo as `og:image` with `twitter:card=summary`. Links shared on X, Slack, LinkedIn and Discord show a small square logo. Add a 1200×630 default (ideally generated per page with the table preview) and use `summary_large_image`.

## Visual / mobile
Screenshots in `screenshots/`. At 412 px wide the header is crowded: the search button overlaps and clips the "ShadTable" wordmark ("ShadTa…"), and the Discord icon is tiny. The hero itself reads well and the table preview renders correctly. **404 page**: correct 404 status, but the document head repeats the homepage title and description and has no `noindex`.

## Not assessed
Indexation and queries (needs Search Console), backlinks and referring domains, ranking positions, field Core Web Vitals, local/e-commerce signals (not applicable).
