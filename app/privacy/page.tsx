import type { Metadata } from "next";
import Link from "next/link";

import { LogoMark } from "@/components/LogoMark";

export const metadata: Metadata = {
  title: "Privacy & limits — CandorLoop",
  description: "How the CandorLoop Build Week prototype handles text and model requests.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <nav className="legal-nav" aria-label="Privacy page navigation">
        <Link className="brand" href="/" aria-label="CandorLoop home">
          <LogoMark />
          <span>CandorLoop</span>
        </Link>
        <Link className="legal-back" href="/">
          ← Back to the app
        </Link>
      </nav>

      <article className="legal-content">
        <span className="section-index">BUILD WEEK PROTOTYPE</span>
        <h1>Privacy &amp; limits</h1>
        <p className="legal-lead">
          CandorLoop is designed to make its data path understandable. It does not promise
          absolute confidentiality, and it should not be used for secrets or emergency decisions.
        </p>

        <section>
          <h2>What the app sends</h2>
          <p>
            When you press the analysis button, the main goal, conversation text, selected mode,
            and prior assessment are sent to the CandorLoop server. When live analysis is
            configured, the server sends that material to the OpenAI Responses API.
          </p>
        </section>

        <section>
          <h2>What CandorLoop stores</h2>
          <ul>
            <li>The prototype has no user accounts, analytics product, or application database.</li>
            <li>Your goal and conversation are held in the page state and are not saved by the app.</li>
            <li>
              A random, non-identifying safety identifier can be stored in your browser; it does
              not contain your text, name, email, or device location.
            </li>
          </ul>
        </section>

        <section>
          <h2>OpenAI processing</h2>
          <p>
            Live model calls use <code>store: false</code>, so CandorLoop does not create a stored
            Responses API object. OpenAI’s applicable API data controls and infrastructure-level
            processing still apply. Do not enter passwords, trade secrets, patent details, health
            records, or other highly sensitive information.
          </p>
        </section>

        <section>
          <h2>Live versus preview</h2>
          <p>
            Results are labeled <strong>Live GPT-5.6</strong> when the model completes the analysis.
            If no API key is configured or the live service is temporarily unavailable, the app
            uses a deterministic preview and labels it clearly.
          </p>
        </section>

        <section>
          <h2>Decision limits</h2>
          <p>
            CandorLoop evaluates only the text you provide. It does not independently verify facts,
            and its scores are not objective truth or calibrated probabilities. It is not medical,
            legal, financial, or safety advice. Use qualified professional help for high-stakes
            decisions and emergency services for urgent danger.
          </p>
        </section>
      </article>
    </main>
  );
}
