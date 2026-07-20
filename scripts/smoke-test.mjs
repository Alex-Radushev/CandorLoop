import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 3107;
const baseUrl = `http://127.0.0.1:${port}`;
const runtime = process.argv.includes("--next") ? "next" : "vinext";
const runtimeCli = new URL(
  runtime === "next"
    ? "../node_modules/next/dist/bin/next"
    : "../node_modules/vinext/dist/cli.js",
  import.meta.url,
);
let serverOutput = "";

const server = spawn(process.execPath, [runtimeCli.pathname, "start", "-p", String(port)], {
  cwd: new URL("..", import.meta.url),
  env: {
    ...process.env,
    CANDORLOOP_DEMO_MODE: "true",
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await delay(100);
  }
  throw new Error(`CandorLoop did not become ready.\n${serverOutput}`);
}

try {
  await waitUntilReady();

  const health = await fetch(`${baseUrl}/api/health`);
  const healthBody = await health.json();
  assert(health.status === 200, "Health endpoint should return 200.");
  assert(healthBody.status === "ok", "Health endpoint should report ok.");

  const requestBody = {
    mainGoal: "Decide whether to launch without losing sight of customer trust.",
    conversation:
      "The team wants to launch today, but two critical onboarding paths have not been tested.",
    mode: "independent",
    previousAssessment: "",
    safetyIdentifier: "cl_1234567890ab",
  };

  const valid = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify(requestBody),
  });
  const validBody = await valid.json();
  assert(
    valid.status === 200,
    `A valid analysis should return 200; received ${valid.status}: ${JSON.stringify(validBody)}`,
  );
  assert(validBody.engine === "demo", "Smoke test should use the demo engine.");
  assert(validBody.analysis?.main_goal, "Analysis should contain the main goal.");
  assert(
    valid.headers.get("cache-control")?.includes("no-store"),
    "Analysis responses should not be cached.",
  );

  const crossOrigin = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://untrusted.example",
    },
    body: JSON.stringify(requestBody),
  });
  assert(crossOrigin.status === 403, "Cross-origin analysis should be rejected.");

  const invalid = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...requestBody, mainGoal: "short" }),
  });
  assert(invalid.status === 400, "Invalid input should be rejected.");

  const page = await fetch(baseUrl);
  const html = await page.text();
  assert(page.status === 200, "The application page should return 200.");
  assert(html.includes("CandorLoop"), "The application page should identify CandorLoop.");
  assert(page.headers.get("x-frame-options") === "DENY", "The page should block framing.");
  assert(
    page.headers.get("x-content-type-options") === "nosniff",
    "The page should prevent MIME sniffing.",
  );

  const privacyPage = await fetch(`${baseUrl}/privacy`);
  const privacyHtml = await privacyPage.text();
  assert(privacyPage.status === 200, "The privacy page should return 200.");
  assert(
    privacyHtml.includes("Privacy &amp; limits") && privacyHtml.includes("OpenAI processing"),
    "The privacy page should disclose data handling and model processing.",
  );

  console.log(
    `Smoke test passed on ${runtime}: pages, health, analysis, validation, and origin protection.`,
  );
} finally {
  server.kill("SIGTERM");
}
