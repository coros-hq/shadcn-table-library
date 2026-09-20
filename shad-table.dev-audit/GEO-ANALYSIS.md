# GEO / AI Search Analysis — shad-table.dev

Run 2026-09-20. Per Google's own framing (cited in this skill), GEO is SEO fundamentals applied to AI-search surfaces, not a separate discipline — findings here build directly on the earlier technical/content/schema audits rather than replacing them.

## GEO Readiness Score: 48/100
*(Revised from an initial 42/100 after correcting a research error below — the site's visible-content structure is better than first reported.)*

### Platform Breakdown
| Platform | Score | Why |
|---|---|---|
| Google AI Overviews | 60/100 | Ranking-correlated — inherits the site's classic-SEO fixes already made (canonical/sitemap), plus visible per-page intro paragraphs are already in place; short paragraph length (not invisibility) is the remaining ceiling. |
| Google AI Mode (Gemini 3.5 Flash) | 35/100 | Draws from a broader pool where freshness + entity authority matter more than position — this site has near-zero third-party entity presence (see Brand Mentions) and no content refresh cadence, both directly penalized here. |
| ChatGPT | 25/100 | ChatGPT's top citation sources are Wikipedia (47.9%) and Reddit (11.3%) — zero presence on either (confirmed via live search, see below). |
| Perplexity | 25/100 | Perplexity leans Reddit (46.7%) + Wikipedia — same gap. |

## Brand Mention Analysis — Critical Gap
Live web search for "shad-table.dev" / "ShadTable" found:
- **No Reddit presence** — zero discussion threads found.
- **No Wikipedia/Wikidata entry** (searches redirected to unrelated "Shad (software)" disambiguation pages).
- **No YouTube coverage** found.
- **No LinkedIn presence** found.
- **Not listed in `awesome-shadcn-ui`** or other community-curated shadcn/ui resource lists that a competing library (`sadmann7/tablecn`) does appear in.
- The library's own site pages (`shad-table.dev/*`) rank fine for direct-name searches, but a competitor (`tablecn`) surfaces prominently for generic "shadcn table components" queries where ShadTable does not.

This is the single highest-leverage finding in this audit: **brand mentions correlate ~3x more strongly with AI citation than backlinks** (Ahrefs, Dec 2025, 75k brands), and YouTube/Reddit mentions are the strongest individual signals. Right now ShadTable has none of the community footprint that AI models pull from when answering "what table library should I use with shadcn/ui" — a question this product is a near-perfect answer to.

**Recommended, in order of effort/impact**: (1) a Show HN / r/reactjs / r/nextjs post when a new example ships — cheap, direct Reddit presence; (2) get listed in `awesome-shadcn-ui` and similar curated lists via PR — near-zero cost, durable; (3) a short YouTube walkthrough of the CLI install + a couple of table variants — YouTube mentions are the single strongest correlate in the Ahrefs data.

## AI Crawler Access Status
`robots.txt` (`User-agent: *`, `Disallow:` empty) allows every crawler with no exceptions — **GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, CCBot, anthropic-ai, Bytespider, cohere-ai are all implicitly allowed.** This is the right call for a library whose growth depends on AI-assisted developer discovery. No action needed, though it's worth being an explicit, documented choice (a one-line comment in `robots.txt`) rather than a default nobody decided.

## llms.txt Status
Missing (`/llms.txt` → 404). Per this skill's own primary-source evidence (Mueller, Illyes, SE Ranking's 300k-domain study), `llms.txt` is **not currently a citation lever** for major AI search systems — it's tracked here for completeness only, and this audit assigns it no ranking weight. Not worth prioritizing over the brand-mention and content-structure gaps above.

## Server-Side Rendering Check
Pass. Confirmed directly (not inferred): the homepage and all 28 route pages return full title/meta/H1/body content in the raw, non-JS-executed HTML response. AI crawlers that don't execute JavaScript still see the real content. No action needed here — this is the site's strongest GEO fundamental.

## Passage-Level Citability — Medium/High Priority Gap

### 1. ~~Meta description trapped, never visible~~ — retracted, was a research error
An earlier draft of this report claimed each page's citable definition sentence only existed in `<meta name="description">` and never rendered as visible body text. That was **wrong** — while implementing the suggested fix, direct inspection of the actual page components (e.g. `src/components/editable/editable-table-page.tsx:86-93`) and the rendered HTML of all 5 sampled pages (`comparison-table`, `editable-table`, `pivot-table`, `server-table`, `tree-table`) confirmed every page already renders a visible `<p>` directly under the `<h1>` carrying essentially the same sentence as the meta description (sometimes worded slightly differently, which is fine). The original check only inspected the *first* text match in the HTML (the meta tag) and incorrectly concluded no second occurrence existed. No fix was needed or applied here — correcting the record rather than leaving a false finding in place.

