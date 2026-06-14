# PILOT AI — Financial Model (12 mesi)

Modello conservativo vs ottimistico. Prezzi da [`src/lib/billing.ts`](../../src/lib/billing.ts).

**Assunzioni base**
- Free Trial 30 giorni, poi conversione a paid
- Mix paid: 40% Starter (23€), 45% Pro (49€), 15% Founder (99€) → **ARPU ~42€**
- Churn mensile B2C: 7% (conservativo) / 5% (ottimistico)
- CAC B2C organico: 15€ / 25€
- Studio: margine lordo 50%
- Enterprise: 1 deal Q3 (3.000€/anno), 1 deal Q4 (5.000€/anno) conservativo

---

## Scenario conservativo

### B2C SaaS — acquisizione e conversione

| Mese | Signup cum. | Nuovi signup | Free→Paid % | Paganti | Churn | Net paganti | MRR B2C (€) |
|------|-------------|--------------|-------------|---------|-------|-------------|-------------|
| 1 | 30 | 30 | — | 0 | — | 0 | 0 |
| 2 | 55 | 25 | 3% | 1 | 0 | 1 | 42 |
| 3 | 85 | 30 | 4% | 3 | 0 | 4 | 168 |
| 4 | 120 | 35 | 4% | 5 | 0 | 9 | 378 |
| 5 | 160 | 40 | 4% | 6 | 1 | 14 | 588 |
| 6 | 210 | 50 | 5% | 10 | 1 | 23 | 966 |
| 7 | 270 | 60 | 5% | 13 | 2 | 34 | 1.428 |
| 8 | 340 | 70 | 5% | 17 | 2 | 49 | 2.058 |
| 9 | 420 | 80 | 5% | 21 | 3 | 67 | 2.814 |
| 10 | 510 | 90 | 5% | 25 | 5 | 87 | 3.654 |
| 11 | 610 | 100 | 5% | 30 | 6 | 111 | 4.662 |
| 12 | 720 | 110 | 5% | 36 | 8 | 139 | 5.838 |

**MRR B2C fine anno 1 (conservativo): ~5.800€**

### Studio (servizi)

| Mese | Audit 299€ | Prototipo 1.500€ | MVP 5.000€ | Manutenzione 500€ | Revenue Studio (€) |
|------|------------|------------------|------------|-------------------|---------------------|
| 1–2 | 0 | 0 | 0 | 0 | 0 |
| 3 | 1 | 0 | 0 | 0 | 299 |
| 4 | 1 | 0 | 0 | 0 | 299 |
| 5 | 1 | 1 | 0 | 0 | 1.799 |
| 6 | 1 | 0 | 0 | 1 | 799 |
| 7 | 2 | 0 | 1 | 1 | 2.098 |
| 8 | 1 | 1 | 0 | 2 | 2.000 |
| 9 | 2 | 0 | 0 | 2 | 1.598 |
| 10 | 1 | 1 | 1 | 2 | 7.299 |
| 11 | 2 | 0 | 0 | 3 | 2.098 |
| 12 | 1 | 1 | 0 | 3 | 2.299 |

**Revenue Studio anno 1 (conservativo): ~18.600€** (~1.550€/mese medio H2)

### Enterprise

| Trimestre | Deal | Valore annuo (€) | Revenue riconosciuto (€/mese) |
|-----------|------|------------------|-------------------------------|
| Q1–Q2 | 0 | 0 | 0 |
| Q3 | 1 incubatore (30 seat) | 3.600 | 300 |
| Q4 | 1 università (50 seat) | 5.000 | 417 |

**MRR Enterprise fine anno 1: ~717€**

### Riepilogo conservativo — mese 12

| Stream | MRR (€) | ARR run-rate (€) |
|--------|---------|------------------|
| B2C SaaS | 5.838 | 70.056 |
| Studio (media H2) | ~1.550 | ~18.600 |
| Enterprise | 717 | 8.600 |
| **Totale** | **~8.100** | **~97.300** |

---

## Scenario ottimistico

| Mese | Paganti B2C | MRR B2C (€) | Note |
|------|-------------|-------------|------|
| 6 | 45 | 1.890 | Product Hunt + 3 incubatori pilota |
| 9 | 120 | 5.040 | Conversion 8%, churn 5% |
| 12 | 220 | 9.240 | ARPU 42€ |

**Studio ottimistico anno 1:** ~35.000€ (8 audit, 4 prototipi, 2 MVP)

**Enterprise ottimistico:** 3 deal, ~1.500€ MRR entro mese 12

**MRR totale ottimistico mese 12: ~12.000€** (~144k€ ARR run-rate)

---

## Unit economics (steady state, mese 12 conservativo)

| Metrica | Valore |
|---------|--------|
| ARPU B2C | 42€/mese |
| Churn mensile | 7% |
| Lifetime (mesi) | ~14,3 |
| LTV B2C | ~600€ |
| CAC organico | 15€ |
| **LTV/CAC** | **40x** (organico early; paid ads riduce margine) |
| Gross margin SaaS | ~85% (infra + AI API) |
| Gross margin Studio | ~50% |

*Nota: LTV/CAC alto in fase organica è normale; con paid ads target LTV/CAC > 3x.*

---

## Cost structure mensile (post-funding, indicativo)

| Voce | €/mese |
|------|--------|
| Founder salary (1) | 3.000 |
| Engineer (1, da mese 4) | 4.500 |
| Infra (Supabase, Netlify, OpenAI) | 500–1.500 |
| Tooling & legal | 300 |
| Marketing (content, PH, events) | 1.000–2.000 |
| **Burn mensile** | **~9.300–11.300** |

**Runway con 250k€:** ~22–27 mesi a burn pieno; ~18 mesi con buffer marketing.

---

## Break-even indicativo

| Scenario | MRR break-even (~10k€ costi) |
|----------|------------------------------|
| Solo B2C (85% margin) | ~12.000€ MRR B2C |
| B2C + Studio + Enterprise | ~8.000–9.000€ MRR combinato |

Target realistico break-even operativo: **mese 14–18** (scenario conservativo).

---

## File dati

Vedi [`financial-model.csv`](./financial-model.csv) per tabella editabile in Excel/Sheets.
