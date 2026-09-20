# Sitemap Findings — shad-table.dev

- `sitemap.xml` exists, is well-formed XML, and is correctly referenced from `robots.txt`.
- Lists 16 URLs, all with `lastmod`, `changefreq: monthly`, and sensible `priority` (1.0 homepage, 0.8 example pages).
- **Critical gap**: 12 live, indexable pages are absent (see technical.md #2 for the full list) — a 44% undercount of the site's real page inventory.
- **Host mismatch**: all `<loc>` values use `https://shad-table.dev/...`, which 307-redirects to `https://www.shad-table.dev/...` (see technical.md #1). Sitemap URLs should always be the final, canonical, 200-serving URL — never one that redirects.
- No sitemap index / pagination needed at this scale (27 pages total).

## Recommendation
Regenerate the sitemap from the actual route manifest as part of the build (e.g., a script that walks the app's route table or `app/` directory rather than a manually maintained list), and point every `<loc>` at the final canonical host once that's decided.
