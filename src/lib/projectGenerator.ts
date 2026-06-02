import {
  type Project,
  type Onboarding,
  type Task,
  type FounderAlert,
  parseBudget,
} from "./projectStore";

const TYPE_BASE_COST: Record<string, number> = {
  SaaS: 8000,
  App: 12000,
  Marketplace: 20000,
  Servizio: 2500,
  "E-commerce": 6000,
  "AI tool": 10000,
  Altro: 5000,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function deriveName(idea: string): string {
  const first = idea?.split(/[.,\n]/)[0]?.trim() || "La mia startup";
  return first.length > 36 ? first.slice(0, 36).trim() + "…" : first || "La mia startup";
}

function shortIdea(idea: string, n = 140): string {
  if (!idea) return "Una soluzione che aiuta il tuo target a risolvere un problema reale.";
  return idea.length > n ? idea.slice(0, n).trim() + "…" : idea;
}

function essentialFor(type: string): string[] {
  switch (type) {
    case "SaaS":
      return ["Auth base", "Onboarding utente", "Funzione core in 1 schermata"];
    case "App":
      return ["Schermata core", "Profilo utente", "1 flusso end-to-end"];
    case "Marketplace":
      return ["Profilo venditore", "Listing prodotto/servizio", "Contatto buyer–seller"];
    case "Servizio":
      return ["Landing con form", "Prenotazione call", "Pagamento manuale"];
    case "E-commerce":
      return ["1 prodotto venduto", "Checkout Stripe", "Pagina ringraziamento"];
    case "AI tool":
      return ["Input utente", "1 output AI utile", "Salvataggio risultato"];
    default:
      return ["Landing chiara", "1 azione core", "Raccolta feedback"];
  }
}

function deferredFor(type: string): string[] {
  return [
    "Notifiche push",
    "Dashboard analytics avanzata",
    "Multi-lingua",
    "App mobile nativa",
    "Integrazioni terze parti",
    type === "Marketplace" ? "Sistema recensioni completo" : "Programma referral",
  ];
}

function estimateMVPCost(type: string, stage: string, team: string): number {
  const base = TYPE_BASE_COST[type] ?? 5000;
  const stageMul = stage === "Solo un'idea" ? 0.6 : stage === "Sto validando" ? 0.8 : stage === "Sto costruendo" ? 1 : 1.1;
  const teamMul = team === "Solo founder" ? 0.7 : team === "2–3 persone" ? 1 : 1.2;
  return Math.round((base * stageMul * teamMul) / 100) * 100;
}

function buildTasks(o: Onboarding, name: string): Task[] {
  const t = (
    title: string,
    area: Task["area"],
    priority: Task["priority"],
    duration: string,
    output: string,
    why: string,
    steps: string[],
    description: string
  ): Task => ({
    id: uid(),
    title,
    area,
    priority,
    duration,
    output,
    why,
    steps,
    description,
    status: "Da fare",
  });

  const target = o.target || "il tuo target";
  return [
    t(
      "Definisci value proposition",
      "Idea",
      "Alta",
      "30m",
      "1 frase chiara di posizionamento",
      "Senza una proposta chiara nessun messaggio funziona e nessun utente capisce perché dovrebbe usarti.",
      [
        "Scrivi il problema in 1 frase",
        `Identifica ${target} in 1 frase`,
        "Scrivi la promessa di valore in 1 frase",
      ],
      `Trasforma "${shortIdea(o.idea, 60)}" in una proposta di valore in 1 frase comprensibile a chiunque.`
    ),
    t(
      "Intervista 5 utenti target",
      "Validation",
      "Alta",
      "2h",
      "Documento con 5 insight chiave sul problema",
      "Le interviste rivelano i pattern del problema, non della soluzione. Senza, costruisci alla cieca.",
      [
        "Identifica 5 persone del tuo target",
        "Prepara 5 domande aperte sul problema",
        "Pianifica e svolgi le call (15–20 min)",
        "Annota i pattern ricorrenti",
      ],
      `Parla con 5 persone reali del tuo target (${target}) e capisci come vivono il problema oggi.`
    ),
    t(
      "Definisci MVP minimo (3 feature)",
      "MVP",
      "Alta",
      "1h",
      "Lista di 3 funzioni essenziali",
      "Il 90% dei founder costruisce troppo. Un MVP più piccolo si valida prima e costa meno.",
      [
        "Elenca tutte le funzioni che ti vengono in mente",
        "Tieni solo le 3 che risolvono il problema core",
        "Sposta tutto il resto in 'da rimandare'",
      ],
      `Definisci le 3 funzioni essenziali per ${name} senza le quali il prodotto non ha senso.`
    ),
    t(
      "Crea landing con waitlist",
      "Marketing",
      "Media",
      "1h",
      "Landing pubblicata con email signup",
      "Una landing con waitlist misura interesse reale prima di scrivere una riga di codice.",
      [
        "Scrivi hero + sotto-hero",
        "Definisci 1 sola CTA: iscriviti",
        "Aggiungi form email + pubblica",
      ],
      "Costruisci una landing semplice per misurare quanti utenti reali si iscrivono alla waitlist."
    ),
    t(
      "Stima budget MVP e taglia",
      "Budget",
      "Alta",
      "30m",
      "Stima MVP allineata al budget disponibile",
      "Senza una stima realistica bruci budget. Il Budget Guard ti aiuta a tagliare in modo intelligente.",
      [
        "Stima costi (sviluppo, tool, marketing)",
        "Confronta con il budget disponibile",
        "Riduci scope finché entri nel budget",
      ],
      `Allinea il costo dell'MVP al budget disponibile (${o.budget || "—"}) tagliando ciò che non è essenziale.`
    ),
  ];
}

function buildAlerts(o: Onboarding, mvpEstimate: number, budgetAvailable: number): FounderAlert[] {
  const out: FounderAlert[] = [];
  const push = (a: Omit<FounderAlert, "id" | "resolved">) =>
    out.push({ ...a, id: uid(), resolved: false });

  if (budgetAvailable && budgetAvailable < mvpEstimate * 0.85) {
    push({
      severity: "Alta",
      area: "Budget",
      title: "Budget insufficiente per l'MVP pianificato",
      explanation: `Il tuo budget (${o.budget}) è inferiore al costo stimato dell'MVP.`,
      advice: "Riduci lo scope a 3 funzioni essenziali e valida prima di costruire il resto.",
    });
  }
  if (o.stage === "Sto costruendo" || o.stage === "Già live") {
    push({
      severity: "Media",
      area: "Validation",
      title: "Stai sviluppando senza validazione formale",
      explanation: "Stai costruendo prima di avere 20 interviste utente strutturate.",
      advice: "Esegui 20 interviste prima della prossima release per evitare di costruire la cosa sbagliata.",
    });
  } else {
    push({
      severity: "Alta",
      area: "Validation",
      title: "Mancano interviste utente",
      explanation: "Nessuna intervista utente registrata. Stai progettando senza prove dal mercato.",
      advice: "Pianifica 5 interviste questa settimana con persone reali del tuo target.",
    });
  }
  if (o.team === "Solo founder") {
    push({
      severity: "Media",
      area: "Team",
      title: "Founder singolo: rischio burnout",
      explanation: "Sei solo. Senza ruoli chiari e ritmo sostenibile, l'esecuzione si blocca.",
      advice: "Definisci 3 priorità settimanali e proteggi 2 ore al giorno di lavoro deep.",
    });
  }
  if (!o.target || o.target.length < 20) {
    push({
      severity: "Alta",
      area: "Target",
      title: "Target poco chiaro",
      explanation: "Il target inserito è generico. Senza un target preciso il messaggio non funziona.",
      advice: "Descrivi il target con 3 attributi: chi è, cosa fa, qual è il problema specifico.",
    });
  }
  push({
    severity: "Media",
    area: "Pricing",
    title: "Pricing non testato",
    explanation: "Non hai ancora testato 3 punti di prezzo con utenti reali.",
    advice: "Mostra 3 prezzi diversi nella landing e misura quale converte di più.",
  });
  push({
    severity: "Bassa",
    area: "Go-to-market",
    title: "Go-to-market iniziale debole",
    explanation: "Non c'è ancora un canale di acquisizione testato.",
    advice: "Scegli 1 solo canale per i primi 30 giorni e misura CAC e tasso di risposta.",
  });
  return out;
}

export function generateProject(o: Onboarding): Project {
  const name = deriveName(o.idea);
  const target = o.target || "freelance e piccoli team";
  const sector = o.sector || "il tuo settore";
  const essential = essentialFor(o.type);
  const deferred = deferredFor(o.type);
  const budgetAvailable = parseBudget(o.budget);
  const mvpEstimate = estimateMVPCost(o.type, o.stage, o.team);

  const oneline = `${name}: aiuta ${target} a risolvere un problema reale in ${sector} senza complessità.`;

  return {
    id: uid(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    onboarding: o,
    onelinePitch: oneline,
    blueprint: {
      mission: `Aiutare ${target} a passare dal caos iniziale a un progetto concreto e validabile.`,
      vision: `Diventare lo strumento di riferimento in ${sector} per chi vuole validare prima di costruire.`,
      problem: `${target} oggi non ha un modo semplice per affrontare ${shortIdea(o.idea, 80)} senza perdere tempo e budget.`,
      solution: `Una soluzione ${o.type || "digitale"} che guida ${target} passo dopo passo, eliminando complessità inutile.`,
      target,
      valueProp: `Da idea confusa a primo cliente, senza bruciare budget né tempo.`,
      businessModel: o.type === "Servizio"
        ? "Servizio a progetto + retainer mensile."
        : o.type === "E-commerce"
        ? "Vendita diretta prodotti + margine fisso."
        : o.type === "Marketplace"
        ? "Commissione sulle transazioni (take rate 8–12%)."
        : "SaaS in abbonamento mensile con free trial.",
      mvp: `MVP focalizzato su 3 funzioni essenziali: ${essential.join(", ")}.`,
      goToMarket: `Lancio focalizzato su 1 canale: community + content rivolto a ${target}.`,
      risks: `Rischi principali: scope troppo grande, validazione saltata, budget bruciato prima dei primi clienti.`,
      nextActions: "Completare 20 interviste utente, definire MVP minimo, pubblicare landing waitlist.",
    },
    mvpEssential: essential,
    mvpDeferred: deferred,
    mvpEstimate,
    budgetAvailable,
    roadmap: [
      {
        key: "30",
        label: "Validazione — 30 giorni",
        items: [
          { t: "20 interviste utente", done: false },
          { t: "Landing + waitlist live", done: false },
          { t: "Test 3 punti di prezzo", done: false },
          { t: "Definire MVP minimo (3 feature)", done: false },
        ],
      },
      {
        key: "60",
        label: "MVP — 60 giorni",
        items: [
          { t: `Costruire: ${essential[0]}`, done: false },
          { t: `Costruire: ${essential[1]}`, done: false },
          { t: `Costruire: ${essential[2]}`, done: false },
          { t: "Beta privata con 10 utenti", done: false },
        ],
      },
      {
        key: "90",
        label: "Lancio — 90 giorni",
        items: [
          { t: "Launch plan e press kit", done: false },
          { t: "Primi 100 utenti reali", done: false },
          { t: "Primi pagamenti", done: false },
        ],
      },
    ],
    tasks: buildTasks(o, name),
    founderAlerts: buildAlerts(o, mvpEstimate, budgetAvailable),
  };
}
