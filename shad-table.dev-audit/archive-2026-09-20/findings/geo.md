# AI Search Readiness (GEO) Findings — shad-table.dev

## What Works
- `robots.txt` has `Disallow:` empty for `User-agent: *` — no blocks on GPTBot, ClaudeBot, PerplexityBot, or other AI crawlers.
- Core content (title, description, H1, body text) is server-rendered and present in the raw HTML — AI crawlers that don't execute JS can still read the real content.

## Gaps
- **No `llms.txt`** (`https://www.shad-table.dev/llms.txt` → 404). For a developer-tool/component-library product, an `llms.txt` summarizing what ShadTable is, its install command, and links to each component page is low-effort and increasingly used by AI assistants (Claude, ChatGPT, Perplexity) doing tool/library lookups when a developer asks "what table component library works with shadcn/ui".
- **Thin differentiating text per page** (see content.md #1) — AI answer engines cite pages that clearly state the problem/solution in prose, not just a demo + code block. Adding a 2–4 sentence "what this is / when to use it" block per example page would materially improve citation odds for queries like "shadcn tree table example" or "editable table shadcn ui".
- No FAQ-style content or explicit "vs" comparisons (e.g., ShadTable vs building your own TanStack Table wrapper) that LLMs tend to pull into synthesized answers.

## Recommendation Priority: Medium
Not urgent, but cheap wins given the audience (developers who increasingly discover libraries via AI assistants rather than classic search).
