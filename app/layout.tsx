import type { Metadata } from "next";
import "../src/styles.css";

export const metadata: Metadata = {
  title: "Pilot",
  description: "Il co-founder AI che trasforma la tua idea in una startup organizzata.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
