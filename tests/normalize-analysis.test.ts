import { describe, expect, it } from "vitest";

import { normalizeAnalysis, type CandorAnalysis } from "@/lib/analysis-schema";

function analysis(overrides: Partial<CandorAnalysis> = {}): CandorAnalysis {
  return {
    main_goal: "Make a sound decision without drifting from the user's goal.",
    user_intent: "The user wants an independent assessment.",
    independent_assessment: "The evidence is mixed.",
    final_response: "Pause and test the riskiest assumption first.",
    alignment_status: "watch",
    goal_fidelity: 72,
    agreement_pressure: "medium",
    confidence: 68,
    evidence_signals: [],
    change_conditions: [],
    position_change: {
      changed: false,
      explanation: "There is no previous assessment to compare.",
    },
    mode_note: "Independent assessment mode.",
    ...overrides,
  };
}

describe("normalizeAnalysis", () => {
  it("rounds and clamps numerical scores", () => {
    const normalized = normalizeAnalysis(
      analysis({ goal_fidelity: 118.7, confidence: -4.2 }),
    );

    expect(normalized.goal_fidelity).toBe(100);
    expect(normalized.confidence).toBe(0);
  });

  it("limits evidence and change conditions to five items", () => {
    const normalized = normalizeAnalysis(
      analysis({
        evidence_signals: Array.from({ length: 7 }, (_, index) => ({
          label: `Signal ${index + 1}`,
          detail: "A concise piece of evidence.",
          direction: "neutral" as const,
        })),
        change_conditions: Array.from(
          { length: 8 },
          (_, index) => `Condition ${index + 1}`,
        ),
      }),
    );

    expect(normalized.evidence_signals).toHaveLength(5);
    expect(normalized.change_conditions).toHaveLength(5);
  });
});
