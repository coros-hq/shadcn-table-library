# Schema / Structured Data Findings — shad-table.dev

## Current State
Only one JSON-LD block was found, on the homepage:
```json
{"@context":"https://schema.org","@type":"WebSite","name":"ShadTable","url":"https://shad-table.dev","description":"A collection of composable table components built on shadcn/ui and TanStack Table."}
```
- Valid `WebSite` schema, but minimal — no `SearchAction` (site has a "Search docs" feature, which is a natural fit for `potentialAction: SearchAction`).
- No schema at all was found on the sampled example pages (`comparison-table`, `editable-table`, `pivot-table`, `server-table`, `tree-table`).
- Also note the `url` field uses the non-www host, same canonicalization inconsistency flagged in technical findings.

## Recommendations (Medium priority)

1. **Add `SearchAction` to the homepage `WebSite` schema** if `/search?q={query}` (or equivalent) is a real route — enables Google Sitelinks Search Box eligibility.
2. **Add `SoftwareSourceCode` or `TechArticle`/`SoftwareApplication` schema to each example page**, since these are effectively component documentation pages. A minimal `TechArticle` or `SoftwareSourceCode` block with `programmingLanguage: "TypeScript"`, `about`, and `codeRepository` can improve how AI answer engines and code-search-aware crawlers attribute and cite the page.
3. **Add `BreadcrumbList` schema** reflecting Home → Components → {Feature Table}, matching the site's actual nav hierarchy — cheap to add, helps both classic SERP breadcrumbs and AI citation context.
4. Fix the host in the `url` field to match whichever domain is chosen as canonical (see technical.md #1).

No invalid/broken schema was detected — the single existing block validates against schema.org's `WebSite` type.
