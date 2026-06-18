import type { Project } from "./projectStore";

export const DEMO_PROJECT: Project = {
  id: "demo-project-001",
  name: "TechStart Demo",
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  updatedAt: Date.now(),

  onboarding: {
    idea: "Piattaforma SaaS B2B per la gestione automatizzata delle note spese aziendali con AI e integrazioni contabili",
    sector: "Fintech / HR Tech",
    type: "SaaS",
    target: "PMI italiane con 10-200 dipendenti",
    location: "Italia",
    budget: "2.000–10.000€",
    stage: "Idea validata",
    team: "Solo founder",
    goal: "Acquisire i primi 10 clienti paganti",
  },

  onelinePitch:
    "Automatizziamo la gestione note spese per le PMI italiane, risparmiando 4 ore a dipendente al mese.",

  blueprint: {
    mission: "Eliminare il lavoro manuale nelle note spese così ogni team può concentrarsi su ciò che conta.",
    vision: "Diventare la piattaforma di riferimento per la finanza operativa delle PMI italiane entro il 2026.",
    problem:
      "Le PMI perdono in media 3,5 ore/mese per dipendente in raccolta scontrini, approvazioni e riconciliazione contabile.",
    solution:
      "App mobile + dashboard: scatta la foto, l'AI classifica, il manager approva in un click, il contabile riceve i dati strutturati.",
    target: "CFO e responsabili amministrativi di PMI con 10-200 dipendenti in Italia.",
    valueProp: "4x più veloce delle soluzioni tradizionali, integrazione nativa con Fatture in Cloud e Zucchetti.",
    businessModel:
      "SaaS mensile: 8€/utente/mese. Piano minimo 5 utenti (40€/mese). Enterprise custom.",
    mvp:
      "App mobile (iOS + Android) + dashboard web: upload scontrino, classificazione AI, workflow approvazione, export CSV.",
    goToMarket:
      "Outbound via LinkedIn ai CFO → demo 1:1 → free trial 14 giorni → conversione. Partner: studi commercialisti.",
    risks: "Dipendenza da OCR di terze parti; mercato con player come Jenji e Spendesk già attivi.",
    nextActions:
      "1. Intervistare 10 CFO target. 2. Costruire landing page con waitlist. 3. Prototipo Figma da validare.",
  },

  mvpEssential: [
    "Upload foto scontrino con OCR automatico",
    "Classificazione categoria spesa con AI",
    "Workflow approvazione manager",
    "Dashboard riepilogo spese mensili",
    "Export dati CSV / integrazione Fatture in Cloud",
  ],
  mvpDeferred: [
    "App nativa iOS/Android (prima PWA)",
    "Integrazione Zucchetti HR",
    "Report avanzati e BI",
    "Multi-valuta",
  ],
  mvpCompleted: ["Prototipo Figma completato", "Landing page con waitlist online"],
  mvpEstimate: 7500,
  budgetAvailable: 8000,

  roadmap: [
    {
      key: "30",
      label: "Fase 1 – Validazione",
      items: [
        { t: "10 interviste CFO completate", done: true },
        { t: "Landing page con waitlist", done: true },
        { t: "Prototipo Figma v1", done: true },
        { t: "5 beta tester confermati", done: false },
      ],
    },
    {
      key: "60",
      label: "Fase 2 – MVP",
      items: [
        { t: "Backend API (Node + Supabase)", done: false },
        { t: "OCR integration (Google Vision)", done: false },
        { t: "Dashboard MVP web", done: false },
        { t: "Beta privata con 5 aziende", done: false },
      ],
    },
    {
      key: "90",
      label: "Fase 3 – Lancio",
      items: [
        { t: "Onboarding self-serve", done: false },
        { t: "Integrazione Fatture in Cloud", done: false },
        { t: "Campagna LinkedIn ads", done: false },
        { t: "Primo cliente pagante", done: false },
      ],
    },
  ],

  tasks: [
    {
      id: "t1",
      title: "Completare 5 interviste con CFO",
      description: "Intervistare almeno 5 responsabili amministrativi per validare il problema e la willingness to pay.",
      priority: "Alta",
      duration: "3 giorni",
      output: "Note sintetiche + score validazione",
      status: "Completato",
      area: "Validation",
      why: "La validazione qualitativa riduce il rischio di costruire qualcosa che il mercato non vuole.",
      steps: ["Identifica 20 CFO su LinkedIn", "Scrivi messaggio outreach", "Conduci intervista 30 min", "Registra insight"],
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
    {
      id: "t2",
      title: "Creare landing page con waitlist",
      description: "Una pagina semplice che spieghi il problema, la soluzione e raccoglie email di interesse.",
      priority: "Alta",
      duration: "2 giorni",
      output: "URL live + almeno 20 iscritti",
      status: "Completato",
      area: "Marketing",
      why: "Ogni email raccolta è un segnale concreto di interesse prima di scrivere una riga di codice.",
      steps: ["Scrivere copy con formula PAS", "Deploy su Webflow o Carrd", "Configurare Mailchimp", "Test su 3 persone"],
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: "t3",
      title: "Definire architettura tecnica MVP",
      description: "Scegliere stack tecnologico e disegnare architettura del sistema per il primo MVP.",
      priority: "Alta",
      duration: "1 giorno",
      output: "Documento architettura + scelte tecnologiche",
      status: "In corso",
      area: "MVP",
      why: "Una buona architettura iniziale evita refactoring costosi a MVP avanzato.",
      steps: ["Valuta opzioni backend", "Scegli provider OCR", "Disegna schema DB", "Stima costi infrastruttura"],
    },
    {
      id: "t4",
      title: "Calcolare pricing definitivo",
      description: "Testare diverse strutture di prezzo con i beta tester per trovare il punto ottimale.",
      priority: "Media",
      duration: "2 giorni",
      output: "Pricing page + tabella piani",
      status: "In corso",
      area: "Budget",
      why: "Il pricing sbagliato è la causa numero 1 di churn nei SaaS B2B early stage.",
      steps: ["Ricerca competitor", "Test 3 livelli di prezzo con beta tester", "Analisi willingness to pay", "Formalizza piani"],
    },
    {
      id: "t5",
      title: "Avviare campagna LinkedIn outreach",
      description: "Contattare 50 CFO di PMI italiane con messaggio personalizzato per invito a demo.",
      priority: "Alta",
      duration: "5 giorni",
      output: "Almeno 8 demo prenotate",
      status: "Da fare",
      area: "Marketing",
      why: "Il canale LinkedIn è il più efficace per raggiungere decisori B2B in Italia.",
      steps: ["Costruire lista 50 prospect", "Scrivere sequenza 3 messaggi", "Configurare Sales Navigator", "Tracciare risposte su Notion"],
    },
    {
      id: "t6",
      title: "Prototipo interattivo Figma v2",
      description: "Aggiornare il prototipo Figma con i feedback delle prime interviste, testare su 3 beta tester.",
      priority: "Media",
      duration: "3 giorni",
      output: "File Figma condivisibile + report usability",
      status: "Da fare",
      area: "MVP",
      why: "Testare l'UX prima di sviluppare elimina iterazioni costose sul prodotto reale.",
      steps: ["Raccogliere feedback dalle interviste", "Aggiornare flussi principali", "Sessioni usability test (Maze)", "Presentare al mentor"],
    },
  ],

  founderAlerts: [
    {
      id: "a1",
      title: "Concorrenza sottovalutata",
      severity: "Alta",
      area: "Strategia",
      explanation: "Jenji e Spendesk sono già presenti in Italia con team commerciali strutturati e prezzi competitivi.",
      advice: "Definisci una nicchia difendibile: specializzati su PMI italiane con integrazione nativa Fatture in Cloud che i competitor internazionali ignorano.",
      resolved: false,
    },
    {
      id: "a2",
      title: "Dipendenza da provider OCR",
      severity: "Media",
      area: "Tecnico",
      explanation: "Google Vision e AWS Textract hanno pricing variabile e latenza imprevedibile ad alto volume.",
      advice: "Testa almeno 3 provider OCR in fase MVP e mantieni un'astrazione che permetta di switchare facilmente.",
      resolved: false,
    },
    {
      id: "a3",
      title: "Ciclo di vendita B2B lungo",
      severity: "Media",
      area: "Sales",
      explanation: "Le PMI italiane hanno cicli di approvazione interni di 4-8 settimane per software aziendali.",
      advice: "Proponi trial gratuito 30 giorni self-serve per bypassare il processo di acquisto formale nelle fasi iniziali.",
      resolved: true,
    },
  ],

  validation: {
    interviews: [
      {
        id: "i1",
        name: "Marco R. — CFO, Rossi Srl (45 dip.)",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split("T")[0],
        insight: "Perdono 6 ore/mese per dipendente solo su riconciliazione. Usano Excel. Non conoscono Jenji.",
        sentiment: "positivo",
      },
      {
        id: "i2",
        name: "Laura B. — Responsabile Amm., TecnoServ (80 dip.)",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split("T")[0],
        insight: "Problema reale ma hanno paura di integrazioni complesse. Vogliono export CSV come primo passo.",
        sentiment: "neutro",
      },
      {
        id: "i3",
        name: "Giulia M. — CFO, MediaCraft (30 dip.)",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split("T")[0],
        insight: "Pronta a pagare 8€/utente/mese subito. Vuole integrazione Fatture in Cloud e approvazione mobile.",
        sentiment: "positivo",
      },
      {
        id: "i4",
        name: "Paolo F. — Direttore Finanza, Costruzioni Gamma (150 dip.)",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split("T")[0],
        insight: "Hanno già Concur ma lo odiano per la complessità. Cercano qualcosa di italiano e semplice.",
        sentiment: "positivo",
      },
    ],
    waitlist: ["marco@rossisrl.it", "laura@tecnoserv.com", "giulia@mediacraft.it", "info@gammacost.it", "f.bianchi@alphaspa.it", "contatto@betafin.it", "demo@techstartdemo.it"],
  },

  finance: {
    transactions: [
      {
        id: "tx1",
        type: "entrata",
        amount: 500,
        category: "Consulenza",
        description: "Consulenza strategica per validazione idea — cliente pilota",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString().split("T")[0],
        recurring: false,
      },
      {
        id: "tx2",
        type: "entrata",
        amount: 750,
        category: "Pre-vendita",
        description: "Acconto pre-vendita MVP da beta tester — MediaCraft",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString().split("T")[0],
        recurring: false,
      },
      {
        id: "tx3",
        type: "uscita",
        amount: 29,
        category: "Software",
        description: "Abbonamento Figma Professional",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().split("T")[0],
        recurring: true,
      },
      {
        id: "tx4",
        type: "uscita",
        amount: 99,
        category: "Marketing",
        description: "LinkedIn Sales Navigator — 1 mese",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString().split("T")[0],
        recurring: true,
      },
      {
        id: "tx5",
        type: "uscita",
        amount: 19,
        category: "Software",
        description: "Vercel Pro — hosting landing page",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().split("T")[0],
        recurring: true,
      },
    ],
  },

  businessModel: {
    arpu: 320,
    cac: 180,
    churn: 4,
  },

  brand: {
    selectedName: "ExpenseFlow",
    colors: ["#6B21A8", "#7C3AED", "#C4B5FD"],
  },
};

export const DEMO_WORKSPACE_ID = "demo-workspace-001";

export const DEMO_WORKSPACE = {
  id: DEMO_WORKSPACE_ID,
  user_id: "demo-user-001",
  owner_id: "demo-user-001",
  name: "TechStart Demo",
  invite_code: "000000",
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  project_data: null as unknown,
};
