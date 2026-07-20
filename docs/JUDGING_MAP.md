# Judging map

| Build Week criterion | CandorLoop evidence |
|---|---|
| **Technological implementation** | Server-side GPT-5.6 Responses API; Zod-backed Structured Outputs; defensive prompt boundary; score normalization; validation; rate limiting; no-store behavior; deterministic fallback; unit and production smoke tests. |
| **Design** | Complete responsive flow from scenario to action; clear live/preview badge; compact dashboard; visible focus; reduced-motion support; meaningful empty, loading, error, and result states. |
| **Potential impact** | Addresses automatic agreement and goal drift in everyday decisions while preserving human agency; applicable to purchases, work choices, creative thinking, and longer AI conversations. |
| **Quality of the idea** | Goes beyond a generic “devil’s advocate” by combining a stable goal, intent/assessment separation, explicit change conditions, position history, Let It Finish, and Return to main goal. |

## Proof to show in the demo

1. A request that pressures the model to validate a risky choice.
2. The distinction between user intent and independent assessment.
3. Structured GPT-5.6 output rendered into goal fidelity, pressure, evidence, and change conditions.
4. Return to main goal as an interactive second pass.
5. Let It Finish as a creativity-preserving second pass.
6. The live-engine badge and a brief view of the repository/tests.

## Claims to avoid

- CandorLoop does not determine objective truth.
- Scores are not calibrated probabilities.
- The prototype does not independently fact-check the supplied text.
- `store: false` is not a claim that no infrastructure-level processing occurs.
- The deterministic preview is not GPT-5.6 and must remain clearly labeled.
