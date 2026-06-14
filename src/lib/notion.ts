import { Client } from "@notionhq/client";

// ── DB IDs ─────────────────────────────────────────────────────────────────
const DB_CRM       = "2e21e308-6216-4e08-b30c-82c961c012bd";
const DB_TICKETS   = "82c6d847-2dfd-4f98-ad4a-441a5b9f755c";
const DB_ENTERPRISE = "5f4c1fb4-3dce-4cbf-a82e-3ff82cf42aa8";

function getClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN non configurato nelle variabili d'ambiente.");
  return new Client({ auth: token });
}

// ── 1. CRM Clienti ─────────────────────────────────────────────────────────
export type CRMUser = {
  name: string;
  email: string;
  plan: string;
  healthScore: number;
};

export async function addClientToCRM(user: CRMUser): Promise<void> {
  const notion = getClient();
  await notion.pages.create({
    parent: { database_id: DB_CRM },
    properties: {
      Nome: {
        title: [{ text: { content: user.name } }],
      },
      Email: {
        email: user.email,
      },
      Piano: {
        select: { name: user.plan },
      },
      "Health Score": {
        number: user.healthScore,
      },
      "Data Registrazione": {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    },
  });
}

// ── 2. Ticket Support ──────────────────────────────────────────────────────
export type SupportTicket = {
  title: string;
  email: string;
  message: string;
  category: string;
  priority: string;
};

export async function createSupportTicket(ticket: SupportTicket): Promise<void> {
  const notion = getClient();
  await notion.pages.create({
    parent: { database_id: DB_TICKETS },
    properties: {
      Titolo: {
        title: [{ text: { content: ticket.title } }],
      },
      Email: {
        email: ticket.email,
      },
      Categoria: {
        select: { name: ticket.category },
      },
      Priorità: {
        select: { name: ticket.priority },
      },
      Stato: {
        select: { name: "Aperto" },
      },
      "Data Apertura": {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: ticket.message } }],
        },
      },
    ],
  });
}

// ── 3. Pipeline Enterprise ─────────────────────────────────────────────────
export type EnterpriseLead = {
  company: string;
  contact: string;
  email: string;
  estimatedValue: number;
  notes: string;
};

export async function addEnterpriseLead(lead: EnterpriseLead): Promise<void> {
  const notion = getClient();
  await notion.pages.create({
    parent: { database_id: DB_ENTERPRISE },
    properties: {
      Azienda: {
        title: [{ text: { content: lead.company } }],
      },
      "Contatto": {
        rich_text: [{ text: { content: lead.contact } }],
      },
      Email: {
        email: lead.email,
      },
      "Valore Stimato (€)": {
        number: lead.estimatedValue,
      },
      Stato: {
        select: { name: "Nuovo Lead" },
      },
      "Data Contatto": {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    },
    children: lead.notes
      ? [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: lead.notes } }],
            },
          },
        ]
      : [],
  });
}

// ── 4. Pipeline Studio ─────────────────────────────────────────────────────
export type StudioLead = {
  contact: string;
  email: string;
  company: string;
  sector: string;
  role: string;
  process: string;
  timeLost: string;
  teamSize: string;
  budget: string;
  urgency: string;
  message: string;
};

function parseBudgetEstimate(budget: string): number {
  const nums = budget.match(/\d[\d.,]*/g);
  if (!nums?.length) return 299;
  const values = nums.map((n) => Number(n.replace(/\./g, "").replace(",", ".")));
  return Math.max(...values.filter((v) => !Number.isNaN(v)), 299);
}

export async function addStudioLead(lead: StudioLead): Promise<void> {
  const notion = getClient();
  const notes = [
    "Source: PILOT Studio",
    lead.sector ? `Settore: ${lead.sector}` : "",
    lead.role ? `Ruolo: ${lead.role}` : "",
    `Processo: ${lead.process}`,
    lead.timeLost ? `Tempo perso: ${lead.timeLost}` : "",
    lead.teamSize ? `Persone coinvolte: ${lead.teamSize}` : "",
    lead.budget ? `Budget indicativo: ${lead.budget}` : "",
    `Urgenza: ${lead.urgency}`,
    lead.message ? `Messaggio: ${lead.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await notion.pages.create({
    parent: { database_id: DB_ENTERPRISE },
    properties: {
      Azienda: {
        title: [{ text: { content: lead.company || "Studio lead" } }],
      },
      Contatto: {
        rich_text: [{ text: { content: lead.contact } }],
      },
      Email: {
        email: lead.email,
      },
      "Valore Stimato (€)": {
        number: parseBudgetEstimate(lead.budget),
      },
      Stato: {
        select: { name: "Nuovo Lead" },
      },
      "Data Contatto": {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: notes } }],
        },
      },
    ],
  });
}
