"use server";

import {
  addEnterpriseLead,
  addStudioLead,
  type EnterpriseLead,
  type StudioLead,
} from "./notion";

export type LeadSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitEnterpriseLead(
  lead: EnterpriseLead,
): Promise<LeadSubmitResult> {
  try {
    if (!lead.company?.trim() || !lead.email?.trim()) {
      return { ok: false, error: "Azienda ed email sono obbligatori." };
    }
    await addEnterpriseLead(lead);
    return { ok: true };
  } catch (err) {
    console.error("[notion] submitEnterpriseLead:", err);
    return {
      ok: false,
      error: "Impossibile inviare la richiesta. Riprova tra poco.",
    };
  }
}

export async function submitStudioLead(
  lead: StudioLead,
): Promise<LeadSubmitResult> {
  try {
    if (!lead.email?.trim() || !lead.process?.trim()) {
      return { ok: false, error: "Email e processo sono obbligatori." };
    }
    await addStudioLead(lead);
    return { ok: true };
  } catch (err) {
    console.error("[notion] submitStudioLead:", err);
    return {
      ok: false,
      error: "Impossibile inviare la richiesta. Riprova tra poco.",
    };
  }
}

export async function submitCRMSignup(user: {
  name: string;
  email: string;
  plan: string;
  healthScore: number;
}): Promise<LeadSubmitResult> {
  try {
    const { addClientToCRM } = await import("./notion");
    await addClientToCRM(user);
    return { ok: true };
  } catch (err) {
    console.error("[notion] submitCRMSignup:", err);
    return { ok: false, error: "CRM sync failed" };
  }
}

export async function submitSupportTicket(ticket: {
  title: string;
  email: string;
  message: string;
  category: string;
  priority: string;
}): Promise<LeadSubmitResult> {
  try {
    const { createSupportTicket } = await import("./notion");
    await createSupportTicket(ticket);
    return { ok: true };
  } catch (err) {
    console.error("[notion] submitSupportTicket:", err);
    return { ok: false, error: "Ticket creation failed" };
  }
}
