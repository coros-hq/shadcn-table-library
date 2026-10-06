# Schema Markup Audit — shad-table.dev

Run 2026-09-20. Source-of-truth here is the **codebase** (`src/routes/*.ts(x)`), not the live site — the live site is currently running a stale deployment that predates most of this schema (confirmed in the prior technical audit by building and serving the current code locally). Everything below reflects what will ship once the site is redeployed, with one real gap that exists in the code itself.

## Detection Summary
- Format used: **JSON-LD** exclusively (correct, matches Google's stated preference). No Microdata or RDFa anywhere.
- 26 of 28 route files carry a `SoftwareSourceCode` block plus a self-referencing canonical.
- The root layout (`src/routes/__root.tsx`) carries one site-wide `WebSite` block, present on every page.
- **2 route files have no schema and no canonical at all**: `params-filter-table.tsx` and `index.tsx` (index.tsx is fine — it's the homepage and correctly relies on root's `WebSite` block + its own canonical; `params-filter-table.tsx` is the real gap — see Critical below).
- No deprecated schema types in use (no HowTo, FAQPage, SpecialAnnouncement, ClaimReview, etc.) — clean.

## Validation Results

| Schema | Type | Status | Issues |
|---|---|---|---|
| `WebSite` (root, all pages) | Active | ✅ | Valid. No `SearchAction` (missed opportunity — see below). |
| `SoftwareSourceCode` (26 example pages) | Active/Specialized | ✅ | Valid `@context`, `@type`, absolute URLs (`codeRepository` correctly points to `https://github.com/coros-hq/shadcn-table-library`), no placeholder text. Missing optional-but-valuable `codeSampleType`/`text` fields (see Medium below). |
| `params-filter-table` | — | ❌ Missing | No `script:ld+json` block, no canonical link, no `og:title`/`og:description` either — this page never received the head-metadata treatment its 26 siblings have. |
| `BreadcrumbList` | Active | ❌ Missing | Not implemented anywhere on the site. |

## Critical

### 1. `params-filter-table.tsx` has no schema, no canonical, and no OG tags
Every other example page follows an identical `head()` pattern (title, description, `og:title`, `og:description`, `SoftwareSourceCode` JSON-LD, canonical link). `src/routes/params-filter-table.tsx:107-118` only sets `title` and `description` — it's missing the rest, most likely because it was added in a later batch and the head boilerplate wasn't copied over. This is the one page on the entire site invisible to schema validators and with a non-self-referencing (missing) canonical.

**Fix** — bring `head()` in line with its siblings:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Params Filter Table",
  "description": "A data table whose filter state is synced to URL search params, decoupled from the filtering UI via a controlled-props interface.",
  "codeRepository": "https://github.com/coros-hq/shadcn-table-library",
  "programmingLanguage": "TypeScript"
}
```
Plus `og:title: "Params Filter Table — ShadTable"`, `og:description` (reuse the meta description), and `<link rel="canonical" href="https://www.shad-table.dev/params-filter-table">`.

## Medium

### 2. No `SearchAction` on the homepage `WebSite` schema
The site has a working "Search docs" feature (confirmed present as an `<h2>Search docs</h2>` block on every page). If it resolves to a queryable URL pattern (e.g. `/?q={query}` or similar), add:
```json
"potentialAction": {
  "@type": "SearchAction",
  "target": "https://www.shad-table.dev/search?q={search_term_string}",
  "query-input": "required name=search_term_string"
}
```
Replace the `target` URL with whatever the actual search route is — don't ship the placeholder as-is.

### 3. No `BreadcrumbList` anywhere
All 27 example pages sit at a flat `Home → {Component}` depth, so this is low-complexity to add once, in the shared page layout (`DocsLayout` or equivalent), rather than per-route. See `generated-schema.json` for a template.

### 4. `SoftwareSourceCode` blocks could carry `codeSampleType`/`text`
Not required, and Google has no dedicated rich-result surface for `SoftwareSourceCode`, but a `codeSampleType: "full"` + a short `text` excerpt strengthens AI-search/answer-engine attribution when the page is cited (the underlying claim of this whole findings set: LLM answer engines weight structured, machine-readable code metadata over freeform prose or UI text). Optional, not urgent.

## Info
- `SoftwareSourceCode` is on the **active/specialized** list (not deprecated, no dedicated Google rich-result but fine for AI citation purposes) — no action needed to migrate away from it.
- No `FAQPage` in use — nothing to react to on the May 2026 FAQ rich-result retirement.
- All schema blocks use HTTPS absolute URLs — no relative-URL errors.
- No invalid JSON-LD syntax possible in principle here: schema is authored as plain JS objects and serialized via `JSON.stringify` at render time (`@tanstack/react-router`'s `headContentUtils.js`), so there's no hand-written JSON to typo.

See `generated-schema.json` for ready-to-drop-in snippets for items 1–3 above.
