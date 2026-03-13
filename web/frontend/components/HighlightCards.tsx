import { ReportHighlights, TradeSignal } from "@/lib/highlights";

interface HighlightCardsProps {
  highlights: ReportHighlights;
}

function signalClass(signal: TradeSignal): string {
  switch (signal) {
    case "BUY":
      return "signal-buy";
    case "HOLD":
      return "signal-hold";
    case "SELL":
      return "signal-sell";
    default:
      return "";
  }
}

function priorityClass(priority: string): string {
  const normalized = priority.trim().toLowerCase();
  if (normalized === "immediate") {
    return "priority-immediate";
  }
  if (normalized === "conditional") {
    return "priority-conditional";
  }
  if (normalized === "long-term" || normalized === "longterm" || normalized === "long term") {
    return "priority-longterm";
  }
  return "";
}

function renderMarket(highlights: Extract<ReportHighlights, { category: "market" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="Market trend and levels">
        <h4>Market Direction</h4>
        <div className="highlight-badge">Trend: {highlights.trend_direction}</div>
        {highlights.volatility && <p className="highlight-metric">Volatility: {highlights.volatility}</p>}
      </section>

      <section className="highlight-card" aria-label="Market key levels">
        <h4>Key Levels</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <h5>Support</h5>
            <ul>
              {highlights.key_levels.support.map((level, idx) => (
                <li key={`support-${idx}`}>{level}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Resistance</h5>
            <ul>
              {highlights.key_levels.resistance.map((level, idx) => (
                <li key={`resistance-${idx}`}>{level}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="highlight-card" aria-label="Technical indicators">
        <h4>Indicators</h4>
        <table className="highlight-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {highlights.indicators.map((indicator, idx) => (
              <tr key={`indicator-${idx}`}>
                <td>{indicator.name}</td>
                <td>{indicator.value}</td>
                <td>{indicator.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function renderFundamentals(highlights: Extract<ReportHighlights, { category: "fundamentals" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="Fundamentals health">
        <h4>Financial Health</h4>
        {highlights.financial_health ? (
          <div className="highlight-badge">{highlights.financial_health}</div>
        ) : (
          <p className="highlight-metric">No explicit health label provided.</p>
        )}
      </section>

      <section className="highlight-card" aria-label="Fundamental metrics">
        <h4>Key Metrics</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {highlights.metrics.map((metric, idx) => (
            <article key={`metric-${idx}`} className="highlight-metric">
              <strong>{metric.name}</strong>
              <p>{metric.value}</p>
              <p>{metric.assessment}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function renderSentiment(highlights: Extract<ReportHighlights, { category: "sentiment" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="Sentiment overview">
        <h4>Sentiment Overview</h4>
        <div className="highlight-badge">{highlights.overall_sentiment}</div>
        {highlights.sentiment_score && (
          <p className="highlight-metric">Score: {highlights.sentiment_score}</p>
        )}
        {highlights.social_buzz && <p className="highlight-metric">Social Buzz: {highlights.social_buzz}</p>}
      </section>

      <section className="highlight-card" aria-label="Sentiment key topics">
        <h4>Key Topics</h4>
        <div className="flex flex-wrap gap-2">
          {highlights.key_topics.map((topic, idx) => (
            <span key={`topic-${idx}`} className="highlight-tag">
              {topic}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

function renderNews(highlights: Extract<ReportHighlights, { category: "news" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="News impact">
        <h4>Market Impact</h4>
        <div className="highlight-badge">{highlights.market_impact}</div>
        {highlights.macro_outlook && <p className="highlight-metric">Macro Outlook: {highlights.macro_outlook}</p>}
      </section>

      <section className="highlight-card" aria-label="Key news events">
        <h4>Key Events</h4>
        <ul>
          {highlights.key_events.map((event, idx) => (
            <li key={`event-${idx}`}>
              <strong>{event.event}</strong>
              <p>{event.impact}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function renderResearchCase(
  highlights: Extract<ReportHighlights, { category: "bull_case" | "bear_case" }>
) {
  const stanceClass = highlights.stance === "bullish" ? "stance-bullish" : "stance-bearish";

  return (
    <>
      <section className="highlight-card" aria-label="Research stance and arguments">
        <h4>Research Stance</h4>
        <div className={`highlight-badge ${stanceClass}`}>{highlights.stance}</div>
        <ul>
          {highlights.key_arguments.map((argument, idx) => (
            <li key={`argument-${idx}`}>
              <strong>{argument.point}</strong>
              <p>{argument.evidence}</p>
            </li>
          ))}
        </ul>
      </section>

      {highlights.counterpoints && highlights.counterpoints.length > 0 && (
        <section className="highlight-card" aria-label="Counterpoints">
          <h4>Counterpoints</h4>
          <ul>
            {highlights.counterpoints.map((counterpoint, idx) => (
              <li key={`counterpoint-${idx}`}>{counterpoint}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function renderResearchDecision(highlights: Extract<ReportHighlights, { category: "research_decision" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="Research manager decision">
        <h4>Research Decision</h4>
        <div className={`signal-badge ${signalClass(highlights.decision)}`}>{highlights.decision}</div>
        <p className="highlight-metric">Aligned with: {highlights.aligned_with}</p>
        <p>{highlights.rationale}</p>
      </section>

      <section className="highlight-card" aria-label="Research action items">
        <h4>Action Items</h4>
        <ul>
          {highlights.action_items.map((item, idx) => (
            <li key={`action-item-${idx}`}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function renderTrader(highlights: Extract<ReportHighlights, { category: "trader" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="Trading decision">
        <h4>Trading Decision</h4>
        <div className={`signal-badge ${signalClass(highlights.decision)}`}>{highlights.decision}</div>
      </section>

      <section className="highlight-card" aria-label="Entry and exit strategy">
        <h4>Entry / Exit Strategy</h4>
        <p className="highlight-metric">Action: {highlights.entry_exit.action}</p>
        {highlights.entry_exit.exit_target && (
          <p className="highlight-metric">Exit target: {highlights.entry_exit.exit_target}</p>
        )}
        {highlights.entry_exit.stop_loss && (
          <p className="highlight-metric">Stop loss: {highlights.entry_exit.stop_loss}</p>
        )}
        {highlights.entry_exit.re_entry && (
          <p className="highlight-metric">Re-entry: {highlights.entry_exit.re_entry}</p>
        )}
      </section>

      <section className="highlight-card" aria-label="Trading risk factors">
        <h4>Risk Factors</h4>
        <ul>
          {highlights.risk_factors.map((risk, idx) => (
            <li key={`risk-factor-${idx}`}>{risk}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function renderRiskDebate(
  highlights: Extract<ReportHighlights, { category: "risk_aggressive" | "risk_conservative" | "risk_neutral" }>
) {
  return (
    <>
      <section className="highlight-card" aria-label="Risk stance">
        <h4>Risk Stance</h4>
        <div className="highlight-badge">{highlights.stance_label}</div>
        <p className="highlight-metric">Assessment: {highlights.risk_assessment}</p>
        <p>{highlights.core_argument}</p>
      </section>

      <section className="highlight-card" aria-label="Risk recommendations">
        <h4>Recommendations</h4>
        <ul>
          {highlights.key_recommendations.map((recommendation, idx) => (
            <li key={`recommendation-${idx}`}>{recommendation}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function renderPortfolioDecision(highlights: Extract<ReportHighlights, { category: "portfolio_decision" }>) {
  return (
    <>
      <section className="highlight-card" aria-label="Portfolio final decision">
        <h4>Final Decision</h4>
        <div className={`signal-badge ${signalClass(highlights.final_decision)}`}>
          {highlights.final_decision}
        </div>
        <p>{highlights.decision_basis}</p>
      </section>

      <section className="highlight-card" aria-label="Strategic actions">
        <h4>Strategic Actions</h4>
        <ol>
          {highlights.strategic_actions.map((action, idx) => (
            <li key={`strategic-action-${idx}`}>
              <p>{action.action}</p>
              <span className={`highlight-tag ${priorityClass(action.priority)}`}>{action.priority}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="highlight-card" aria-label="Risk warnings">
        <h4>Risk Warnings</h4>
        <ul>
          {highlights.risk_warnings.map((warning, idx) => (
            <li key={`warning-${idx}`}>{warning}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function renderCategoryCards(highlights: ReportHighlights) {
  switch (highlights.category) {
    case "market":
      return renderMarket(highlights);
    case "fundamentals":
      return renderFundamentals(highlights);
    case "sentiment":
      return renderSentiment(highlights);
    case "news":
      return renderNews(highlights);
    case "bull_case":
    case "bear_case":
      return renderResearchCase(highlights);
    case "research_decision":
      return renderResearchDecision(highlights);
    case "trader":
      return renderTrader(highlights);
    case "risk_aggressive":
    case "risk_conservative":
    case "risk_neutral":
      return renderRiskDebate(highlights);
    case "portfolio_decision":
      return renderPortfolioDecision(highlights);
    default:
      return null;
  }
}

export function HighlightCards({ highlights }: HighlightCardsProps) {
  return (
    <section className="highlights-container" aria-label="Structured report highlights">
      <header className="highlight-summary">
        <p className={`signal-badge ${signalClass(highlights.signal)}`}>{highlights.signal}</p>
        {highlights.signal_confidence && (
          <p className="highlight-tag">Confidence: {highlights.signal_confidence}</p>
        )}
        <p>{highlights.summary}</p>
      </header>

      <div className="highlights-grid grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {renderCategoryCards(highlights)}
      </div>
    </section>
  );
}
