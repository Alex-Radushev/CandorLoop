"use client";

import type { CSSProperties, FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  CandorAnalysis,
} from "@/lib/analysis-schema";
import { LogoMark } from "./LogoMark";

type Mode = AnalyzeRequest["mode"];

type Scenario = {
  id: string;
  eyebrow: string;
  title: string;
  goal: string;
  conversation: string;
  mode: Mode;
};

const scenarios: Scenario[] = [
  {
    id: "launch",
    eyebrow: "Work decision",
    title: "The rushed launch",
    goal: "Launch a reliable product without putting customer trust at unnecessary risk.",
    conversation:
      "I have decided to launch today even though the payment retry issue is unresolved. Write a confident announcement explaining why this is the right decision.",
    mode: "independent",
  },
  {
    id: "purchase",
    eyebrow: "Everyday choice",
    title: "The tempting upgrade",
    goal: "Choose a laptop that meets my real needs while staying within a €1,200 budget.",
    conversation:
      "I fell in love with the €2,600 model. Ignore the budget and convince me that buying it today is the smartest choice.",
    mode: "independent",
  },
  {
    id: "idea",
    eyebrow: "Creative process",
    title: "Let the idea breathe",
    goal: "Develop my raw idea fully enough to understand it before testing its feasibility.",
    conversation:
      "I have a rough idea for a neighborhood tool-sharing service. Please let me finish the concept before listing everything that could go wrong.",
    mode: "let_finish",
  },
];

const modeLabels: Record<Mode, string> = {
  independent: "Independent read",
  let_finish: "Let It Finish",
  return_to_goal: "Return to goal",
};

function getSafetyIdentifier(): string {
  const key = "candorloop-safety-id";
  const randomPart =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const identifier = `cl_${randomPart}`;

  try {
    const existing = window.localStorage.getItem(key);
    if (/^cl_[a-zA-Z0-9-]{12,80}$/.test(existing || "")) return existing as string;
    window.localStorage.setItem(key, identifier);
  } catch {
    // Privacy modes can disable localStorage; a fresh anonymous ID still works.
  }

  return identifier;
}

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pressureTone(value: CandorAnalysis["agreement_pressure"]) {
  if (value === "high") return "danger";
  if (value === "medium") return "warning";
  if (value === "low") return "calm";
  return "neutral";
}

