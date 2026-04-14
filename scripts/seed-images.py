#!/usr/bin/env python3
"""
seed-images.py — Curadoria automática de imagens para figuras GI Joe ARAH
Fonte: Wikipedia API (sem bloqueio de servidor)
Re-executável: pula figuras que já têm image_url.
"""

import json
import time
import sys
import re
import urllib.request
import urllib.error
import urllib.parse

SUPABASE_URL = "https://kqvbdkukykyoozseluza.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDcwMzgsImV4cCI6MjA5MDI4MzAzOH0.DQwmnL2_cHKHlzm18cpn1y7WOn1OzK_kS140XsCZnJM"
# Service role key required for UPDATE (RLS bypasses anon key)
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcwNzAzOCwiZXhwIjoyMDkwMjgzMDM4fQ.MD8WoyDQEQFGI5wj11H1kdFLNkaKmxV68spicTuHzJ4"

# Mapeamento manual de nomes BR → nome EN (para figuras exclusivamente brasileiras)
BR_TO_EN = {
    "GLADION": "Cobra Commander",
    "DRAGON": "Storm Shadow",
    "TRITON": "Torpedo",
    "FALCON": "Falcon",
    "ELETRON": "Sci-Fi",
    "COBRA INVASOR": "Cobra",
    "COBRA OFICIAL": "Cobra Officer",
    "ATENA": "Lady Jaye",
    "FALCON PILOTO": "Airborne",
    "O INVASOR": "Cobra",
    "COBRA PILOTO": "Wild Weasel",
    "OLHOS DE FÊNIX": "Quick Kick",
    "DETEKTOR": "Flint",
    "TELE-MENTOR": "Dial-Tone",
    "MALIGNO": "Zartan",
    "DESARMER": "Blowtorch",
    "ARRAIA": "Lamprey",
    "ANTAR": "Alpine",
    "DRAGÃO BRANCO": "Storm Shadow",
    "ESTILHAÇO": "Shrapnel",
    "POLUIÇÃO": "Toxo-Viper",
    "FUMAÇA": "Scorch",
    "ZAP (v1A)": "Zap",
    "COBRA (v1.5)": "Cobra",
    "COBRA OFFICER (v1.5)": "Cobra Officer",
    "GRUNT (v1.5)": "Grunt",
    "STEELER (v1.5)": "Steeler",
    "CICLON": "Snake Eyes",
    "CROC MASTER": "Croc Master",
    "LETAL": "Jinx",
    "LAW & ORDER": "Law & Order",
    "LAW &amp; ORDER": "Law & Order",
    "OFICIAL COMBATENTE": "Cobra Soldier",
    "TIGRE DA SELVA": "Tiger Force",
    "COBRA ARMADURA": "Iron Grenadier",
    "COMANDO LONGO ALCANCE": "Long Range",
    "LÍDER DA FORÇA DESTRO": "Destro",
    "NAJA SABOTADOR": "Cobra Saboteur",
    "PILOTO DO FORÇA 2000 - A.T.A.C.": "Night Vulture",
    "PILOTO DO RESGATOR": "Lift-Ticket",
    "PILOTO DO ROTHOR": "Rip It",
    "TIGRE ANTI RADIAÇÃO": "Eco Warriors",
    "COMANDO BOMBEIRO": "Grunt",
    "COMANDO PARA-QUEDAS": "Airborne",
    "PILOTO DO D.E.M.O.N.": "Nullifier",
    "PILOTO DO FORÇA 2000 - U.L.T.R.A.": "Night Vulture",
    "RÉPTIL DO AR": "Sky Creeper",
    "TIRO CERTO": "Bullseye",
    "TOCHA": "Blowtorch",
    "SAQUEADOR": "Barbecue",
    "EXPLORADOR": "Recondo",
    "FORASTEIRO": "Spirit",
}

