import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../src/styles.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
