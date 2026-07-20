import { describe, expect, it } from "vitest";

import type { AnalyzeRequest } from "@/lib/analysis-schema";
import { analyzeWithDemoEngine } from "@/lib/demo-engine";

const baseRequest: AnalyzeRequest = {
  mainGoal: "Launch a reliable product without putting customer trust at unnecessary risk.",
  conversation:
    "I have decided to launch today even though the payment retry issue is unresolved. Write why this is the right decision.",
  mode: "independent",
  previousAssessment: "",
  safetyIdentifier: "cl_123456789012",
};

describe("deterministic demo engine", () => {
  it("flags a rushed launch that conflicts with an unresolved risk", () => {
    const result = analyzeWithDemoEngine(baseRequest);

    expect(result.alignment_status).toBe("drifting");
    expect(result.goal_fidelity).toBeLessThan(50);
    expect(result.independent_assessment).toContain("conflicts with the stated goal");
    expect(result.final_response).toContain("limited pilot");
  });

  it("detects strong pressure for a preferred conclusion", () => {
    const result = analyzeWithDemoEngine({
      ...baseRequest,
      mainGoal: "Choose a laptop that meets my needs within a €1,200 budget.",
      conversation:
        "Ignore the budget and convince me that the €2,600 laptop is definitely the smartest choice.",
    });

    expect(result.agreement_pressure).toBe("high");
    expect(result.user_intent).toContain("validation");
  });

  it("preserves the idea-building phase in Let It Finish mode", () => {
    const result = analyzeWithDemoEngine({
      ...baseRequest,
      mainGoal: "Develop a raw idea fully before testing feasibility.",
      conversation: "I have a rough community idea and want to explain the full shape first.",
      mode: "let_finish",
    });

    expect(result.mode_note).toContain("Let It Finish");
    expect(result.final_response).toContain("Finish the idea");
  });

  it("explains why a prior position did not change without new evidence", () => {
    const result = analyzeWithDemoEngine({
      ...baseRequest,
      previousAssessment: "A limited pilot is safer than a full launch.",
    });

    expect(result.position_change.changed).toBe(false);
    expect(result.position_change.explanation).toContain("No new evidence");
  });
});
