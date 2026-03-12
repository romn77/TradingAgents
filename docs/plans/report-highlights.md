# Report Highlights Optimization

## TL;DR
> **Summary**: Modify 4 analyst LLM prompts to output a structured JSON highlights block (`json-highlights` fenced code block) at the end of each report, then build frontend components that parse this block and render highlight cards above the markdown narrative for quick scanning.
> **Deliverables**: Modified analyst prompts (4 files), highlights parser utility, HighlightCards component, updated MarkdownContent, updated globals.css
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: Task 1 (schema design) → Tasks 2-5 (prompts, parallel) → Task 6 (parser) → Task 7 (highlight cards component) → Task 8 (integrate into MarkdownContent) → Task 9 (CSS) → Task 10 (integration test)

## Context
### Original Request
Optimize the report display system. Reports are currently pure markdown rendered as-is, with inconsistent formats across categories and low information density. User wants structured highlights extracted and prominently displayed.

### Interview Summary
- **Approach**: Hybrid — modify LLM prompts + build frontend highlight cards
- **Scope**: 4 analyst prompts + frontend components. New reports only.
- **Backward compat**: Old reports render as-is (no highlights). No backend changes.
- **Test strategy**: Tests after implementation. QA scenarios in plan.
- **Language**: Bilingual support (EN/CN). Schema keys in English, values in report language.

### Metis Review (gaps addressed)
- **LLM format drift**: Enforced fail-open parsing — if JSON block is absent/malformed, render original markdown unchanged.
- **Duplicate blocks**: Use FIRST `json-highlights` block found. Ignore subsequent ones.
- **FINAL TRANSACTION PROPOSAL fallback**: If missing from JSON, parse from markdown text as fallback.
- **Security**: No `dangerouslySetInnerHTML`. Card values rendered as plain text. react-markdown safe defaults preserved.
- **Schema sprawl**: Minimal required keys per category + optional extras. Unrecognized fields ignored gracefully.
- **Race conditions**: Preserve existing `requestIdRef` flow in ReportViewer.tsx.
- **Backend unchanged**: Zero API/endpoint/AgentState changes.

## Work Objectives
### Core Objective
Add structured highlight cards above markdown narrative in the report viewer, powered by structured JSON output from analyst LLM prompts.

### Deliverables
- 4 modified analyst prompt files with JSON highlights schema appended to system prompts
- `web/frontend/lib/highlights.ts` — parser utility (extract JSON block, validate, type-safe)
- `web/frontend/components/HighlightCards.tsx` — renders highlight cards from parsed data
- Updated `web/frontend/components/MarkdownContent.tsx` — integrates parser + highlight cards
- Updated `web/frontend/app/globals.css` — highlight card styles
- Minor update to `web/frontend/components/ReportViewer.tsx` — pass category context to MarkdownContent

### Definition of Done (verifiable conditions with commands)
1. `cd web/frontend && npm run lint` exits 0
2. `cd web/frontend && npm run build` exits 0 (Next.js production build succeeds)
3. New reports generated with modified prompts contain `json-highlights` block
4. Frontend renders highlight cards above markdown for reports with valid JSON block
5. Frontend renders original markdown unchanged for reports without JSON block (old reports)
6. Frontend renders original markdown unchanged for reports with malformed JSON block

### Must Have
- Per-category highlight schemas (market, fundamentals, sentiment, news)
- Signal badge (BUY/HOLD/SELL) prominently displayed
- Fail-open parsing: invalid/missing JSON → graceful fallback to markdown-only
- Bilingual support: English schema keys, values in report language
- Responsive design matching existing glass-panel aesthetic

### Must NOT Have (guardrails)
- No backend API changes
- No AgentState schema changes
- No modification to researcher/trader/risk/portfolio prompts
- No old report backward compatibility processing
- No `dangerouslySetInnerHTML` or rehype-raw
- No new npm dependencies (use existing react-markdown, remark-gfm, tailwind)
- No test infrastructure setup (no jest/vitest config changes)

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: Tests after + agent QA scenarios
- QA policy: Every task has agent-executed scenarios (lint, build, visual check via Playwright)
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves

**Wave 1: Foundation** (2 tasks, parallel)
- Task 1: Define highlight schemas + types (TypeScript)
- Task 2: Define parser utility (depends on schema types from Task 1 — sequential within wave)

Actually revised — Task 1 includes both schema + parser since they're tightly coupled:

**Wave 1: Foundation** (1 task)
- Task 1: Highlight schema types + parser utility (`highlights.ts`)

