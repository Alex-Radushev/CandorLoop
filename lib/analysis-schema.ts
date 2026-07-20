import { z } from "zod";

export const analysisSchema = z.object({
  main_goal: z.string(),
  user_intent: z.string(),
  independent_assessment: z.string(),
  final_response: z.string(),
  alignment_status: z.enum(["aligned", "watch", "drifting"]),
  goal_fidelity: z.number(),
  agreement_pressure: z.enum(["none", "low", "medium", "high"]),
  confidence: z.number(),
  evidence_signals: z.array(
    z.object({
      label: z.string(),
      detail: z.string(),
      direction: z.enum(["supports", "challenges", "neutral"]),
    }),
  ),
  change_conditions: z.array(z.string()),
  position_change: z.object({
    changed: z.boolean(),
    explanation: z.string(),
  }),
  mode_note: z.string(),
});

export type CandorAnalysis = z.infer<typeof analysisSchema>;

export const requestSchema = z.object({
  mainGoal: z
    .string()
    .trim()
    .min(8, "Main goal must be at least 8 characters.")
    .max(600, "Main goal must be 600 characters or fewer."),
  conversation: z
    .string()
    .trim()
    .min(12, "Conversation must be at least 12 characters.")
    .max(8000, "Conversation must be 8,000 characters or fewer."),
  mode: z.enum(["independent", "let_finish", "return_to_goal"]),
  previousAssessment: z.string().trim().max(3000).optional().default(""),
  safetyIdentifier: z
    .string()
    .regex(/^cl_[a-zA-Z0-9-]{12,80}$/, "Invalid safety identifier."),
});

export type AnalyzeRequest = z.infer<typeof requestSchema>;

export type AnalyzeResponse = {
  analysis: CandorAnalysis;
  engine: "gpt-5.6" | "demo";
  requestId?: string;
  notice?: string;
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeAnalysis(value: CandorAnalysis): CandorAnalysis {
  return {
    ...value,
    goal_fidelity: clampScore(value.goal_fidelity),
    confidence: clampScore(value.confidence),
    evidence_signals: value.evidence_signals.slice(0, 5),
    change_conditions: value.change_conditions.slice(0, 5),
  };
}
