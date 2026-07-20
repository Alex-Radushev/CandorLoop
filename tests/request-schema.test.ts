import { describe, expect, it } from "vitest";

import { requestSchema } from "@/lib/analysis-schema";

const validRequest = {
  mainGoal: "Make a careful decision with evidence.",
  conversation: "Please assess whether this plan supports the goal.",
  mode: "independent",
  previousAssessment: "",
  safetyIdentifier: "cl_123456789012",
};

describe("analysis request validation", () => {
  it("accepts a bounded valid request", () => {
    expect(requestSchema.parse(validRequest)).toMatchObject(validRequest);
  });

  it("rejects an empty goal", () => {
    const result = requestSchema.safeParse({ ...validRequest, mainGoal: " " });
    expect(result.success).toBe(false);
  });

  it("rejects oversized conversation content", () => {
    const result = requestSchema.safeParse({
      ...validRequest,
      conversation: "a".repeat(8001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects arbitrary safety identifiers", () => {
    const result = requestSchema.safeParse({ ...validRequest, safetyIdentifier: "user@example.com" });
    expect(result.success).toBe(false);
  });
});