**Wave 2: Prompt modifications** (4 tasks, fully parallel)
- Task 2: Market analyst prompt
- Task 3: Fundamentals analyst prompt
- Task 4: Social media analyst prompt
- Task 5: News analyst prompt

**Wave 3: Frontend components** (3 tasks, sequential within wave)
- Task 6: HighlightCards component
- Task 7: Integrate into MarkdownContent + ReportViewer updates
- Task 8: CSS styles for highlight cards

**Wave 4: Verification** (final verification wave)
- F1-F4: Standard final verification agents

### Dependency Matrix
| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 (Schema + Parser) | — | 2,3,4,5,6,7,8 |
| 2 (Market prompt) | 1 | 10 |
| 3 (Fundamentals prompt) | 1 | 10 |
| 4 (Sentiment prompt) | 1 | 10 |
| 5 (News prompt) | 1 | 10 |
| 6 (HighlightCards) | 1 | 7 |
| 7 (Integration) | 1,6 | 8 |
| 8 (CSS) | 7 | — |

### Agent Dispatch Summary
| Wave | Tasks | Categories |
|------|-------|------------|
| Wave 1 | 1 task | `deep` |
| Wave 2 | 4 tasks | `quick` × 4 |
| Wave 3 | 3 tasks | `visual-engineering` × 3 |
| Wave 4 | 4 tasks | Final verification |

## TODOs

- [ ] 1. Define Highlight Schema Types + Parser Utility

  **What to do**:
  Create `web/frontend/lib/highlights.ts` containing:

  1. TypeScript interfaces for each category's highlight schema:

  ```typescript
  // Common fields across all categories
  interface BaseHighlights {
    signal: "BUY" | "HOLD" | "SELL";
    signal_confidence?: "high" | "medium" | "low";
    summary: string; // 1-2 sentence executive summary
  }

  interface MarketHighlights extends BaseHighlights {
    category: "market";
    trend_direction: "bullish" | "bearish" | "neutral" | "mixed";
    key_levels: {
      support: string[];      // e.g. ["600", "605"]
      resistance: string[];   // e.g. ["615", "620"]
    };
    indicators: Array<{
      name: string;           // e.g. "RSI", "MACD"
      value: string;          // e.g. "40.6", "negative"
      interpretation: string; // e.g. "oversold territory"
    }>;
    volatility?: string;      // e.g. "high", "moderate"
  }

  interface FundamentalsHighlights extends BaseHighlights {
    category: "fundamentals";
    metrics: Array<{
      name: string;           // e.g. "P/E Ratio", "Revenue Growth"
      value: string;          // e.g. "25.3", "+12.5%"
      assessment: string;     // e.g. "above industry average"
    }>;
    financial_health?: string; // e.g. "strong", "moderate", "weak"
  }

  interface SentimentHighlights extends BaseHighlights {
    category: "sentiment";
    overall_sentiment: "positive" | "negative" | "neutral" | "mixed";
    sentiment_score?: string;  // e.g. "65/100"
    key_topics: string[];      // e.g. ["AI expansion", "earnings beat"]
    social_buzz?: string;      // e.g. "high", "moderate", "low"
  }

  interface NewsHighlights extends BaseHighlights {
    category: "news";
    market_impact: "positive" | "negative" | "neutral" | "mixed";
    key_events: Array<{
      event: string;           // e.g. "Fed rate decision"
      impact: string;          // e.g. "bearish for tech"
    }>;
    macro_outlook?: string;    // e.g. "cautious", "optimistic"
  }

  type ReportHighlights = MarketHighlights | FundamentalsHighlights | SentimentHighlights | NewsHighlights;
  ```

  2. Parser function:
  ```typescript
  const HIGHLIGHTS_FENCE = "```json-highlights";
  const FENCE_END = "```";

  /**
   * Extract and parse the json-highlights block from markdown content.
   * Returns { highlights, cleanMarkdown } where:
   *   - highlights: parsed ReportHighlights or null if absent/invalid
   *   - cleanMarkdown: original markdown with the json-highlights block removed
   *
   * FAIL-OPEN: any parse error returns null highlights + original markdown unchanged.
   */
  export function parseHighlights(markdown: string): {
    highlights: ReportHighlights | null;
    cleanMarkdown: string;
  }
  ```

  3. Parsing rules:
     - Find FIRST occurrence of ` ```json-highlights ` fence
     - Extract content between opening fence and next ` ``` ` closing fence
     - Parse as JSON, validate required fields (`signal`, `summary`, `category`)
     - If valid: return parsed highlights + markdown with that block stripped
     - If invalid/missing: return null highlights + original markdown unchanged
     - FALLBACK: If `signal` is missing from JSON, attempt regex extraction of `FINAL TRANSACTION PROPOSAL: **BUY/HOLD/SELL**` from full markdown

  **Must NOT do**:
  - Do NOT add any new npm dependencies
  - Do NOT modify any backend files
  - Do NOT use `eval()` or unsafe parsing

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: Core schema design + parser logic needs careful typing and edge case handling
  - Skills: [`software-architecture`] — typed interface design
  - Omitted: [`frontend-patterns`] — not UI work, pure utility

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2,3,4,5,6,7,8 | Blocked By: none

  **References**:
  - Pattern: `web/frontend/lib/api.ts:1-70` — existing lib utility pattern, export style, TypeScript conventions
  - Type: `web/frontend/components/MarkdownContent.tsx:7-10` — interface pattern for component props
  - Sample: `reports/QQQ_20260306_174555/1_analysts/market.md` — actual report format to parse
  - Sample: `reports/SPY_20260305_155836/1_analysts/market.md` — English report variant

  **Acceptance Criteria** (agent-executable only):
  - [ ] File `web/frontend/lib/highlights.ts` exists and exports `parseHighlights` function and all type interfaces
  - [ ] `cd web/frontend && npx tsc --noEmit` exits 0 (no type errors)
  - [ ] `cd web/frontend && npm run lint` exits 0

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Valid json-highlights block parsed correctly
    Tool: Bash (node script or inline)
    Steps: Create test markdown with valid json-highlights block, import parseHighlights, call it
    Expected: highlights object has correct fields, cleanMarkdown has block removed
    Evidence: .sisyphus/evidence/task-1-parser-valid.txt

  Scenario: Missing json-highlights block falls back gracefully
    Tool: Bash
    Steps: Call parseHighlights with plain markdown (no json-highlights fence)
    Expected: highlights is null, cleanMarkdown equals original input unchanged
    Evidence: .sisyphus/evidence/task-1-parser-missing.txt

  Scenario: Malformed JSON falls back gracefully
    Tool: Bash
    Steps: Call parseHighlights with markdown containing invalid JSON in json-highlights block
    Expected: highlights is null, cleanMarkdown equals original input unchanged
    Evidence: .sisyphus/evidence/task-1-parser-malformed.txt

  Scenario: Signal fallback from markdown text
    Tool: Bash
    Steps: Call parseHighlights with JSON block missing signal field but markdown contains FINAL TRANSACTION PROPOSAL: **SELL**
    Expected: highlights.signal === "SELL"
    Evidence: .sisyphus/evidence/task-1-parser-fallback.txt
  ```

  **Commit**: YES | Message: `feat(highlights): add highlight schema types and parser utility` | Files: [`web/frontend/lib/highlights.ts`]

