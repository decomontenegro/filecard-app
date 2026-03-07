# Arquitetura — filecard.app

## Princípio central: offline-first

Colecionadores frequentam feiras e eventos sem internet. O app precisa funcionar completamente offline e sincronizar quando tiver conexão.

---

## Schema do Banco de Dados

### Hierarquia de catálogo (multi-categoria)

```
Categories
  id, name, slug, icon, description
  Ex: "Action Figures" | "Hot Wheels" | "Funko Pop" | "LEGO"

Lines
  id, category_id, name, manufacturer, country, year_start, year_end
  Ex: GI Joe (Hasbro, 1982) | Hot Wheels (Mattel, 1968)

Series
  id, line_id, name, year, wave, notes
  Ex: GI Joe ARAH 1982 | GI Joe Classified 2020

Items
  id, series_id, name, code, release_year
  variants[]       → ex: "swivel arm", "straight arm"
  photos[]         → press kit + UGC
  market_value     → estimado (eBay / ML médias)
  condition_grades → Mint, Near Mint, Good, Fair, Poor
```

### Coleção do usuário

```
UserCollection
  user_id, item_id
  condition        → enum
  paid_price       → quanto pagou
  acquired_date
  notes
  for_sale         → boolean
  asking_price     → se for_sale=true

MarketListing
  user_id, item_id, price, condition
  photos[]
  status           → active | sold | cancelled
```

---

## Stack

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Mobile | React Native | Cross-platform, ecossistema forte |
| Local DB | SQLite (via Expo SQLite) | Offline-first nativo |
| Backend | Node.js + PostgreSQL | Familiar, escalável |
| Auth | Supabase | Rápido de implementar |
| Pagamentos | Stripe | Padrão de mercado |
| Storage | Supabase Storage | Fotos UGC |
| CI/CD | GitHub Actions | Integrado ao repo |

---

## Expansão de categorias

Adicionar nova categoria = inserir dados, não modificar código.

Processo:
1. Inserir na tabela `Categories`
2. Inserir `Lines` e `Series` da categoria
3. Popular `Items` via script de importação
4. Publicar update do catálogo (over-the-air sync)

---

## Fotos

- **Layer 1:** Press kits oficiais (Hasbro, Bandai, Mattel...) — licença clara
- **Layer 2:** Fotos próprias das top figures
- **Layer 3:** UGC da comunidade (moderação manual inicial)

---

## Decisões pendentes (G1)

- [ ] Confirmar React Native vs Flutter
- [ ] ORM: Drizzle vs Prisma
- [ ] Sincronização offline: PowerSync vs WatermelonDB vs custom
- [ ] Estratégia de preço de mercado (eBay API vs scraping vs manual)
