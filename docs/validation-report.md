# Filecard Catalog Validation Report
Generated: 2026-04-14

## Summary

| Metric | Count |
|--------|-------|
| Total catalog_items | 231 |
| Items WITH image_url | 125 |
| Items WITHOUT image_url | 106 |
| Items WITH accessories | 183 |
| Items WITHOUT accessories | 48 |
| Items WITH item_variants | 231 |
| Items WITHOUT item_variants | 0 |
| Items WITH market_prices | 1 (only after test call) |
| Items WITHOUT market_prices | 230 |

## Year Distribution

| Year | Count |
|------|-------|
| 1982 | 17 |
| 1983 | 32 |
| 1984 | 12 |
| 1985 | 31 |
| 1986 | 36 |
| 1987 | 47 |
| 1988 | 3 |
| 1989 | 5 |
| 1990 | 11 |
| 1991 | 14 |
| 1992 | 14 |
| 1993 | 5 |
| 1995 | 4 |

## Rarity Distribution

| Rarity Level | Count |
|-------------|-------|
| 2 | 30 |
| 3 | 136 |
| 4 | 53 |
| 5 | 12 |

## Issues Found

### 🔴 Critical: 230/231 items have no market prices
- The `ebay-prices` Edge Function works correctly (tested — returns real eBay data).
- Only 1 item (Grunt, id=1) has prices after the test call.
- **Action needed:** Run the edge function for all items (in batches of 20) to seed prices.
- Can be done via a cron or a one-shot admin script.

### 🟡 Medium: 106/231 items missing `image_url`
- 46% of the catalog has no image.
- The UI gracefully shows a `?` placeholder when no image is present — app won't crash.
- **Action needed:** Manual curation — find/upload images for each figure.
- Earliest figures (1982 line: Grunt, Snake Eyes, Scarlett, etc.) are in this group.

### 🟡 Medium: 48/231 items missing accessories
- These are mostly Brazilian-exclusive figures from 1991-1993 era.
- Affected: COBRA PILOTO (1985), Duke (1984), MONKEYWRENCH (1991), TELE-VIPER (1991), etc.
- **Action needed:** Manual curation — research accessories for each figure.

### ✅ OK: All 231 items have item_variants
- Every catalog item has at least one variant entry. Good.

## Items Without Accessories (48 total)
IDs: 26, 47, 56, 57, 58, 59, 61, 63, 65, 67, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93...
(mostly 1991-1993 Brazilian editions)

## Recommended Curation Priority
1. **High priority (original 1982-1984 line):** 17+32+12 = 61 items — most well-known, most searched
2. **Medium priority (1985-1987):** 31+36+47 = 114 items — core collection era
3. **Low priority (1988-1995):** 3+5+11+14+14+5+4 = 56 items — rarer, less data available online

## Edge Function Status
- `ebay-prices`: **WORKING** ✅
- Uses real eBay Browse API (production mode)
- Returns USD prices converted to BRL at 5.0 rate (hardcoded — update periodically)
- Prices stored in `market_prices` table with 24h TTL
- To seed all prices: call edge function with auto-mode (no body) → processes up to 50 items per call