- [ ] 2. Modify Market Analyst Prompt

  **What to do**:
  Edit `tradingagents/agents/analysts/market_analyst.py` line 49 to append instructions for the structured JSON highlights block after the existing "Markdown table" instruction.

  Add this text after the existing `Make sure to append a Markdown table...` line:

  ```
  After the markdown table, also append a structured highlights block in the following exact format (replace values with your actual analysis findings). This block MUST use the json-highlights code fence:

  \`\`\`json-highlights
  {
    "category": "market",
    "signal": "BUY or HOLD or SELL",
    "signal_confidence": "high or medium or low",
    "summary": "1-2 sentence executive summary of your analysis",
    "trend_direction": "bullish or bearish or neutral or mixed",
    "key_levels": {
      "support": ["level1", "level2"],
      "resistance": ["level1", "level2"]
    },
    "indicators": [
      {"name": "indicator name", "value": "current value", "interpretation": "brief meaning"}
    ],
    "volatility": "high or moderate or low"
  }
  \`\`\`
  ```

  The exact insertion point is in the string concatenation at line 49, after `""" Make sure to append a Markdown table at the end of the report to organize key points in the report, organized and easy to read."""`.

  **Must NOT do**:
  - Do NOT change the core analysis instructions (lines 24-48)
  - Do NOT modify the prompt template structure (lines 52-68)
  - Do NOT change any tool bindings or function signature
  - Do NOT remove the existing "Markdown table" instruction

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Single file, small text insertion in a prompt string
  - Skills: [] — no special skills needed
  - Omitted: [`prompt-engineering`] — the prompt text is provided verbatim

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 1

  **References**:
  - Pattern: `tradingagents/agents/analysts/market_analyst.py:23-50` — current prompt structure, string concatenation pattern
  - Schema: Task 1 `MarketHighlights` interface — field names and types to include in prompt
  - Sample: `reports/QQQ_20260306_174555/1_analysts/market.md` — what current output looks like

  **Acceptance Criteria** (agent-executable only):
  - [ ] `market_analyst.py` contains `json-highlights` fence instruction text
  - [ ] `market_analyst.py` still contains original "Markdown table" instruction
  - [ ] `python -c "from tradingagents.agents.analysts.market_analyst import create_market_analyst"` exits 0 (import succeeds)

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Prompt modification preserves import
    Tool: Bash
    Steps: python -c "from tradingagents.agents.analysts.market_analyst import create_market_analyst; print('OK')"
    Expected: Prints "OK", exits 0
    Evidence: .sisyphus/evidence/task-2-market-import.txt

  Scenario: Prompt contains json-highlights schema
    Tool: Bash (grep)
    Steps: grep -c "json-highlights" tradingagents/agents/analysts/market_analyst.py
    Expected: At least 1 match
    Evidence: .sisyphus/evidence/task-2-market-grep.txt
  ```

  **Commit**: YES | Message: `feat(prompts): add structured highlights schema to market analyst prompt` | Files: [`tradingagents/agents/analysts/market_analyst.py`]

- [ ] 3. Modify Fundamentals Analyst Prompt

  **What to do**:
  Edit `tradingagents/agents/analysts/fundamentals_analyst.py` line 28 to append instructions for the structured JSON highlights block.

  Add after the existing "Markdown table" instruction:

  ```
  After the markdown table, also append a structured highlights block in the following exact format (replace values with your actual analysis findings). This block MUST use the json-highlights code fence:

  \`\`\`json-highlights
  {
    "category": "fundamentals",
    "signal": "BUY or HOLD or SELL",
    "signal_confidence": "high or medium or low",
    "summary": "1-2 sentence executive summary of fundamental analysis",
    "metrics": [
      {"name": "metric name (e.g. P/E Ratio, Revenue Growth, EPS)", "value": "current value", "assessment": "brief assessment"}
    ],
    "financial_health": "strong or moderate or weak"
  }
  \`\`\`
  ```

  **Must NOT do**:
  - Do NOT change the core analysis instructions
  - Do NOT modify prompt template structure or tool bindings
  - Do NOT remove the existing "Markdown table" instruction

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Single file, small text insertion
  - Skills: [] — no special skills needed

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 1

  **References**:
  - Pattern: `tradingagents/agents/analysts/fundamentals_analyst.py:26-29` — current prompt, string concatenation
  - Schema: Task 1 `FundamentalsHighlights` interface
  - Sample: `reports/QQQ_20260306_174555/1_analysts/fundamentals.md`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `fundamentals_analyst.py` contains `json-highlights` fence instruction text
  - [ ] `python -c "from tradingagents.agents.analysts.fundamentals_analyst import create_fundamentals_analyst"` exits 0

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Prompt modification preserves import
    Tool: Bash
    Steps: python -c "from tradingagents.agents.analysts.fundamentals_analyst import create_fundamentals_analyst; print('OK')"
    Expected: Prints "OK", exits 0
    Evidence: .sisyphus/evidence/task-3-fundamentals-import.txt

  Scenario: Prompt contains json-highlights schema
    Tool: Bash
    Steps: grep -c "json-highlights" tradingagents/agents/analysts/fundamentals_analyst.py
    Expected: At least 1 match
    Evidence: .sisyphus/evidence/task-3-fundamentals-grep.txt
  ```

  **Commit**: YES | Message: `feat(prompts): add structured highlights schema to fundamentals analyst prompt` | Files: [`tradingagents/agents/analysts/fundamentals_analyst.py`]

- [ ] 4. Modify Social Media Analyst Prompt

  **What to do**:
  Edit `tradingagents/agents/analysts/social_media_analyst.py` line 19 to append instructions for the structured JSON highlights block.

  Add after the existing "Markdown table" instruction:

  ```
  After the markdown table, also append a structured highlights block in the following exact format (replace values with your actual analysis findings). This block MUST use the json-highlights code fence:

  \`\`\`json-highlights
  {
    "category": "sentiment",
    "signal": "BUY or HOLD or SELL",
    "signal_confidence": "high or medium or low",
    "summary": "1-2 sentence executive summary of sentiment analysis",
    "overall_sentiment": "positive or negative or neutral or mixed",
    "sentiment_score": "score like 65/100 if determinable",
    "key_topics": ["topic1", "topic2", "topic3"],
    "social_buzz": "high or moderate or low"
  }
  \`\`\`
  ```

  **Must NOT do**:
  - Do NOT change the core analysis instructions
  - Do NOT modify prompt template structure or tool bindings
  - Do NOT remove the existing "Markdown table" instruction

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Single file, small text insertion
  - Skills: [] — no special skills needed

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 1

  **References**:
  - Pattern: `tradingagents/agents/analysts/social_media_analyst.py:17-19` — current prompt
  - Schema: Task 1 `SentimentHighlights` interface
  - Sample: `results/QQQ/2026-03-06/reports/sentiment_report.md`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `social_media_analyst.py` contains `json-highlights` fence instruction text
  - [ ] `python -c "from tradingagents.agents.analysts.social_media_analyst import create_social_media_analyst"` exits 0

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Prompt modification preserves import
    Tool: Bash
    Steps: python -c "from tradingagents.agents.analysts.social_media_analyst import create_social_media_analyst; print('OK')"
    Expected: Prints "OK", exits 0
    Evidence: .sisyphus/evidence/task-4-sentiment-import.txt

  Scenario: Prompt contains json-highlights schema
    Tool: Bash
    Steps: grep -c "json-highlights" tradingagents/agents/analysts/social_media_analyst.py
    Expected: At least 1 match
    Evidence: .sisyphus/evidence/task-4-sentiment-grep.txt
  ```

  **Commit**: YES | Message: `feat(prompts): add structured highlights schema to social media analyst prompt` | Files: [`tradingagents/agents/analysts/social_media_analyst.py`]

- [ ] 5. Modify News Analyst Prompt

  **What to do**:
  Edit `tradingagents/agents/analysts/news_analyst.py` line 23 to append instructions for the structured JSON highlights block.

  Add after the existing "Markdown table" instruction:

  ```
  After the markdown table, also append a structured highlights block in the following exact format (replace values with your actual analysis findings). This block MUST use the json-highlights code fence:

  \`\`\`json-highlights
  {
    "category": "news",
    "signal": "BUY or HOLD or SELL",
    "signal_confidence": "high or medium or low",
    "summary": "1-2 sentence executive summary of news analysis",
    "market_impact": "positive or negative or neutral or mixed",
    "key_events": [
      {"event": "event description", "impact": "brief market impact assessment"}
    ],
    "macro_outlook": "cautious or optimistic or pessimistic or neutral"
  }
  \`\`\`
  ```

  **Must NOT do**:
  - Do NOT change the core analysis instructions
  - Do NOT modify prompt template structure or tool bindings
  - Do NOT remove the existing "Markdown table" instruction

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Single file, small text insertion
  - Skills: [] — no special skills needed

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 1

  **References**:
  - Pattern: `tradingagents/agents/analysts/news_analyst.py:21-23` — current prompt
  - Schema: Task 1 `NewsHighlights` interface
  - Sample: `results/QQQ/2026-03-06/reports/news_report.md`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `news_analyst.py` contains `json-highlights` fence instruction text
  - [ ] `python -c "from tradingagents.agents.analysts.news_analyst import create_news_analyst"` exits 0

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Prompt modification preserves import
    Tool: Bash
    Steps: python -c "from tradingagents.agents.analysts.news_analyst import create_news_analyst; print('OK')"
    Expected: Prints "OK", exits 0
    Evidence: .sisyphus/evidence/task-5-news-import.txt

  Scenario: Prompt contains json-highlights schema
    Tool: Bash
    Steps: grep -c "json-highlights" tradingagents/agents/analysts/news_analyst.py
    Expected: At least 1 match
    Evidence: .sisyphus/evidence/task-5-news-grep.txt
  ```

  **Commit**: YES | Message: `feat(prompts): add structured highlights schema to news analyst prompt` | Files: [`tradingagents/agents/analysts/news_analyst.py`]

- [ ] 6. Build HighlightCards Component

  **What to do**:
  Create `web/frontend/components/HighlightCards.tsx` — a React component that renders structured highlight data as visually prominent cards above the markdown narrative.

  Component design:

  1. **Signal Badge** (always shown if signal exists):
     - Large pill badge: BUY (green), HOLD (amber/orange), SELL (red)
     - Confidence level shown as subtitle text
     - Use CSS classes: `.signal-badge`, `.signal-buy`, `.signal-hold`, `.signal-sell`

  2. **Executive Summary** (always shown):
     - Prominent 1-2 sentence summary in a highlighted box
     - Styled similar to `.glass-panel` aesthetic

  3. **Category-specific cards** (conditional per category):

     **Market highlights**:
     - Trend direction badge (bullish/bearish/neutral)
     - Key levels grid: Support levels | Resistance levels
     - Indicators table: Name | Value | Interpretation
     - Volatility indicator

     **Fundamentals highlights**:
     - Financial health badge
     - Metrics grid: Name | Value | Assessment

     **Sentiment highlights**:
     - Overall sentiment badge
     - Sentiment score (if available)
     - Key topics as tag pills
     - Social buzz level

     **News highlights**:
     - Market impact badge
     - Key events list: Event | Impact
     - Macro outlook

  4. **Layout**: Cards use CSS Grid, responsive (1 col mobile, 2-3 col desktop). Follow existing `card-surface` and `glass-panel` patterns from globals.css.

  5. **Props interface**:
  ```typescript
  interface HighlightCardsProps {
    highlights: ReportHighlights;
  }
  ```

  **Must NOT do**:
  - Do NOT use `dangerouslySetInnerHTML` — all values rendered as plain text
  - Do NOT add new npm dependencies
  - Do NOT hardcode colors — use CSS variables from design system (--primary, --accent, --success, etc.)
  - Do NOT render if highlights is null (parent handles this check)

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: UI component with visual design, responsive layout, color coding
  - Skills: [`frontend-patterns`] — React component patterns, memoization
  - Omitted: [`ui-ux-pro-max`] — existing design system is well-defined, just follow it

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 7 | Blocked By: 1

  **References**:
  - Pattern: `web/frontend/components/MarkdownContent.tsx:32-65` — component structure, React.memo pattern, "use client" directive
  - Style: `web/frontend/app/globals.css:89-106` — `.card-surface` pattern for cards
  - Style: `web/frontend/app/globals.css:128-133` — `.glass-panel` pattern for summary
  - Style: `web/frontend/app/globals.css:3-29` — CSS variables (--primary, --accent, --success, --border, etc.)
  - Style: `web/frontend/components/ReportViewer.tsx:154-156` — badge pill styling pattern
  - Type: Task 1 — `ReportHighlights` union type, category-specific interfaces

  **Acceptance Criteria** (agent-executable only):
  - [ ] File `web/frontend/components/HighlightCards.tsx` exists
  - [ ] Exports `HighlightCards` component
  - [ ] `cd web/frontend && npx tsc --noEmit` exits 0
  - [ ] `cd web/frontend && npm run lint` exits 0
  - [ ] No `dangerouslySetInnerHTML` usage (grep confirms 0 matches)

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Component renders signal badge with correct color class
    Tool: Playwright
    Steps: Navigate to a report page with valid highlights containing signal "SELL". Inspect signal badge element.
    Expected: Signal badge contains text "SELL" and has red color styling
    Evidence: .sisyphus/evidence/task-6-signal-badge.png

  Scenario: Component renders category-specific cards
    Tool: Playwright
    Steps: Navigate to market analyst tab for a report with valid highlights. Check for indicators table and key levels.
    Expected: Indicators table visible with rows. Support/resistance levels displayed.
    Evidence: .sisyphus/evidence/task-6-category-cards.png
  ```

  **Commit**: YES | Message: `feat(ui): add HighlightCards component for structured report highlights` | Files: [`web/frontend/components/HighlightCards.tsx`]

