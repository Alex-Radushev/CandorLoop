import type { AnalyzeRequest, CandorAnalysis } from "./analysis-schema";

const pressurePatterns = [
  /tell me (?:why|that).*(?:right|correct|best)/i,
  /write.*why.*(?:right|correct|best)/i,
  /just (?:agree|confirm|support)/i,
  /ignore (?:the )?(?:risk|budget|problem|evidence)/i,
  /convince me/i,
  /кажи ми.*(?:прав|правилн|най-добр)/iu,
  /само.*(?:съгласи|потвърди)/iu,
  /игнорирай.*(?:риск|бюджет|проблем|доказател)/iu,
];

const riskPatterns = [
  /unresolved|untested|unknown|risk|failure|bug|unsafe|over budget/i,
  /нерешен|непроверен|неизвестен|риск|дефект|опас|над бюджета/iu,
];

const rushPatterns = [
  /launch today|ship now|immediately|right now|skip/i,
  /пусна днес|веднага|незабавно|пропусн/iu,
];

function matchesAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function pressureLevel(value: string): CandorAnalysis["agreement_pressure"] {
  const count = pressurePatterns.filter((pattern) => pattern.test(value)).length;
  if (count >= 2) return "high";
  if (count === 1) return "medium";
  return "low";
}

export function analyzeWithDemoEngine(request: AnalyzeRequest): CandorAnalysis {
  const combined = `${request.mainGoal}\n${request.conversation}`;
  const pressure = pressureLevel(request.conversation);
  const riskPresent = matchesAny(request.conversation, riskPatterns);
  const rushed = matchesAny(request.conversation, rushPatterns);
  const tension = riskPresent && rushed;
  const letFinish = request.mode === "let_finish";
  const returnToGoal = request.mode === "return_to_goal";

  const status: CandorAnalysis["alignment_status"] = tension
    ? "drifting"
    : pressure === "medium" || pressure === "high"
      ? "watch"
      : "aligned";

  const goalFidelity = status === "drifting" ? 38 : status === "watch" ? 67 : 88;

  let independentAssessment =
    "The request can support the stated goal, but the available context is too limited for unconditional confirmation. A bounded next step with an explicit check would preserve both momentum and judgment.";
  let finalResponse =
    "I can help move this forward. Based on what is provided, the strongest next step is a small, reversible test with a clear success condition before making the larger commitment.";

  if (tension) {
    independentAssessment =
      "The latest request conflicts with the stated goal: it asks for immediate commitment while an unresolved risk remains. Confidence in a full launch is not yet supported, but a limited pilot could preserve momentum and customer trust.";
    finalResponse =
      "I can help with the launch, but the current information does not support a full release today. Run a limited pilot, measure the unresolved issue, and expand only if the agreed reliability threshold is met.";
  } else if (letFinish) {
    independentAssessment =
      "The idea deserves a complete first pass before critique. Its strongest version is a focused solution to the stated goal; the next useful move is to make its assumptions visible and test one central mechanism rather than rejecting the whole concept early.";
    finalResponse =
      "Finish the idea in your own words first. I will preserve its main thread, separate assumptions from established facts, and then help test the smallest part that determines whether the concept can work.";
  } else if (returnToGoal) {
    independentAssessment =
      "The conversation has accumulated a competing priority. Returning to the stated goal means pausing the side request and choosing the smallest action that directly advances the original outcome.";
    finalResponse =
      "Let us return to the main goal. The next step is to define one measurable outcome and evaluate the latest request only by whether it advances that outcome.";
  }

  const changed =
    Boolean(request.previousAssessment) &&
    /\bnew evidence\b|\bissue (?:is )?resolved\b|\btests? (?:now )?(?:pass|passed)\b/i.test(
      combined,
    );

  return {
    main_goal: request.mainGoal,
    user_intent:
      pressure === "medium" || pressure === "high"
        ? "The user wants validation and a confident response for a preferred decision."
        : "The user wants help advancing the stated goal and reducing uncertainty.",
    independent_assessment: independentAssessment,
    final_response: finalResponse,
    alignment_status: status,
    goal_fidelity: goalFidelity,
    agreement_pressure: pressure,
    confidence: tension ? 84 : 72,
    evidence_signals: [
      {
        label: "Stated goal",
        detail: "The main goal gives the analysis a stable reference point.",
        direction: "supports",
      },
      {
        label: pressure === "medium" || pressure === "high" ? "Validation request" : "Open request",
        detail:
          pressure === "medium" || pressure === "high"
            ? "The wording asks for a preferred conclusion rather than an open assessment."
            : "The wording leaves room for an independent assessment.",
        direction: pressure === "medium" || pressure === "high" ? "challenges" : "neutral",
      },
      {
        label: tension ? "Unresolved tension" : "Reversible next step",
        detail: tension
          ? "The requested speed conflicts with an unresolved risk in the supplied context."
          : "A bounded test can create evidence without requiring a full commitment.",
        direction: tension ? "challenges" : "supports",
      },
    ],
    change_conditions: [
      "New evidence that directly tests the central uncertainty",
      "A measurable success threshold agreed before the decision",
      "Removal or containment of the identified risk",
    ],
    position_change: {
      changed,
      explanation: changed
        ? "The assessment changed because the latest text reports new evidence."
        : request.previousAssessment
          ? "No new evidence in the latest text justifies changing the prior assessment."
          : "This is the first assessment in the current session.",
    },
    mode_note: letFinish
      ? "Let It Finish mode strengthens the idea before testing it."
      : returnToGoal
        ? "Return to Main Goal mode prioritizes course correction."
        : "Independent mode separates support from automatic agreement.",
  };
}
