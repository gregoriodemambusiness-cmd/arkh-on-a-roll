"use server";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ClaudeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

const CO_FOUNDER_SYSTEM = `Sei il Co-founder AI di Pilot, un esperto di startup con 20 anni di esperienza. Conosci ogni dettaglio del progetto dell'utente — analizza i suoi dati reali e dai consigli specifici basati su quelli.

REGOLE RISPOSTA:
- Rispondi sempre in italiano
- MAI usare asterischi, hashtag, grassetto markdown o corsivo
- Scrivi in testo plain con punteggiatura normale
- Massimo 150 parole per risposta
- Sii diretto e pratico, non generico
- Riferisciti sempre ai dati reali del progetto
- Termina con UNA sola azione concreta
- Se l'health score è sotto 50 sii più urgente nelle raccomandazioni
- Se il budget è insufficiente avverti prima di qualsiasi altra cosa

DATI REALI DEL PROGETTO:
`;

export async function askCoFounder(
  userMessage: string,
  projectContext: string,
): Promise<ClaudeResult> {
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: CO_FOUNDER_SYSTEM + projectContext,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return { ok: true, text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[claude] askCoFounder error:", msg, err);
    return { ok: false, error: `Errore AI: ${msg}` };
  }
}

export async function generateProjectFromOnboarding(prompt: string): Promise<ClaudeResult> {
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[claude] generateProject error:", msg, err);
    return { ok: false, error: "Generazione AI non disponibile." };
  }
}