- [ ] 7. Integrate Highlights into MarkdownContent + ReportViewer

  **What to do**:

  **A. Update `MarkdownContent.tsx`**:

  1. Import `parseHighlights` from `@/lib/highlights`
  2. Import `HighlightCards` from `@/components/HighlightCards`
  3. In the `useMemo` that currently just returns `content`, call `parseHighlights(content)` to get `{ highlights, cleanMarkdown }`
  4. Render `HighlightCards` above the `ReactMarkdown` article when highlights is non-null
  5. Pass `cleanMarkdown` to `ReactMarkdown` instead of raw `content` (removes the JSON block from rendered markdown)

  Updated component structure:
  ```tsx
  export const MarkdownContent = React.memo(
    function MarkdownContent({ content, isLoading = false }: MarkdownContentProps) {
      const { highlights, cleanMarkdown } = useMemo(() => {
        return parseHighlights(content);
      }, [content]);

      // ... existing loading logic unchanged ...

      return (
        <div className="relative">
          {highlights && (
            <div className="mb-6">
              <HighlightCards highlights={highlights} />
            </div>
          )}
          <article className="markdown-content max-w-none" aria-busy={isLoading}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cleanMarkdown}
            </ReactMarkdown>
          </article>
          {/* ... existing overlay logic unchanged ... */}
        </div>
      );
    }
  );
  ```

  **B. Update `ReportViewer.tsx`** (minimal):
  - No structural changes needed. The `MarkdownContent` component already receives the full markdown string.
  - The category context is already implicitly available because each tab loads a specific file (e.g., `1_analysts/market.md`).
  - If in the future we need category-aware rendering, we can pass `category` prop, but for now the parser detects category from the JSON block's `category` field.

  **Must NOT do**:
  - Do NOT change the existing loading skeleton behavior
  - Do NOT change the existing overlay behavior
  - Do NOT modify the `hasContent` check logic
  - Do NOT break the memoization — keep `useMemo` dependency on `content`
  - Do NOT change ReportViewer's tab navigation or async loading

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: Integrating new UI component into existing render flow
  - Skills: [`frontend-patterns`] — React integration, memoization
  - Omitted: [`software-architecture`] — straightforward integration, not architecture

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 8 | Blocked By: 1, 6

  **References**:
  - Pattern: `web/frontend/components/MarkdownContent.tsx:32-65` — existing component to modify
  - Pattern: `web/frontend/components/MarkdownContent.tsx:34-36` — useMemo processing point (replace)
  - Pattern: `web/frontend/components/MarkdownContent.tsx:47-64` — render structure (add highlights above article)
  - Type: `web/frontend/lib/highlights.ts` — `parseHighlights` function signature
  - Component: `web/frontend/components/HighlightCards.tsx` — component to import
  - Guard: `web/frontend/components/ReportViewer.tsx:82-96` — requestIdRef race guard (do not touch)

  **Acceptance Criteria** (agent-executable only):
  - [ ] `MarkdownContent.tsx` imports `parseHighlights` and `HighlightCards`
  - [ ] `MarkdownContent.tsx` uses `parseHighlights` in `useMemo`
  - [ ] `MarkdownContent.tsx` renders `HighlightCards` conditionally when `highlights !== null`
  - [ ] `cd web/frontend && npx tsc --noEmit` exits 0
  - [ ] `cd web/frontend && npm run build` exits 0

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Report with highlights shows cards above markdown
    Tool: Playwright
    Steps: Start frontend dev server. Navigate to a report with valid highlights. Scroll to top of content panel.
    Expected: Highlight cards visible above the markdown narrative. Both sections rendered.
    Evidence: .sisyphus/evidence/task-7-integration-with-highlights.png

  Scenario: Old report without highlights renders markdown only
    Tool: Playwright
    Steps: Navigate to an existing old report (e.g., QQQ_20260306_174555). View market analyst tab.
    Expected: No highlight cards shown. Markdown renders exactly as before, unchanged.
    Evidence: .sisyphus/evidence/task-7-integration-without-highlights.png

  Scenario: Report with malformed JSON block renders markdown only
    Tool: Bash
    Steps: Create a test .md file with broken JSON in json-highlights block, serve via backend, view in frontend.
    Expected: No highlight cards. Markdown renders with the malformed block visible as code.
    Evidence: .sisyphus/evidence/task-7-integration-malformed.png
  ```

  **Commit**: YES | Message: `feat(ui): integrate highlight cards into MarkdownContent renderer` | Files: [`web/frontend/components/MarkdownContent.tsx`]

- [ ] 8. Add CSS Styles for Highlight Cards

  **What to do**:
  Add styles to `web/frontend/app/globals.css` for the highlight cards. Place them after the existing `.markdown-content` styles (after line 347).

  Required styles:

  1. **Signal Badge**:
  ```css
  .signal-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: 999px;
    font-weight: 800;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .signal-buy {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: #fff;
    border: 1px solid rgba(22, 163, 74, 0.6);
    box-shadow: 0 6px 16px rgba(22, 163, 74, 0.22);
  }

  .signal-hold {
    background: linear-gradient(135deg, #ec5b13 0%, #d74f0d 100%);
    color: #fff;
    border: 1px solid rgba(236, 91, 19, 0.6);
    box-shadow: 0 6px 16px rgba(236, 91, 19, 0.22);
  }

  .signal-sell {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #fff;
    border: 1px solid rgba(220, 38, 38, 0.6);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.22);
  }
  ```

  2. **Highlight container and cards**:
  ```css
  .highlights-container { ... }    /* grid layout, gap, responsive cols */
  .highlight-summary { ... }       /* glass-panel style summary box */
  .highlight-card { ... }          /* individual metric/indicator card */
  .highlight-badge { ... }         /* small status badges (bullish/bearish/etc) */
  .highlight-tag { ... }           /* tag pills for topics */
  .highlight-metric { ... }        /* metric name + value pair */
  .highlight-table { ... }         /* compact table for indicators */
  ```

  3. **Design constraints**:
     - Use existing CSS variables: `--primary`, `--accent`, `--success`, `--border`, `--surface-quiet`, etc.
     - Follow `card-surface` pattern for cards (border, border-radius, background, box-shadow, hover)
     - Follow `glass-panel` pattern for summary box
     - Responsive: 1 column on mobile, 2-3 columns on desktop
     - Match existing `.markdown-content` font sizes and spacing
     - Include `@media (prefers-reduced-motion: reduce)` for any transitions

  **Must NOT do**:
  - Do NOT modify existing CSS rules — only add new ones
  - Do NOT use !important
  - Do NOT hardcode colors — use CSS variables

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: Pure CSS styling work
  - Skills: [`frontend-patterns`] — responsive design patterns
  - Omitted: [`ui-ux-pro-max`] — design system is defined, just extend it

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: none | Blocked By: 7

  **References**:
  - Pattern: `web/frontend/app/globals.css:89-106` — `.card-surface` — card styling pattern to follow
  - Pattern: `web/frontend/app/globals.css:128-133` — `.glass-panel` — summary box pattern
  - Pattern: `web/frontend/app/globals.css:3-29` — CSS variables to use
  - Pattern: `web/frontend/app/globals.css:304-311` — `.markdown-content table` — table styling to extend
  - Pattern: `web/frontend/app/globals.css:335-347` — responsive breakpoint pattern
  - Pattern: `web/frontend/app/globals.css:349-357` — reduced motion query

  **Acceptance Criteria** (agent-executable only):
  - [ ] `globals.css` contains `.signal-badge`, `.signal-buy`, `.signal-hold`, `.signal-sell` classes
  - [ ] `globals.css` contains `.highlights-container` class
  - [ ] `cd web/frontend && npm run build` exits 0
  - [ ] No `!important` usage in added styles

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Signal badge renders with correct gradient colors
    Tool: Playwright
    Steps: Navigate to a report with SELL signal. Screenshot the signal badge.
    Expected: Red gradient badge visible with "SELL" text
    Evidence: .sisyphus/evidence/task-8-signal-sell.png

  Scenario: Cards are responsive on mobile viewport
    Tool: Playwright
    Steps: Set viewport to 375x812 (iPhone). Navigate to report with highlights.
    Expected: Highlight cards stack in single column. No horizontal overflow.
    Evidence: .sisyphus/evidence/task-8-responsive-mobile.png
  ```

  **Commit**: YES | Message: `feat(ui): add CSS styles for highlight cards and signal badges` | Files: [`web/frontend/app/globals.css`]

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit — oracle
  Verify all tasks executed match plan. No scope creep. No files modified outside plan scope.

