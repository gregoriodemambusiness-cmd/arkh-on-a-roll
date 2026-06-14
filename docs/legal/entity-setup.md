# Struttura legale e operativa — Pilot AI (EU)

Guida operativa per l'incorporazione e la compliance iniziale. **Non sostituisce consulenza legale professionale.**

---

## 1. Scelta entity

### Raccomandazione primaria: SRL (Italia)

| Pro | Contro |
|-----|--------|
| Familiare, costi setup contenuti (~2–5k€ con commercialista) | Meno attrattiva per alcuni investor internazionali vs Ltd |
| Capitale minimo 1€ (reform 2023) | IVA e adempimenti italiani |
| Adatta se GTM iniziale IT + EU | |

### Alternativa: Ltd (UK o Irlanda)

Considerare se:
- Target investor UK/US early
- Product Hunt / market EN-first
- Team distribuito fuori IT

**Default piano:** SRL italiana con sede operativa IT, hosting EU, contratti in IT/EN.

---

## 2. Checklist incorporazione SRL (Italia)

| Step | Azione | Timeline |
|------|--------|----------|
| 1 | Scegliere commercialista / studio societario | Settimana 1 |
| 2 | Atto costitutivo + statuto (oggetto sociale: software SaaS, consulenza AI) | Settimana 2 |
| 3 | Apertura P.IVA / codice ATECO (62.01.00 o 62.02.00) | Settimana 2–3 |
| 4 | Conto corrente aziendale | Settimana 3 |
| 5 | Registro imprese + PEC | Settimana 3 |
| 6 | Iscrizione INPS/INAIL (se assunzioni) | Quando hiring |

**Oggetto sociale suggerito:** Sviluppo e commercializzazione di piattaforme software SaaS, servizi di automazione e intelligenza artificiale, consulenza tecnologica.

---

## 3. IVA e fiscalità SaaS cross-border EU

| Scenario | Regime |
|----------|--------|
| B2C EU (privati) | IVA del paese del cliente via **OSS (One Stop Shop)** |
| B2C IT | IVA 22% |
| B2B EU (P.IVA valida) | **Reverse charge** — cliente autoliquida |
| B2B extra-EU | Esportazione servizi, no IVA IT |
| Studio / Enterprise B2B | Fattura con P.IVA, reverse charge se EU B2B |

**Azioni:**
1. Iscrizione OSS tramite Agenzia Entrate (se vendite B2C EU)
2. Stripe Tax o fatturazione con commercialista per calcolo IVA
3. Conservare prove location cliente (billing address, IP)

---

## 4. GDPR — requisiti minimi

### Documenti da pubblicare sul sito

- [Privacy Policy](./privacy-policy.md) → `/privacy` o link footer
- [Termini di Servizio](./terms-of-service.md) → `/terms` o link footer
- Cookie policy (se analytics/marketing cookies)

### Misure tecniche

| Requisito | Implementazione Pilot |
|-----------|----------------------|
| Hosting EU | Supabase region EU (Frankfurt) |
| DPA con subprocessors | Supabase, Netlify, Stripe, OpenAI — accettare DPA standard |
| Consenso marketing | Opt-in esplicito signup |
| Diritti interessato | Email support@ per access/cancel/delete |
| Registro trattamenti | Documento interno (template sotto) |
| Data breach | Procedura notifica 72h Garante |

### Subprocessors attuali

| Provider | Dato trattato | Regione |
|----------|---------------|---------|
| Supabase | Auth, profili, workspace | EU (configurare) |
| Netlify | Hosting, logs | US/EU |
| Stripe | Pagamenti, email | US + SCC |
| Notion | CRM lead | US + SCC |
| OpenAI (futuro) | Prompt utente | US + DPA |

### Registro trattamenti (estratto)

| Trattamento | Base giuridica | Dati | Retention |
|-------------|----------------|------|-----------|
| Account utente | Contratto | Email, nome, password hash | Durata account + 30gg |
| Progetto startup | Contratto | Idea, blueprint, task | Durata account |
| CRM / lead | Interesse legittimo / consenso | Email, azienda, messaggio | 24 mesi |
| Pagamenti | Contratto | Stripe customer ID | 10 anni (fiscale) |
| Analytics | Consenso | IP anonimizzato | 14 mesi |

---

## 5. AI Act (EU) — obblighi anticipati

Pilot usa AI generativa per blueprint, task, co-founder chat.

| Obbligo | Azione Pilot |
|---------|--------------|
| Trasparenza | Dichiarare nel ToS e in-app: "Contenuti generati da AI" |
| Human oversight | Disclaimer: output non è consulenza legale/fiscale/investment |
| Risk classification | Likely **limited risk** (transparency requirements) — monitor regolamento |
| Logging | Conservare prompt/response per debug (con consenso in privacy policy) |

**Disclaimer in-app (Co-founder, Blueprint):** *"Pilot assiste nella pianificazione. Verifica sempre informazioni critiche con professionisti qualificati."*

---

## 6. Proprietà intellettuale

| Asset | Protezione |
|-------|------------|
| Brand "Pilot" / logo | Verifica marchi EU (EUIPO) — conflitto possibile con "Pilot" generico |
| Codice sorgente | Copyright automatico + repo privato |
| Contenuti generati per utenti | ToS: utente possiede output, licenza d'uso a Pilot per migliorare servizio (anonimizzato) |

---

## 7. Contratti commerciali

| Tipo | Template necessario |
|------|---------------------|
| B2C SaaS | Termini di Servizio + SLA implicito |
| Enterprise | MSA + DPA + SOW (order form) |
| Studio | Contratto prestazione + preventivo firmato |

---

## 8. Action items immediati

- [ ] Consultare commercialista per costituzione SRL
- [ ] Pubblicare Privacy Policy e ToS sul sito (link footer)
- [ ] Configurare Supabase region EU
- [ ] Verifica marchio "Pilot AI" su EUIPO
- [ ] Iscrizione OSS se vendite B2C EU attive
- [ ] Firmare DPA con Supabase, Stripe, Notion
- [ ] Email dedicata privacy: privacy@pilot.ai (o dominio reale)

---

*Documento interno — aggiornare con commercialista prima del launch pubblico.*