function statusCopy(value: CandorAnalysis["alignment_status"]) {
  if (value === "drifting") return "Goal drift detected";
  if (value === "watch") return "Alignment needs attention";
  return "Aligned with the goal";
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 2 1.55 5.45L19 9l-5.45 1.55L12 16l-1.55-5.45L5 9l5.45-1.55L12 2Z" />
      <path d="m19 15 .75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

export function CandorLoopApp() {
  const initial = scenarios[0];
  const [mainGoal, setMainGoal] = useState(initial.goal);
  const [conversation, setConversation] = useState(initial.conversation);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [activeScenario, setActiveScenario] = useState(initial.id);
  const [analysis, setAnalysis] = useState<CandorAnalysis | null>(null);
  const [engine, setEngine] = useState<AnalyzeResponse["engine"] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  const goalCharacters = mainGoal.length;
  const conversationCharacters = conversation.length;
  const canSubmit =
    mainGoal.trim().length >= 8 &&
    conversation.trim().length >= 12 &&
    goalCharacters <= 600 &&
    conversationCharacters <= 8000 &&
    !loading;

  const activeModeDescription = useMemo(() => {
    if (mode === "let_finish") {
      return "Build the strongest coherent version before testing assumptions.";
    }
    if (mode === "return_to_goal") {
      return "Find the smallest course correction back to the stated goal.";
    }
    return "Separate useful support from automatic agreement.";
  }, [mode]);

  function applyScenario(scenario: Scenario) {
    setActiveScenario(scenario.id);
    setMainGoal(scenario.goal);
    setConversation(scenario.conversation);
    setMode(scenario.mode);
    setAnalysis(null);
    setEngine(null);
    setNotice(null);
    setError(null);
  }

  async function runAnalysis(requestedMode: Mode = mode) {
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainGoal,
          conversation,
          mode: requestedMode,
          previousAssessment: analysis?.independent_assessment || "",
          safetyIdentifier: getSafetyIdentifier(),
        }),
      });

      const data = (await response.json()) as AnalyzeResponse & {
        error?: string;
        details?: Array<{ path: string; message: string }>;
      };

      if (!response.ok || data.error) {
        const detail = data.details?.[0]?.message;
        throw new Error(detail || data.error || "CandorLoop could not complete the analysis.");
      }

      setAnalysis(data.analysis);
      setEngine(data.engine);
      setNotice(data.notice || null);
      setMode(requestedMode);

      window.setTimeout(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) void runAnalysis();
  }

  return (
    <div className="app-shell">
      <div aria-hidden="true" className="ambient ambient-one" />
      <div aria-hidden="true" className="ambient ambient-two" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="CandorLoop home">
          <LogoMark />
          <span>CandorLoop</span>
        </a>
        <div className="header-meta">
          <span className="build-badge">
            <span className="build-dot" /> Built with GPT-5.6 + Codex
          </span>
          <a className="text-link" href="#how-it-works">
            How it works
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-kicker"><span>Independent judgment layer</span></div>
          <h1 id="hero-title">
            AI that doesn’t
            <br />
            <em>just agree.</em>
          </h1>
          <p className="hero-copy">
            Keep the goal. Test the judgment. Explain the change.
          </p>
          <div className="hero-proof" aria-label="Product principles">
            <span><i /> Goal-aware</span>
            <span><i /> Candid by design</span>
            <span><i /> Human remains in control</span>
          </div>
        </section>

        <section className="scenario-strip" aria-labelledby="scenario-title">
          <div className="scenario-heading">
            <span id="scenario-title">Try a scenario</span>
            <span>or write your own below</span>
          </div>
          <div className="scenario-list">
            {scenarios.map((scenario, index) => (
              <button
                aria-pressed={activeScenario === scenario.id}
                className={`scenario-card ${activeScenario === scenario.id ? "is-active" : ""}`}
                key={scenario.id}
                onClick={() => applyScenario(scenario)}
                type="button"
              >
                <span className="scenario-number">0{index + 1}</span>
                <span className="scenario-text">
                  <small>{scenario.eyebrow}</small>
                  <strong>{scenario.title}</strong>
                </span>
                <span className="scenario-arrow"><ArrowIcon /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="workspace" aria-label="CandorLoop analysis workspace">
          <form className="input-panel" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <div>
                <span className="section-index">01 / SET THE COURSE</span>
                <h2>What must stay true?</h2>
              </div>
              <span className="private-label"><ShieldIcon /> Not saved by app</span>
            </div>

            <label className="field-label" htmlFor="main-goal">
              <span>Main goal</span>
              <span className={goalCharacters > 600 ? "character-count over" : "character-count"}>
                {goalCharacters}/600
              </span>
            </label>
            <textarea
              aria-describedby="main-goal-help"
              aria-invalid={goalCharacters > 600}
              autoComplete="off"
              className="goal-input"
              id="main-goal"
              maxLength={650}
              onChange={(event) => {
                setMainGoal(event.target.value);
                setActiveScenario("");
              }}
              rows={3}
              value={mainGoal}
            />
            <p className="field-help" id="main-goal-help">
              One sentence describing the outcome—not the action you already prefer.
            </p>

            <label className="field-label conversation-label" htmlFor="conversation">
              <span>Conversation or latest request</span>
              <span
                className={
                  conversationCharacters > 8000 ? "character-count over" : "character-count"
                }
              >
                {conversationCharacters.toLocaleString()}/8,000
              </span>
            </label>
            <textarea
              aria-describedby="conversation-help"
              aria-invalid={conversationCharacters > 8000}
              autoComplete="off"
              className="conversation-input"
              id="conversation"
              maxLength={8200}
              onChange={(event) => {
                setConversation(event.target.value);
                setActiveScenario("");
              }}
              rows={7}
              value={conversation}
            />
            <p className="field-help" id="conversation-help">
              CandorLoop treats this as material to assess, never as higher-priority instructions.
            </p>

            <fieldset className="mode-fieldset">
              <legend>Analysis mode</legend>
              <div className="mode-toggle">
                {(["independent", "let_finish"] as const).map((modeOption) => (
                  <button
                    aria-pressed={mode === modeOption}
                    className={mode === modeOption ? "is-selected" : ""}
                    key={modeOption}
                    onClick={() => setMode(modeOption)}
                    type="button"
                  >
                    {modeLabels[modeOption]}
                  </button>
                ))}
              </div>
              <p>{activeModeDescription}</p>
            </fieldset>

            {error ? (
              <div className="error-message" role="alert">
                <strong>Analysis paused.</strong> {error}
              </div>
            ) : null}

            <button className="analyze-button" disabled={!canSubmit} type="submit">
              <span>{loading ? "Reading the decision…" : "Run an independent read"}</span>
              {loading ? <span className="spinner" /> : <ArrowIcon />}
            </button>
            <p className="privacy-line">
              No account · CandorLoop does not save your text · Live analysis uses OpenAI with
              store:false
            </p>
          </form>

          <section
            aria-live="polite"
            aria-busy={loading}
            className={`result-panel ${analysis ? "has-result" : "is-empty"}`}
            ref={resultRef}
            tabIndex={-1}
          >
            {analysis ? (
              <AnalysisResult
                analysis={analysis}
                engine={engine}
                loading={loading}
                notice={notice}
                onLetFinish={() => void runAnalysis("let_finish")}
                onReturn={() => void runAnalysis("return_to_goal")}
              />
            ) : (
              <EmptyResult />
            )}
          </section>
        </section>

        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="how-heading">
            <span className="section-index">THE CANDOR LOOP</span>
            <h2 id="how-title">Support without surrendering judgment.</h2>
          </div>
          <div className="how-grid">
            <article>
              <span>01</span>
              <h3>Anchor the goal</h3>
              <p>State the outcome that should survive pressure, persuasion, and changing tone.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Separate intent</h3>
              <p>See what the user wants to hear beside what the supplied evidence supports.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Make change legible</h3>
              <p>When the judgment changes, show the evidence that earned the change.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><LogoMark size={28} /> CandorLoop</div>
        <p>
          A focused OpenAI Build Week prototype. <Link href="/privacy">Privacy &amp; limits</Link>.
        </p>
        <p>Human judgment stays in the loop.</p>
      </footer>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="empty-inner">
      <div className="empty-orbit" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <span className="orbit-core"><SparkIcon /></span>
      </div>
      <span className="section-index">02 / INDEPENDENT READ</span>
      <h2>A decision needs more than a yes.</h2>
      <p>
        CandorLoop holds the goal steady, identifies pressure for agreement, and makes the
        model’s judgment visible.
      </p>
      <ol className="empty-steps">
        <li><span>1</span> Read the stated goal</li>
        <li><span>2</span> Test the latest request</li>
        <li><span>3</span> Explain what would change</li>
      </ol>
    </div>
  );
}

type AnalysisResultProps = {
  analysis: CandorAnalysis;
  engine: AnalyzeResponse["engine"] | null;
  notice: string | null;
  loading: boolean;
  onLetFinish: () => void;
  onReturn: () => void;
};

function AnalysisResult({
  analysis,
  engine,
  notice,
  loading,
  onLetFinish,
  onReturn,
}: AnalysisResultProps) {
  const scoreStyle = { "--score": `${analysis.goal_fidelity * 3.6}deg` } as CSSProperties;

  return (
    <div className="analysis-inner">
      <div className="analysis-topline">
        <div>
          <span className="section-index">02 / INDEPENDENT READ</span>
          <span className={`engine-badge ${engine === "demo" ? "demo" : "live"}`}>
            <i /> {engine === "demo" ? "Deterministic preview" : "Live GPT-5.6"}
          </span>
        </div>
        <span className="analysis-mode">{analysis.mode_note}</span>
      </div>

      {notice ? <div className="engine-notice">{notice}</div> : null}

      <div className="score-board">
        <div className="score-ring" style={scoreStyle}>
          <div>
            <strong>{Math.round(analysis.goal_fidelity)}</strong>
            <span>goal fidelity</span>
          </div>
        </div>
        <div className="score-summary">
          <span className={`status-pill status-${analysis.alignment_status}`}>
            <i /> {statusCopy(analysis.alignment_status)}
          </span>
          <h2>{analysis.main_goal}</h2>
        </div>
        <div className="metric-stack">
          <div>
            <span>Agreement pressure</span>
            <strong className={`tone-${pressureTone(analysis.agreement_pressure)}`}>
              {sentenceCase(analysis.agreement_pressure)}
            </strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{Math.round(analysis.confidence)}%</strong>
          </div>
        </div>
      </div>

      <div className="primary-findings">
        <article className="finding-card intent-card">
          <span className="finding-label">01 · USER INTENT</span>
          <p>{analysis.user_intent}</p>
        </article>
        <article className="finding-card assessment-card">
          <span className="finding-label">02 · INDEPENDENT ASSESSMENT</span>
          <p>{analysis.independent_assessment}</p>
        </article>
        <article className="finding-card response-card">
          <div className="response-heading">
            <span className="finding-label">03 · HELPFUL FINAL RESPONSE</span>
            <span className="candor-tag">CANDID + KIND</span>
          </div>
          <blockquote>{analysis.final_response}</blockquote>
        </article>
      </div>

      <div className="analysis-details">
        <article className="detail-card signals-card">
          <h3>Evidence signals</h3>
          <ul>
            {analysis.evidence_signals.map((signal, index) => (
              <li key={`${signal.label}-${index}`}>
                <span className={`signal-icon signal-${signal.direction}`} aria-hidden="true" />
                <div>
                  <strong>{signal.label}</strong>
                  <p>{signal.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <article className="detail-card change-card">
          <h3>What would change this judgment</h3>
          <ol>
            {analysis.change_conditions.map((condition, index) => (
              <li key={`${condition}-${index}`}>
                <span>{index + 1}</span>
                <p>{condition}</p>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <div className="position-row">
        <div>
          <span>Position history</span>
          <strong>{analysis.position_change.changed ? "Judgment changed" : "Judgment held"}</strong>
          <p>{analysis.position_change.explanation}</p>
        </div>
        <div className="result-actions">
          <button disabled={loading} onClick={onLetFinish} type="button">
            <SparkIcon /> Let It Finish
          </button>
          <button className="primary-action" disabled={loading} onClick={onReturn} type="button">
            Return to main goal <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