- [ ] F2. Code Quality Review — unspecified-high
  Review all modified/created files for: TypeScript types correctness, no `any` types, proper memoization, no security issues, consistent code style with existing codebase.

- [ ] F3. Real Manual QA — unspecified-high (+ playwright)
  Start both backend and frontend servers. Navigate through ALL existing reports — verify they render unchanged. If a newly generated report exists with highlights, verify cards display correctly. Test mobile viewport. Take evidence screenshots.

- [ ] F4. Scope Fidelity Check — deep
  Verify: no backend files modified, no AgentState changes, no new npm dependencies added, no researcher/trader/risk/portfolio prompts touched. Only the 4 analyst prompts + frontend files changed.

## Commit Strategy
Each task gets its own commit with conventional commit message. Final squash optional.

1. `feat(highlights): add highlight schema types and parser utility`
2. `feat(prompts): add structured highlights schema to market analyst prompt`
3. `feat(prompts): add structured highlights schema to fundamentals analyst prompt`
4. `feat(prompts): add structured highlights schema to social media analyst prompt`
5. `feat(prompts): add structured highlights schema to news analyst prompt`
6. `feat(ui): add HighlightCards component for structured report highlights`
7. `feat(ui): integrate highlight cards into MarkdownContent renderer`
8. `feat(ui): add CSS styles for highlight cards and signal badges`

## Success Criteria
1. New analyst reports contain parseable `json-highlights` blocks
2. Frontend renders highlight cards with signal badge, summary, and category-specific metrics above markdown for new reports
3. Old reports render exactly as before — no visual regression
4. `npm run build` succeeds with zero errors
5. `npm run lint` passes
6. All Python prompt files import successfully
7. No new npm dependencies added
8. No backend API changes
