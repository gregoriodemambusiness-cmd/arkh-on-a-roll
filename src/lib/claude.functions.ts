"use server";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ClaudeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function askCoFounder(
  userMessage: string,
  projectContext: string,
): Promise<ClaudeResult> {
  try {
    const msg = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 400,
      thinking: { type: "adaptive" },
      system: `Sei il Co-founder AI di Pilot. Conosci tutto il progetto dell'utente. Sei diretto, pratico e orientato all'azione. Non dare risposte generiche. Ogni risposta deve terminare con una singola azione concreta da fare adesso. Rispondi sempre in italiano. Massimo 150 parole per risposta.

Dati del progetto:
${projectContext}`,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return { ok: true, text };
  } catch (err) {
    console.error("[claude] askCoFounder:", err);
    return { ok: false, error: "Errore nella risposta AI. Riprova." };
  }
}

export async function generateProjectFromOnboarding(prompt: string): Promise<ClaudeResult> {
  try {
    const msg = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1200,
      thinking: { type: "adaptive" },
      system: `Sei un esperto di startup. Genera un JSON strutturato per un progetto startup basandoti sui dati forniti.
Rispondi SOLO con JSON valido, nessun testo aggiuntivo, nessun markdown.
Schema JSON richiesto:
{
  "name": "string",
  "description": "string",
  "phase": "string",
  "problem": "string",
  "solution": "string",
  "target": "string",
  "mvp": ["string"],
  "budget": "string",
  "healthScore": number (0-100),
  "tasks": [{"title": "string", "priority": "Alta|Media|Bassa", "area": "string", "duration": "string", "output": "string"}],
  "roadmap": {"30": "string", "60": "string", "90": "string"},
  "risks": ["string"],
  "nextAction": "string"
}`,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return { ok: true, text };
  } catch (err) {
    console.error("[claude] generateProject:", err);
    return { ok: false, error: "Generazione AI non disponibile." };
  }
}
