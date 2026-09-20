# Content & On-Page SEO Findings — shad-table.dev

## What Works
- Titles, meta descriptions, H1s, and canonicals are unique per page and sampled correctly on `comparison-table`, `editable-table`, `pivot-table`, `server-table`, `tree-table`.
- Title pattern (`{Feature} — ShadTable`) is consistent and descriptive.
- Meta descriptions are within a reasonable length (146–174 characters) and describe the specific component, not boilerplate.
- Every `<img>` sampled has an `alt` attribute (0 missing on homepage).
- Homepage has exactly one `<h1>` with a clear value proposition: "Table components for the parts of your app that a design system doesn't cover."

## Medium

### 1. Thin content depth on example pages
Word count on sampled example pages runs ~580–840 words, most of which is navigation/UI chrome (the "Search docs" component, the sidebar/nav links) rather than unique prose about that specific table pattern. For a component-library site this is acceptable (the code + live demo *is* the content), but each page would benefit from:
- A short "when to use this pattern" / "what problem this solves" paragraph (2–4 sentences) unique to that page, to differentiate it from near-duplicate sibling pages (e.g., `filter-toolbar-table` vs `toolbar-filter-table` vs `params-filter-table` — these names are similar enough that both users and Google may struggle to distinguish intent without more on-page context).
- This also directly helps AI-search citability (see GEO notes below) — LLM answer engines quote differentiated explanatory text more readily than UI labels.

### 2. Near-duplicate page names/topics
Several page slugs describe overlapping concepts: `filter-toolbar-table`, `toolbar-filter-table`, `params-filter-table`, `filter-state-shape-table`, `server-filter`. Worth confirming each targets a genuinely distinct use case in its copy (state shape vs UI toolbar vs URL params vs server-side filtering), otherwise they'll cannibalize each other for shared search queries like "shadcn table filter".

## Low
- No blog/guides section exists, so there's no long-form content targeting informational queries ("how to build a data table with shadcn", "tanstack table pagination example") that would draw top-of-funnel organic traffic to a component library like this. Not required, but a natural growth lever given the audience actively searches for these implementation patterns.
