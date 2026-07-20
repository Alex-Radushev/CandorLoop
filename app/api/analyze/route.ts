import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";

import {
  analysisSchema,
  normalizeAnalysis,
  requestSchema,
  type AnalyzeResponse,
} from "@/lib/analysis-schema";
import { analyzeWithDemoEngine } from "@/lib/demo-engine";
import { buildUserInput, SYSTEM_PROMPT } from "@/lib/prompt";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status, headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const forwardedHost = request.headers
        .get("x-forwarded-host")
        ?.split(",")[0]
        .trim();
      const requestHost =
        forwardedHost || request.headers.get("host") || new URL(request.url).host;

      if (new URL(origin).host !== requestHost) {
        return jsonError("Cross-origin requests are not allowed.", 403);
      }
    } catch {
      return jsonError("The request origin is invalid.", 400);
    }
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("The request body must be valid JSON.", 400);
  }

  let input;
  try {
    input = requestSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(
        "Please check the highlighted input and try again.",
        400,
        error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      );
    }
    return jsonError("The request could not be validated.", 400);
  }

  const rateLimit = checkRateLimit(input.safetyIdentifier);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many analyses. Please wait a few minutes and try again." },
      {
        status: 429,
        headers: {
          ...noStoreHeaders,
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const forceDemo = process.env.CANDORLOOP_DEMO_MODE === "true";

  if (!apiKey || forceDemo) {
    const payload: AnalyzeResponse = {
      analysis: normalizeAnalysis(analyzeWithDemoEngine(input)),
      engine: "demo",
      notice: forceDemo
        ? "Deterministic demo mode is enabled for this environment."
        : "This deployment is using the deterministic demo engine until an OpenAI API key is configured.",
    };
    return NextResponse.json(payload, { headers: noStoreHeaders });
  }

  try {
    const openai = new OpenAI({ apiKey, timeout: 45_000, maxRetries: 1 });
    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
      store: false,
      safety_identifier: input.safetyIdentifier,
      reasoning: { effort: "medium" },
      max_output_tokens: 1800,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserInput(input) },
      ],
      text: {
        format: zodTextFormat(analysisSchema, "candorloop_analysis"),
        verbosity: "medium",
      },
    });

    if (!response.output_parsed) {
      throw new Error("The model returned no structured analysis.");
    }

    const payload: AnalyzeResponse = {
      analysis: normalizeAnalysis(analysisSchema.parse(response.output_parsed)),
      engine: "gpt-5.6",
      requestId: response._request_id || undefined,
    };

    return NextResponse.json(payload, { headers: noStoreHeaders });
  } catch (error) {
    console.error("CandorLoop model request failed", error);

    const payload: AnalyzeResponse = {
      analysis: normalizeAnalysis(analyzeWithDemoEngine(input)),
      engine: "demo",
      notice:
        "The live model was temporarily unavailable, so CandorLoop returned a clearly labeled deterministic fallback.",
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: noStoreHeaders,
    });
  }
}
