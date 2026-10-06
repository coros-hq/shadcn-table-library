# Action Plan — shad-table.dev (2026-10-06)

> Code-side items below are marked done in the working tree (2026-10-06) but not deployed yet. Still open: the Cloudflare `robots.txt` change, a LICENSE file, CSP, `llms-full.txt`, and Search Console follow-up.

Score 77/100. The September fixes all landed; what is left is mostly about AI visibility, duplicate v9 pages, and snippet quality.

## Phase 1: Critical / High (this week)
- [ ] **Unblock AI assistants in `robots.txt`.** The file is Cloudflare-managed. In Cloudflare (AI Crawl Control / managed robots.txt) allow at least `ChatGPT-User`, `Claude-User`, `Perplexity-User` and `Google-Agent`; keep the training-bot blocks (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`…) if you don't want training use. Re-check https://www.shad-table.dev/robots.txt afterwards.
- [x] **Stop redirecting `/server-table`, `/server-filter`, `/server-combined-table`.** Apply the default `page`/`pageSize`/… values in the loader instead of a 307 redirect, so the sitemap URLs return 200 directly (and drop their 1–2 s TTFB if possible by prerendering the default state).
- [x] **Differentiate the `/v9/*` pages.** Done: unique title (`… — TanStack Table v9`) and description per page, all in the sitemap and `llms.txt`. Still to do: link each v9 page to `/migrate-v9`. Decide deliberately: either they are their own landing pages (recommended) or they canonical to v8.

## Phase 2: Medium (weeks 2–3)
- [x] Trim all meta descriptions to ≤155 characters (38 of 40 are over 160; longest 272).
- [x] Use real headings: `<h2>How it works</h2>` and `<h3>` per step in the shared page component (propagates to every page).
- [x] Expand the homepage: category sections with links to every example, a short FAQ ("shadcn table vs TanStack Table", "v8 or v9?"), and a link to the migration guide. Target 400+ words and links to all 34 pages.
- [x] Create a 1200×630 Open Graph image, switch to `twitter:card=summary_large_image`, and ideally generate one per page.
- [ ] Add a "when to use this one" intro to the five overlapping filter pages (`filter-toolbar`, `toolbar-filter`, `params-filter`, `filter-state-shape`, `server-filter`).
- [x] Generate sitemap `<lastmod>` from real change dates (28 of 37 say 2026-09-20).
- [x] 404 page: now `noindex` with its own content (the `<title>` is still the homepage's).
- [x] Fix the mobile header: search button overlaps the "ShadTable" wordmark at ~412 px.

## Phase 3: Low / polish (month 2)
- [x] Enrich `SoftwareSourceCode` schema: added `url`, `author`, `isAccessibleForFree`. `license` waits on a LICENSE file (the repo has none).
- [ ] Add a baseline `Content-Security-Policy` and `Permissions-Policy`.
- [ ] Publish `llms-full.txt` (single-file documentation for LLMs).
- [x] Make the homepage "36 copy-paste tables" count come from the registry (it has 34 items).
- [ ] Collapse the `http→https→www` double redirect into one hop.
- [ ] Add a stronger keyword to the `/logs-table` title.

## Phase 4: Measure (ongoing)
- [ ] Connect Google Search Console and check indexation of all 37 sitemap URLs plus the v9 pages once added; confirm Googlebot is not challenged by Cloudflare.
- [ ] Pull field Core Web Vitals (Search Console or PageSpeed Insights) to confirm the lab numbers.
- [ ] Track the brand and "shadcn table", "tanstack table v9 shadcn" queries; re-run this audit after Phase 1–2 ship.
- [x] Add a CI check that fails when a page title or description is duplicated or a description exceeds 160 characters (extends the existing sitemap/nav consistency tests).
