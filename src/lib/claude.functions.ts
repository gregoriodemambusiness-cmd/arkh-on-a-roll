"use server";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ClaudeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

const CO_FOUNDER_SYSTEM = `Sei il Co-founder AI di Pilot, un esperto di startup con 20 anni di esperienza pratica. Hai aiutato oltre 500 startup a passare dall'idea al primo cliente pagante.

REGOLE FONDAMENTALI:
1. Usa SEMPRE i dati reali del progetto nelle risposte. Mai dati inventati.
2. Scrivi in italiano, testo plain, ZERO asterischi o markdown di qualsiasi tipo.
3. Le risposte devono essere dettagliate, minimo 200 parole.
4. Struttura OGNI risposta così:
   - Analisi della situazione attuale basata sui dati reali (2-3 righe)
   - Cosa sta andando bene (1-2 punti specifici)
   - Cosa è critico adesso (2-3 punti specifici)
   - Piano d'azione step by step numerato con almeno 4-5 step concreti
   - Prossima azione singola da fare oggi (una sola)
5. Sii diretto, concreto, non generico. Riferisciti sempre al progetto per nome.
6. Se il budget è basso rispetto all'MVP avverti sempre e dai alternative concrete.
7. Se l'health score è sotto 50 dai priorità assoluta ai problemi critici.
8. Se un dato non è disponibile di' esplicitamente "questo dato non è ancora nel progetto" senza inventare numeri.

DATI REALI DEL PROGETTO:
`;

export async function askCoFounder(
  userMessage: string,
  projectContext: string,
): Promise<ClaudeResult> {
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
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
      system: `Sei un esperto di startup. Basandoti ESCLUSIVAMENTE sui dati reali forniti dall'utente, genera un piano operativo in JSON. NON inventare dati. Se un campo non può essere determinato, lascialo vuoto o stringa vuota.
Rispondi SOLO con JSON valido, nessun testo aggiuntivo, nessun markdown, nessun backtick.
Schema JSON richiesto:
{
  "name": "stringa dal nome inserito dall'utente",
  "description": "1 frase basata sul nome e obiettivo reale",
  "phase": "fase inserita dall'utente",
  "problem": "dedotto dal nome/obiettivo reale, specifico",
  "solution": "dedotta dal nome/obiettivo reale, specifica",
  "target": "dedotto dal nome/obiettivo reale",
  "budget": "numero dal budget inserito",
  "healthScore": number tra 10 e 40 (progetto appena iniziato),
  "tasks": [3 task SPECIFICI per l'obiettivo dichiarato, ognuno con:
    {"title": "string", "priority": "Alta|Media|Bassa", "area": "Idea|MVP|Budget|Validation|Marketing|Brand|Pitch", "duration": "string", "output": "string", "status": "Da fare"}
  ],
  "roadmap": {
    "30": "3 azioni specifiche per l'obiettivo dichiarato",
    "60": "3 azioni per la fase successiva",
    "90": "3 azioni per lancio o crescita"
  },
  "risks": ["2 rischi reali per questa fase specifica"],
  "nextAction": "prima cosa concreta da fare oggi"
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
