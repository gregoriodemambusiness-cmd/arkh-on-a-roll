"use server";

import { Resend } from "resend";

const FROM = "Pilot <noreply@pilotai.co>";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Benvenuto in Pilot, ${name}`,
      html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#000;color:#fff;">
  <h1 style="font-size:26px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:28px;">PILOT</h1>
  <h2 style="font-size:20px;font-weight:600;margin-bottom:14px;">Il tuo workspace e pronto.</h2>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin-bottom:10px;">
    Hai 14 giorni per esplorare Pilot e costruire la tua startup con metodo.
  </p>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin-bottom:28px;">
    Il tuo Co-founder AI ti aspetta con consigli specifici sul tuo progetto.
  </p>
  <a href="https://pilotai.co/app"
    style="display:inline-block;background:#7B2FFF;color:#fff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:600;font-size:14px;">
    Apri il tuo workspace
  </a>
  <p style="color:#444;font-size:11px;margin-top:40px;">Pilot — Il co-founder AI per startup italiane</p>
</div>`,
    });
  } catch {}
}

export async function sendPlanActivatedEmail(
  name: string,
  email: string,
  plan: string,
  amount: number,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Piano ${plan} attivato`,
      html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#000;color:#fff;">
  <h1 style="font-size:26px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:28px;">PILOT</h1>
  <h2 style="font-size:20px;font-weight:600;margin-bottom:14px;">Piano ${plan} attivato.</h2>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin-bottom:10px;">
    Hai attivato Pilot ${plan} per &euro;${amount}/mese.
  </p>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin-bottom:28px;">
    Scopri le funzioni che non conosci ancora: Co-founder AI, Founder Guard e Budget Guard
    sono i tuoi strumenti piu potenti.
  </p>
  <a href="https://pilotai.co/app"
    style="display:inline-block;background:#7B2FFF;color:#fff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:600;font-size:14px;">
    Vai al tuo workspace
  </a>
  <p style="color:#444;font-size:11px;margin-top:40px;">Pilot — Il co-founder AI per startup italiane</p>
</div>`,
    });
  } catch {}
}

export async function sendTrialExpiringEmail(
  name: string,
  email: string,
  daysLeft: number,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Il tuo trial scade tra ${daysLeft} giorni`,
      html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#000;color:#fff;">
  <h1 style="font-size:26px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:28px;">PILOT</h1>
  <h2 style="font-size:20px;font-weight:600;margin-bottom:14px;">Il tuo trial scade tra ${daysLeft} giorni.</h2>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin-bottom:10px;">
    Hai ancora ${daysLeft} giorni per esplorare tutto quello che Pilot ha da offrire.
  </p>
  <p style="color:#aaa;font-size:14px;line-height:1.7;margin-bottom:28px;">
    Non perdere il lavoro fatto finora. Passa a Starter per continuare a costruire.
  </p>
  <a href="https://pilotai.co/app/plan"
    style="display:inline-block;background:#7B2FFF;color:#fff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:600;font-size:14px;">
    Scegli il tuo piano
  </a>
  <p style="color:#444;font-size:11px;margin-top:40px;">Pilot — Il co-founder AI per startup italiane</p>
</div>`,
    });
  } catch {}
}
