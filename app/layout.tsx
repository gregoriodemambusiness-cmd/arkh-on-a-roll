import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "../src/styles.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pilot",
  description: "Il co-founder AI che trasforma la tua idea in una startup organizzata.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${orbitron.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
