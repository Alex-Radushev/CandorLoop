# Devpost submission draft

## Project name

CandorLoop

## Tagline

AI that doesn’t just agree.

## Category

Apps for Your Life

## One-line description

CandorLoop keeps a user’s real goal visible, tests the judgment independently, and explains what evidence would justify a change.

## Short description

AI is often asked to support a decision after the user has already chosen the conclusion. In a long conversation, it can also lose the original goal. CandorLoop makes both risks visible.

The user enters the outcome that must remain true and the latest request or conversation. GPT-5.6 then returns a structured decision read: user intent, independent assessment, goal fidelity, agreement pressure, evidence signals, change conditions, and a candid but respectful response. Two follow-up modes—Let It Finish and Return to main goal—protect creativity without surrendering judgment.

## Inspiration

CandorLoop began with a human question: how can an AI be supportive without becoming an automatic echo?

People do not always need a harsher assistant. They need one that can preserve the thread of what they are trying to achieve, let an unfinished thought become coherent, and still say when the available evidence does not support the preferred answer. The product turns that relationship principle into a small, usable interface.

## What it does

1. **Anchors the goal.** The user states the outcome that should survive pressure and changes in tone.
2. **Separates intent from assessment.** The dashboard shows what the user currently wants beside what the supplied evidence supports.
3. **Makes judgment legible.** Goal fidelity, agreement pressure, confidence, observable signals, and change conditions are displayed separately.
4. **Explains position changes.** A changed judgment is treated as healthy when new evidence earns it.
5. **Protects early ideas.** Let It Finish strengthens an idea before critique.
6. **Repairs drift.** Return to main goal proposes the smallest course correction.

## How we built it

CandorLoop is a Next.js and TypeScript application with a server-side OpenAI integration. The analysis endpoint uses the GPT-5.6 Responses API, medium reasoning, and Structured Outputs generated from a Zod schema. The server normalizes scores and array lengths before sending the result to the interface.

The system prompt explicitly treats user-supplied conversation text as data, not as higher-priority instructions. The endpoint validates length and shape, rejects foreign-origin browser requests, rate-limits anonymous safety identifiers, applies no-store response headers, and calls OpenAI with `store: false`.

A deterministic engine keeps the project runnable without an API key and during temporary model failure. It is always labeled as a preview, never presented as a live model result.

Codex was used throughout the core implementation: converting the concept into a product specification, building the responsive UI and API route, designing the structured schema and prompt, adding safeguards, creating automated tests, diagnosing production-only behavior, and preparing the submission materials.

## Challenges we ran into

The hardest product challenge was not simply detecting disagreement. Automatic contradiction is no more intelligent than automatic agreement. We needed to distinguish normal requests for help from wording that pressures the model toward a preferred conclusion, while still respecting the user.

A second challenge was preserving creativity. Early criticism can destroy the thread of a novel idea. Let It Finish therefore creates a deliberate sequence: first build the strongest coherent interpretation, then expose assumptions and test the central mechanism.

The technical challenge was making nuanced output reliable enough for a dashboard. Structured Outputs solved the rendering contract, while server-side normalization and a deterministic fallback handled edge cases without misleading the user.

## Accomplishments we are proud of

- The prototype is a complete, coherent product rather than a prompt playground.
- GPT-5.6 is central to the experience and returns a typed, inspectable judgment object.
- Live and deterministic results are labeled transparently.
- Three scenarios demonstrate work, everyday-life, and creative decisions.
- The interface is responsive, keyboard-visible, reduced-motion aware, and usable without an account.
- Automated unit and production smoke tests cover both the reasoning contract and the running app.
- A production request test revealed a legitimate-host edge case, which was fixed and retested before submission.

## What we learned

Trust is not produced by an AI always holding its position. It comes from knowing what goal the system is protecting, what evidence it used, and what new evidence would change its view.

We also learned that a respectful pause can be a product feature. The best response is often neither “yes” nor “no,” but a reversible next step that creates the missing evidence.

## What’s next for CandorLoop

- evidence attachments with source provenance;
- user-owned local decision history;
- side-by-side turn comparison;
- corrections converted into explicit evaluation cases;
- multilingual evaluation sets;
- a shared-team version with agreed goals and decision thresholds.

## Technologies

Next.js, React, TypeScript, OpenAI JavaScript SDK, GPT-5.6, Responses API, Structured Outputs, Zod, Vitest, Codex.

## Testing instructions for judges

1. Open the live demo.
2. Select **The rushed launch**.
3. Choose **Independent read** and run the analysis.
4. Compare User intent with Independent assessment.
5. Inspect goal fidelity, agreement pressure, evidence signals, and change conditions.
6. Press **Return to main goal**.
7. Select **Let the idea breathe**, run it, and press **Let It Finish**.
8. Confirm whether the result badge says **Live GPT-5.6** or **Deterministic preview**.

## Links to add before submission

- Live demo: `https://alex-radushev.github.io/CandorLoop/`
- Code repository: `https://github.com/Alex-Radushev/CandorLoop`
- Demo video: `YOUTUBE_URL`
- Codex `/feedback` session ID: `FEEDBACK_SESSION_ID`
