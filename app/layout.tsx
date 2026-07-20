import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "CandorLoop — AI that doesn’t just agree",
  description:
    "Keep the goal. Test the judgment. Explain the change. A GPT-5.6 reasoning companion built for OpenAI Build Week.",
  applicationName: "CandorLoop",
  keywords: ["AI", "judgment", "goal drift", "GPT-5.6", "Codex"],
  openGraph: {
    title: "CandorLoop — AI that doesn’t just agree",
    description: "Keep the goal. Test the judgment. Explain the change.",
    siteName: "CandorLoop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CandorLoop — AI that doesn’t just agree",
    description: "Keep the goal. Test the judgment. Explain the change.",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0B1020",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
