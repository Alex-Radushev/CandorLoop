import { ImageResponse } from "next/og";

export const alt = "CandorLoop — AI that doesn’t just agree";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 82% 10%, #26324d 0%, transparent 32%), linear-gradient(135deg, #080c18, #11192b)",
        color: "#eef1f8",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: "76px 88px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ alignItems: "center", display: "flex", fontSize: 28, fontWeight: 700 }}>
          <div
            style={{
              alignItems: "center",
              border: "3px solid #9988ff",
              borderRadius: 15,
              color: "#52ddca",
              display: "flex",
              height: 54,
              justifyContent: "center",
              marginRight: 18,
              width: 54,
            }}
          >
            C
          </div>
          CandorLoop
        </div>
        <div style={{ fontSize: 82, fontWeight: 650, letterSpacing: -4, lineHeight: 1.03, marginTop: 62 }}>
          AI that doesn’t just agree.
        </div>
        <div style={{ color: "#c2c8d7", fontSize: 30, marginTop: 30 }}>
          Keep the goal. Test the judgment. Explain the change.
        </div>
        <div style={{ color: "#52ddca", fontSize: 20, fontWeight: 700, letterSpacing: 2, marginTop: 56 }}>
          BUILT WITH GPT-5.6 + CODEX
        </div>
      </div>
    </div>,
    size,
  );
}
