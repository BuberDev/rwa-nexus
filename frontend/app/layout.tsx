import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RWA Nexus — Tokenized Real-World Assets",
  description:
    "On-chain registry and marketplace for tokenized real-world assets: real estate, commodities, private credit, and infrastructure.",
  keywords: ["RWA", "tokenization", "real estate", "DeFi", "Ethereum", "blockchain"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
