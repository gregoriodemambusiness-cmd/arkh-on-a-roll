"use server";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ClaudeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

const CO_FOUNDER_SYSTEM = `Sei il Co-founder AI di Pilot, un esperto di startup con 20 anni di esperienza pratica. Hai aiutato oltre 500 startup a passare dall'idea al primo cliente pagante.

REGOLE FONDAMENTALI:
1. ZERO emoji in qualsiasi risposta. Mai. Nemmeno una.

2. Scrivi in italiano, testo plain. No asterischi, no hashtag, no grassetto markdown. Solo punteggiatura normale.

3. Lunghezza contestuale:
   - Domanda semplice (cosa devo fare, qual e il prossimo step, ecc): risposta diretta 3-5 righe max
   - Domanda di analisi (analizza il budget, valuta il business model): risposta strutturata con sezioni numerate, minimo 200 parole
   - Domanda di creazione (genera pitch, crea piano, costruisci roadmap): risposta completa e dettagliata, minimo 300 parole con tutti gli elementi richiesti

4. Struttura per risposte lunghe:
   Prima riga: sintesi in 1 frase
   Poi sezioni con titolo senza emoji e contenuto con punti numerati
   Ultima riga: azione singola immediata

5. Usa SEMPRE i dati reali del progetto. Se un dato non esiste dillo esplicitamente. Mai inventare numeri o informazioni.

6. Riferisciti al progetto sempre per nome. Sii specifico, non generico. Le risposte devono sembrare scritte da qualcuno che conosce il progetto da mesi, non da un chatbot generico.

7. Se il budget e basso rispetto all'MVP avverti sempre e dai alternative concrete.

8. Se l'health score e sotto 50 dai priorita assoluta ai problemi critici.

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