def supabase_get(path):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def supabase_patch(table, item_id, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{item_id}"
    payload = json.dumps(data).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return True
    except urllib.error.HTTPError as e:
        print(f"    PATCH error {e.code}: {e.read().decode()[:200]}")
        return False

def wikipedia_image(article_title):
    """Busca imagem na Wikipedia via REST API."""
    encoded = urllib.parse.quote(article_title.replace(" ", "_"))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "FilecardApp/1.0 (GI Joe catalog; contact@filecard.app)"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            img = data.get("originalimage", {}).get("source") or data.get("thumbnail", {}).get("source")
            return img
    except:
        return None

def wikipedia_search_image(query):
    """Busca na Wikipedia por query e pega imagem do primeiro resultado."""
    encoded = urllib.parse.quote(query)
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={encoded}&format=json&srlimit=3"
    req = urllib.request.Request(url, headers={
        "User-Agent": "FilecardApp/1.0 (GI Joe catalog; contact@filecard.app)"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            results = data.get("query", {}).get("search", [])
            for result in results:
                title = result.get("title", "")
                if "G.I. Joe" in title or "GI Joe" in title or "Joe" in title:
                    img = wikipedia_image(title)
                    if img:
                        return img
    except:
        pass
    return None

def find_image_for_figure(display_name, canonical_name, slug, year):
    """
    Tenta múltiplas estratégias para encontrar imagem.
    Retorna URL da imagem ou None.
    """
    # Estratégia 1: nome canônico direto na Wikipedia
    attempts = []

    # Mapear BR → EN se necessário
    en_name = BR_TO_EN.get(display_name) or BR_TO_EN.get(display_name.upper())
    if en_name:
        attempts.append(en_name)
    
    # Usar canonical_name
    if canonical_name:
        attempts.append(canonical_name)
        attempts.append(f"{canonical_name} (G.I. Joe)")
    
    # Usar slug sem o ano
    if slug:
        slug_name = slug.rsplit('-', 1)[0] if slug[-4:].isdigit() else slug
        slug_name = slug_name.replace('-', ' ').title()
        attempts.append(slug_name)
        attempts.append(f"{slug_name} (G.I. Joe)")

    # Tentar cada attempt
    seen = set()
    for attempt in attempts:
        if attempt in seen:
            continue
        seen.add(attempt)
        img = wikipedia_image(attempt)
        if img:
            return img, attempt
    
    # Estratégia 2: busca por nome + "GI Joe"
    search_name = en_name or canonical_name or display_name
    if search_name:
        img = wikipedia_search_image(f"{search_name} GI Joe action figure")
        if img:
            return img, f"search:{search_name}"
    
    return None, None

def main():
    print("=== Seed de Imagens — filecard.app ===\n")

    # 1. Buscar figuras sem imagem
    print("Buscando figuras sem imagem...")
    items = supabase_get("catalog_items?select=id,display_name,canonical_name,slug,year&image_url=is.null&limit=200")
    print(f"Total sem imagem: {len(items)}\n")

    found = 0
    not_found = []

    for idx, item in enumerate(items):
        iid = item['id']
        display = item['display_name']
        canonical = item.get('canonical_name', '')
        slug = item.get('slug', '')
        year = item.get('year', '')

        print(f"[{idx+1}/{len(items)}] {display} ({year})...", end=" ")

        img_url, source = find_image_for_figure(display, canonical, slug, year)

        if img_url:
            # Atualizar no Supabase
            ok = supabase_patch("catalog_items", iid, {"image_url": img_url})
            if ok:
                print(f"✅ (fonte: {source})")
                print(f"    URL: {img_url[:80]}...")
                found += 1
            else:
                print(f"❌ (falha no update)")
                not_found.append(display)
        else:
            print(f"⚠️  não encontrada")
            not_found.append(display)

        # Rate limit: pausa a cada request
        time.sleep(0.5)

    print(f"\n=== Resultado Final ===")
    print(f"Imagens encontradas e salvas: {found}")
    print(f"Figuras ainda sem imagem: {len(not_found)}")
    if not_found:
        print("\nFiguras sem imagem:")
        for name in not_found:
            print(f"  - {name}")

    # Salvar lista de não encontradas para referência
    with open('/tmp/images-not-found.txt', 'w') as f:
        f.write('\n'.join(not_found))
    print(f"\nLista salva em /tmp/images-not-found.txt")

if __name__ == "__main__":
    main()
