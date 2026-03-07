# filecard.app 🃏

> Plataforma para colecionadores — catálogo, coleção pessoal e marketplace.

**Vertical de entrada:** GI Joe / Action Figures  
**Visão:** Todo o mercado de colecionáveis (Hot Wheels, Funko Pop, LEGO, Marvel Legends...)

---

## O que é

App mobile offline-first para colecionadores. Você cataloga sua coleção, descobre o valor de mercado dos seus itens e compra/vende com outros colecionadores.

## Stack (planejado)

- **Mobile:** React Native
- **Local DB:** SQLite (offline-first)
- **Backend:** Node.js + PostgreSQL
- **Auth:** Supabase
- **Pagamentos:** Stripe

## Schema (simplificado)

```
Category → Line → Series → Item → UserCollection
```

Ex: `Action Figures → GI Joe → ARAH 1982 → Snake Eyes v1`

## Gates

| Gate | Milestone |
|------|-----------|
| G0 | Validação (survey + WTP) |
| G1 | Fundação (auth + 100 items + CI) |
| G2 | Catálogo (500+ items + busca) |
| G3 | MVP (scan + beta testers) |
| G4 | Launch (app stores + Stripe) |
| G5 | PMF (5k users + 1k Pro) |

## Status

🟡 Fase -1 — Validação em andamento

---

*Domínio: filecard.app*
