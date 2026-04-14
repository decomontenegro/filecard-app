#!/usr/bin/env python3
"""
Seed de preços para todos os itens do catálogo sem preço.
Envia em batches de 20 para a edge function ebay-prices.
Re-executável: pula itens que já têm preço recente.
"""

import json
import time
import sys
import urllib.request
import urllib.error

SUPABASE_URL = "https://kqvbdkukykyoozseluza.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDcwMzgsImV4cCI6MjA5MDI4MzAzOH0.DQwmnL2_cHKHlzm18cpn1y7WOn1OzK_kS140XsCZnJM"

def api_get(path):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def call_edge_function(items_batch):
    """Call ebay-prices with a specific batch of items."""
    url = f"{SUPABASE_URL}/functions/v1/ebay-prices"
    payload = json.dumps({"items": items_batch}).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP {e.code}: {body[:200]}")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    print("=== Seed de Preços — filecard.app ===\n")

    # 1. Buscar todos os itens do catálogo
    print("Buscando todos os itens do catálogo...")
    all_items = api_get("catalog_items?select=id,display_name&limit=300")
    print(f"Total de itens: {len(all_items)}")

    # 2. Buscar itens que já têm preço
    print("Verificando quais já têm preço...")
    priced_records = api_get("market_prices?select=catalog_item_id&limit=1000")
    priced_ids = set(r['catalog_item_id'] for r in priced_records)
    print(f"Itens com preço: {len(priced_ids)}")

    # 3. Filtrar itens sem preço
    items_without_price = [
        item for item in all_items
        if item['id'] not in priced_ids
    ]
    print(f"Itens sem preço: {len(items_without_price)}")

    if not items_without_price:
        print("\n✅ Todos os itens já têm preço!")
        return

    # 4. Processar em batches de 20
    batch_size = 20
    total_updated = 0
    failed_batches = []

    for batch_start in range(0, len(items_without_price), batch_size):
        batch = items_without_price[batch_start:batch_start + batch_size]
        batch_items = [
            {
                "catalog_item_id": str(item['id']),
                "condition_grade": "C8",
                "name": item['display_name']
            }
            for item in batch
        ]

        names = [b['name'] for b in batch_items]
        print(f"\nBatch {batch_start//batch_size + 1}: {names[:3]}{'...' if len(names) > 3 else ''}")

        result = call_edge_function(batch_items)
        if result:
            updated = result.get('updated', 0)
            total_updated += updated
            print(f"  ✅ {updated} preços adicionados")
            if result.get('error'):
                print(f"  ⚠️  Erro: {result['error']}")
        else:
            failed_batches.extend([b['name'] for b in batch_items])
            print(f"  ❌ Batch falhou")

        time.sleep(3)  # Respeitar rate limits

    print(f"\n=== Resultado Final ===")
    print(f"Total de preços adicionados: {total_updated}")
    if failed_batches:
        print(f"Itens em batches que falharam ({len(failed_batches)}):")
        for name in failed_batches:
            print(f"  - {name}")

    # 5. Verificar estado final
    priced_final = api_get("market_prices?select=catalog_item_id&limit=1000")
    priced_final_ids = set(r['catalog_item_id'] for r in priced_final)
    still_without = [
        item for item in all_items
        if item['id'] not in priced_final_ids
    ]
    print(f"\nEstado final:")
    print(f"  Com preço: {len(priced_final_ids)}")
    print(f"  Sem preço: {len(still_without)}")
    if still_without:
        print("  Ainda sem preço:")
        for item in still_without:
            print(f"    - {item['display_name']} (id={item['id']})")

if __name__ == "__main__":
    main()