### 2. Homepage's definition sentence is well-placed
By contrast, the homepage already does this correctly — "ShadTable is a set of composable, copy-paste table components — sortable data tables, server-side pagination, tree and pivot structures, inline editing, dashboard/analytics variants — for engineers building data-dense UIs on shadcn/ui and TanStack Table" appears as real, visible body text near the top of the page, at 43 words — close to the optimal 134–167-word citation window but on the short side. Consider extending it slightly with one more concrete sentence (e.g., the install command's context) to land inside the optimal range.

### 3. Heading hierarchy is inverted site-wide: `<h2>` before `<h1>`
Verified directly in the raw HTML of every sampled example page (`comparison-table`, `editable-table`, `pivot-table`, `server-table`, `tree-table`): the shared docs layout renders `<h2>Search docs</h2>` (part of the command-palette trigger UI) **before** the page's own `<h1>{Component Name}</h1>` in DOM order. This is a structural-readability weak signal for AI parsers (which weight heading hierarchy for content structure) and also a plain HTML semantics issue independent of GEO. Low effort to fix — likely just a component-ordering change in the shared layout, or changing that UI element to a non-heading tag (a `<button>` labeled "Search docs" doesn't need to be an `<h2>` at all — it's a search trigger, not a document section).

## Authority & Brand Signals
- No author byline, no publication/last-updated date visible on any page — for a docs/component-library site this is a lesser concern than for editorial content, but a visible "last verified against ShadTable vX.X" or a repo-linked commit date would help freshness signals given AI Mode's ~3x citation boost for content under 3 months old.
- `codeRepository` links in the `SoftwareSourceCode` schema (see prior schema audit) do point to the real, public GitHub repo — that's a legitimate authority signal already in place.
- No expert quotes, no citations to primary sources — expected for a component-demo site, not a real gap.

## Multi-Modal Content
Each example page is inherently multi-modal in the best way for this content type — a live interactive component demo, not just a screenshot. This exceeds typical "add an image" GEO advice; no action needed. No embedded video walkthroughs, which is exactly the YouTube-presence gap flagged under Brand Mentions above.

---

## Top 5 Highest-Impact Changes
1. **Build third-party brand presence** (Reddit post, `awesome-shadcn-ui` PR listing, one YouTube walkthrough) — addresses the single strongest AI-citation correlate the site currently has zero coverage on.
2. **Fixed**: inverted heading order (`<h2>Search docs</h2>` rendering before the page's own `<h1>` in every page's DOM, from the global command-palette's accessible title) — `CommandDialog`'s title (`src/components/ui/command.tsx`) now renders as a `<span>` instead of `<h2>`, so it no longer appears in the document's heading outline. Verified against a rebuild.
3. Extend the homepage's intro sentence slightly toward the 134–167-word optimal citation length (currently ~43 words).
4. Add a visible "last updated" / version marker per page to support freshness signals for AI Mode.
5. Where near-duplicate page topics exist, sharpen each page's already-visible intro paragraph to state explicitly how it differs from its siblings (see Content Reformatting below) — the visible copy exists, it just doesn't yet differentiate.

## Schema Recommendations for AI Discoverability
Already covered in the prior schema audit (`SCHEMA-REPORT.md`) — `SoftwareSourceCode` per page and site-wide `WebSite` are in place (pending redeploy) and are appropriate for AI discoverability; the outstanding items there (`BreadcrumbList`, `SearchAction`) still apply and reinforce entity/structure signals for AI crawlers as well as classic search.

## Content Reformatting Suggestions
- Every page already renders a visible intro paragraph under its `<h1>` (confirmed, see retraction above) — no placement fix needed.
- Where near-duplicate page topics exist (`filter-toolbar-table` / `toolbar-filter-table` / `params-filter-table` / `filter-state-shape-table`, flagged in the content audit), make sure each promoted paragraph explicitly states *how it differs* from its siblings — this doubles as both a cannibalization fix and a citability improvement, since AI answer engines favor passages that make a specific, differentiated claim over generic restatement.
