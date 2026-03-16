import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillScope — AI Agent Skill Evaluation",
  description: "Evaluate, score, and attest AI agent skill quality onchain on Base.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans">
        {/* Animated mesh background */}
        <div className="mesh-bg" aria-hidden="true">
          <div
            className="mesh-blob"
            style={{
              width: "600px",
              height: "600px",
              top: "-10%",
              left: "-5%",
              background: "hsl(263, 70%, 50%)",
            }}
          />
          <div
            className="mesh-blob"
            style={{
              width: "500px",
              height: "500px",
              bottom: "-15%",
              right: "-5%",
              background: "hsl(187, 92%, 45%)",
              animationDelay: "-7s",
            }}
          />
          <div
            className="mesh-blob"
            style={{
              width: "400px",
              height: "400px",
              top: "40%",
              left: "30%",
              background: "hsl(280, 60%, 40%)",
              animationDelay: "-14s",
            }}
          />
        </div>

        <Sidebar />
        <main className="ml-64 min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
