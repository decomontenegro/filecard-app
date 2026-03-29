#!/usr/bin/env python3
"""Seed item_variants and accessories for filecard.app GI Joe ARAH database. v2 - correct schema."""

import json
import urllib.request
import urllib.error
import time

BASE_URL = "https://kqvbdkukykyoozseluza.supabase.co/rest/v1"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcwNzAzOCwiZXhwIjoyMDkwMjgzMDM4fQ.MD8WoyDQEQFGI5wj11H1kdFLNkaKmxV68spicTuHzJ4"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDcwMzgsImV4cCI6MjA5MDI4MzAzOH0.DQwmnL2_cHKHlzm18cpn1y7WOn1OzK_kS140XsCZnJM"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# confidence_level: 1-10 integer (high=9, medium=7, low=5)
CONF = {"high": 9, "medium": 7, "low": 5}

def post(endpoint, payload):
    url = f"{BASE_URL}/{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR {e.code}: {body[:300]}")
        return None

# ============================================================
# ITEM VARIANTS
# confidence_level is INTEGER (use CONF mapping)
# columns: catalog_item_id, variant_name, variant_type, region, distinguishing_features, notes, confidence_level
# ============================================================
VARIANT_DATA = {
    "Grunt": [
        {"variant_name": "Grunt v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm, non-swivel; brown helmet", "notes": "First version, 1982", "confidence_level": CONF["high"]},
        {"variant_name": "Grunt v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm battle grip, same card", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Snake Eyes": [
        {"variant_name": "Snake Eyes v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; all-black body with silver highlights; molded visor", "notes": "Original 1982 release", "confidence_level": CONF["high"]},
        {"variant_name": "Snake Eyes v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; slightly different plastic colors", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Scarlett": [
        {"variant_name": "Scarlett v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; crossbow; tan uniform", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Scarlett v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Breaker": [
        {"variant_name": "Breaker v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; large backpack; comm gear", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Breaker v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Short-Fuze": [
        {"variant_name": "Short-Fuze v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; mortar backpack", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Short-Fuze v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Rock N Roll": [
        {"variant_name": "Rock 'N Roll v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; M60 machine gun; bandolier", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Rock 'N Roll v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Flash": [
        {"variant_name": "Flash v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; laser rifle; orange visor", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Flash v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Zap": [
        {"variant_name": "Zap v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; bazooka; green beret", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Zap v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Cobra Commander": [
        {"variant_name": "Cobra Commander v1 Hood (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Cloth hood version; straight arm; blue uniform", "notes": "1982 original — Hood variant", "confidence_level": CONF["high"]},
        {"variant_name": "Cobra Commander v1B Helmet (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Battle helmet; straight arm; blue uniform", "notes": "1982 alternate helmet version", "confidence_level": CONF["high"]},
        {"variant_name": "Cobra Commander v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; Comandante Cobra naming", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Stalker": [
        {"variant_name": "Stalker v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; green beret; AK-like rifle", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Stalker v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Cobra": [
        {"variant_name": "Cobra Trooper v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; blue uniform; standard Cobra soldier", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Cobra Trooper v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Cobra Officer": [
        {"variant_name": "Cobra Officer v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; dark blue uniform; officer rank markings", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Cobra Officer v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Hawk": [
        {"variant_name": "Hawk v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; field commander", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Hawk v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Clutch": [
        {"variant_name": "Clutch v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; VAMP driver", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Clutch v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    "Steeler": [
        {"variant_name": "Steeler v1 (Straight-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Straight arm; MOBAT tank commander", "notes": "1982 original", "confidence_level": CONF["high"]},
        {"variant_name": "Steeler v1.5 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Swivel arm, same mold", "notes": "1983 running change", "confidence_level": CONF["high"]},
    ],
    # 1983
    "Destro": [
        {"variant_name": "Destro v1 (Swivel-Arm)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Red shirt; chrome head; pistol + briefcase", "notes": "1983 original swivel-arm", "confidence_level": CONF["high"]},
        {"variant_name": "Destro v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; Destro name retained", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Major Bludd": [
        {"variant_name": "Major Bludd v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Mercenary; robotic arm; tan uniform", "notes": "1983 original", "confidence_level": CONF["high"]},
    ],
    "Gung-Ho": [
        {"variant_name": "Gung-Ho v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Marine; open vest; tattoo on chest; M79 grenade launcher", "notes": "1983 original", "confidence_level": CONF["high"]},
        {"variant_name": "Gung-Ho v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Duke": [
        {"variant_name": "Duke v1 (Mail-away)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Mail-away 1983; blonde hair; rifle + backpack", "notes": "First release mail-away 1983, carded 1984", "confidence_level": CONF["high"]},
        {"variant_name": "Duke v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; Duke name retained", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Snow Job": [
        {"variant_name": "Snow Job v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "White ski suit; skis; poles; winter sniper rifle", "notes": "1983 original", "confidence_level": CONF["high"]},
    ],
    "Torpedo": [
        {"variant_name": "Torpedo v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Navy SEAL; black wetsuit; spear gun + rebreather", "notes": "1983 original", "confidence_level": CONF["high"]},
    ],
    "Doc": [
        {"variant_name": "Doc v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Medic; white cross insignia; medical kit backpack", "notes": "1983 original", "confidence_level": CONF["high"]},
    ],
    "Tripwire": [
        {"variant_name": "Tripwire v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "EOD; mine detector; helmet; padded suit", "notes": "1983 original", "confidence_level": CONF["high"]},
    ],
    "Airborne": [
        {"variant_name": "Airborne v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Helicopter assault; helmet; rifle; parachute backpack", "notes": "1983 original", "confidence_level": CONF["high"]},
    ],
    # 1984
    "Baroness": [
        {"variant_name": "Baroness v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Black bodysuit; glasses; sidearm; backpack laser", "notes": "1984 original", "confidence_level": CONF["high"]},
        {"variant_name": "Baroness v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; Baronesa name", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Storm Shadow": [
        {"variant_name": "Storm Shadow v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "White ninja outfit; nunchucks; swords; bow; quiver backpack", "notes": "1984 original", "confidence_level": CONF["high"]},
        {"variant_name": "Storm Shadow v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Zartan": [
        {"variant_name": "Zartan v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Color-changing plastic; hood; swamp skis; backpack", "notes": "1984 original — color change in sunlight", "confidence_level": CONF["high"]},
        {"variant_name": "Zartan v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; color change may vary", "notes": "Brazilian Estrela release", "confidence_level": CONF["medium"]},
    ],
    "Spirit": [
        {"variant_name": "Spirit v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Native American tracker; eagle Freedom figurine; rifle", "notes": "1984 original", "confidence_level": CONF["high"]},
    ],
    "Roadblock": [
        {"variant_name": "Roadblock v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Heavy MG gunner; M2 .50cal + tripod; green fatigues", "notes": "1984 original", "confidence_level": CONF["high"]},
        {"variant_name": "Roadblock v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard; Bloqueio name", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    # 1985
    "Snake Eyes v2": [
        {"variant_name": "Snake Eyes v2 (1985)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Updated black uniform with padding; Timber Wolf; uzi + backpack + knife", "notes": "1985 updated sculpt, comic-famous look", "confidence_level": CONF["high"]},
    ],
    "Lady Jaye": [
        {"variant_name": "Lady Jaye v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Covert operative; javelin launcher + javelins; camera bag", "notes": "1985 original", "confidence_level": CONF["high"]},
        {"variant_name": "Lady Jaye v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Flint": [
        {"variant_name": "Flint v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Warrant officer; beret; shotgun; khaki uniform", "notes": "1985 original", "confidence_level": CONF["high"]},
        {"variant_name": "Flint v1 Estrela BR", "variant_type": "regional", "region": "BR",
         "distinguishing_features": "Estrela card; Portuguese filecard", "notes": "Brazilian Estrela release", "confidence_level": CONF["high"]},
    ],
    "Airtight": [
        {"variant_name": "Airtight v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Chemical warfare trooper; yellow/green suit; air tanks backpack", "notes": "1985 original", "confidence_level": CONF["high"]},
    ],
    "Alpine": [
        {"variant_name": "Alpine v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Mountain trooper; climbing axe; rope; backpack", "notes": "1985 original", "confidence_level": CONF["high"]},
    ],
    "Crimson Guard": [
        {"variant_name": "Crimson Guard v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Cobra elite soldier; crimson uniform; rifle + backpack", "notes": "1985 original", "confidence_level": CONF["high"]},
        {"variant_name": "Crimson Guard v1A (Siegie) - Tomax/Xamot set", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Packaged with Tomax and Xamot twin commanders", "notes": "Also sold separately", "confidence_level": CONF["medium"]},
    ],
    "Shipwreck": [
        {"variant_name": "Shipwreck v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Sailor; navy uniform; pistol; Polly parrot figurine", "notes": "1985 original", "confidence_level": CONF["high"]},
    ],
    "Quick Kick": [
        {"variant_name": "Quick Kick v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Martial artist; bare-chested; sword + backpack", "notes": "1985 original", "confidence_level": CONF["high"]},
    ],
    "Dusty": [
        {"variant_name": "Dusty v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Desert trooper; tan camo; rifle + backpack", "notes": "1985 original", "confidence_level": CONF["high"]},
    ],
    # 1986
    "Leatherneck": [
        {"variant_name": "Leatherneck v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Marine; green fatigues; M16 + bayonet + backpack", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Lifeline": [
        {"variant_name": "Lifeline v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Medic; red cross; stretcher + medical backpack; pacifist", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "General Hawk": [
        {"variant_name": "General Hawk v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "GI Joe commander; beret; pistol + backpack", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Serpentor": [
        {"variant_name": "Serpentor v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Cobra Emperor; snake armor; cobra-head javelin; air chariot rider", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Beach Head": [
        {"variant_name": "Beach Head v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Army Ranger; balaclava; M16 + knife + backpack", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Low-Light": [
        {"variant_name": "Low-Light v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Night spotter; grey/black; night-vision rifle + backpack", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Sci-Fi": [
        {"variant_name": "Sci-Fi v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Laser trooper; neon green armor; laser rifle + power backpack", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Wet-Suit": [
        {"variant_name": "Wet-Suit v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "SEAL; blue wetsuit; spear gun + dive tanks", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "B.A.T.S.": [
        {"variant_name": "B.A.T. v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Battle Android Trooper; 3 interchangeable arm weapons; robot chest panel", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    "Iceberg": [
        {"variant_name": "Iceberg v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Winter trooper; white parka; rifle + backpack", "notes": "1986 original", "confidence_level": CONF["high"]},
    ],
    # 1987
    "Jinx": [
        {"variant_name": "Jinx v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Ninja intelligence; pink/red outfit; sword + knife + backpack", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Tunnel Rat": [
        {"variant_name": "Tunnel Rat v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "EOD/tunnel specialist; cap; machine gun + bomb bag", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Falcon": [
        {"variant_name": "Falcon v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Green Beret; beret; shotgun + backpack", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Fast Draw": [
        {"variant_name": "Fast Draw v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Mobile missile specialist; rocket launcher on back; visor; backpack", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Outback": [
        {"variant_name": "Outback v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Survivalist; boonie hat; rifle + survival backpack", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Big Boa": [
        {"variant_name": "Big Boa v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Cobra PT instructor; boxing gloves + whistle backpack", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Croc Master": [
        {"variant_name": "Croc Master v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Crocodile trainer; pistol + croc figurine + leash + backpack", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    "Crystal Ball": [
        {"variant_name": "Crystal Ball v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Cobra hypnotist; crystal ball + cape", "notes": "1987 original", "confidence_level": CONF["high"]},
    ],
    # 1988
    "Shockwave": [
        {"variant_name": "Shockwave v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "SWAT; black/grey tactical gear; SMG + ballistic shield + backpack", "notes": "1988 original", "confidence_level": CONF["high"]},
    ],
    "Iron Grenadier": [
        {"variant_name": "Iron Grenadier v1", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Destro elite; black/gold armor; pistol + helmet + backpack", "notes": "1988 original", "confidence_level": CONF["high"]},
    ],
    # 1989
    "Snake Eyes v3": [
        {"variant_name": "Snake Eyes v3 (1989)", "variant_type": "production_run", "region": "US",
         "distinguishing_features": "Updated sculpt; commando look; uzi + knife + backpack", "notes": "1989 release", "confidence_level": CONF["high"]},
    ],
}

# ============================================================
# ACCESSORIES
# Schema: catalog_item_id, name, accessory_type, required_for_complete, rarity_level, notes, display_order
# accessory_type: use free-form text matching ARAH conventions (weapon, gear, figure, vehicle_part, other)
# rarity_level: integer 1-10 (1=common, 10=extremely rare)
# ============================================================
ACCESSORIES_DATA = {
    # 1982
    1: [  # Grunt
        {"name": "M16 Rifle (Black)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Standard black M16", "display_order": 1},
        {"name": "Grunt Backpack (Green)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Standard green backpack", "display_order": 2},
        {"name": "Green Helmet", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Molded olive green infantry helmet", "display_order": 3},
    ],
    2: [  # Snake Eyes v1
        {"name": "Uzi Submachine Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black Uzi", "display_order": 1},
        {"name": "Snake Eyes Backpack (Black)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Black commando backpack", "display_order": 2},
        {"name": "Commando Knife", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Small black combat knife", "display_order": 3},
    ],
    3: [  # Scarlett
        {"name": "Crossbow", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Tan/brown crossbow", "display_order": 1},
        {"name": "Scarlett Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Tan backpack with quiver detail", "display_order": 2},
    ],
    4: [  # Breaker
        {"name": "M32 Pulverizer (Submachine Gun)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Black SMG", "display_order": 1},
        {"name": "Breaker Large Backpack (Grey)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Large grey communications backpack", "display_order": 2},
    ],
    5: [  # Short-Fuze
        {"name": "Mortar Tube", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black mortar barrel", "display_order": 1},
        {"name": "Mortar Bipod", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black bipod support", "display_order": 2},
        {"name": "Short-Fuze Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Ammo carrier backpack", "display_order": 3},
    ],
    6: [  # Rock N Roll
        {"name": "M60 Machine Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Large black M60", "display_order": 1},
        {"name": "Machine Gun Bipod", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Bipod for M60", "display_order": 2},
        {"name": "Ammo Bandolier Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Backpack with molded ammo bandolier", "display_order": 3},
    ],
    7: [  # Flash
        {"name": "WP-2 Laser Rifle (Molded)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Futuristic laser rifle, black", "display_order": 1},
        {"name": "Flash Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Laser power backpack", "display_order": 2},
        {"name": "Arm Shield (Laser Deflector)", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 6, "notes": "Optional arm guard — often lost", "display_order": 3},
    ],
    8: [  # Zap
        {"name": "M72A2 LAW Bazooka", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Shoulder-launched anti-tank rocket", "display_order": 1},
        {"name": "Zap Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Green backpack", "display_order": 2},
    ],
    9: [  # Cobra Commander
        {"name": "Cobra Commander Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Black sidearm", "display_order": 1},
        {"name": "Attache Case / Briefcase", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Black briefcase — frequently lost", "display_order": 2},
    ],
    31: [  # Stalker
        {"name": "AK-47 Assault Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Black AK-47", "display_order": 1},
        {"name": "Stalker Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Green backpack", "display_order": 2},
        {"name": "Green Beret", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Small green beret — easily lost", "display_order": 3},
    ],
    32: [  # Cobra Trooper
        {"name": "Cobra Pistol (Black)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Standard Cobra sidearm", "display_order": 1},
        {"name": "Cobra Backpack (Blue)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Blue Cobra backpack", "display_order": 2},
    ],
    33: [  # Cobra Officer
        {"name": "Cobra Officer Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Dark blue sidearm", "display_order": 1},
        {"name": "Cobra Officer Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Dark blue backpack", "display_order": 2},
    ],
    # 1983
    10: [  # Destro
        {"name": "Destro Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Unique Destro sidearm", "display_order": 1},
        {"name": "Destro Briefcase", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Black briefcase with weapons — often lost", "display_order": 2},
    ],
    11: [  # Major Bludd
        {"name": "Wrist Rocket Launcher", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Unique single-shot wrist launcher", "display_order": 1},
        {"name": "Major Bludd Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Ammo backpack", "display_order": 2},
    ],
    28: [  # Gung-Ho
        {"name": "M79 Grenade Launcher", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Break-open grenade launcher", "display_order": 1},
        {"name": "Gung-Ho Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Ammo/gear backpack", "display_order": 2},
    ],
    91: [  # Snow Job
        {"name": "Sniper Rifle (Winter)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "White winter sniper rifle", "display_order": 1},
        {"name": "Skis (2 pieces)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "White/grey skis — frequently lost", "display_order": 2},
        {"name": "Ski Poles (2 pieces)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "White ski poles — frequently lost", "display_order": 3},
        {"name": "Snow Job Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "White winter backpack", "display_order": 4},
    ],
    92: [  # Torpedo
        {"name": "Spear Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black spear gun for underwater ops", "display_order": 1},
        {"name": "Rebreather Tank Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Black dive backpack with tanks", "display_order": 2},
    ],
    86: [  # Doc
        {"name": "Medical Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Large white/grey medical bag", "display_order": 1},
        {"name": "Stretcher", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 5, "notes": "Folding stretcher — often lost", "display_order": 2},
    ],
    93: [  # Tripwire
        {"name": "Mine Detector (Wand)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Metal detector wand", "display_order": 1},
        {"name": "Tripwire Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "EOD gear backpack", "display_order": 2},
    ],
    100: [  # Duke
        {"name": "M-16 Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Standard rifle", "display_order": 1},
        {"name": "Duke Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Field backpack", "display_order": 2},
        {"name": "Helmet", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 4, "notes": "Combat helmet — not always included", "display_order": 3},
    ],
    # 1984
    12: [  # Baroness
        {"name": "Baroness Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Unique black pistol", "display_order": 1},
        {"name": "Laser Rifle Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Black backpack with laser rifle mount — frequently lost", "display_order": 2},
    ],
    13: [  # Storm Shadow
        {"name": "Long Sword (Katana)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "White katana", "display_order": 1},
        {"name": "Short Sword (Wakizashi)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "White wakizashi — frequently lost", "display_order": 2},
        {"name": "Nunchucks", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "White nunchucks — frequently lost", "display_order": 3},
        {"name": "Bow", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "White bow — frequently lost", "display_order": 4},
        {"name": "Quiver Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "White quiver backpack with arrows", "display_order": 5},
    ],
    14: [  # Zartan
        {"name": "Zartan Hood/Mask", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 6, "notes": "Soft goods hood — frequently torn or lost", "display_order": 1},
        {"name": "Swamp Skis (2 pieces)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Blue/grey swamp skis", "display_order": 2},
        {"name": "Swamp Ski Handles (2 pieces)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 6, "notes": "Small handles for skis — very easily lost", "display_order": 3},
        {"name": "Zartan Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Swamp/field backpack", "display_order": 4},
        {"name": "Cobra Dreadnok Chest Armor", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 6, "notes": "Optional chest armor piece", "display_order": 5},
    ],
    25: [  # Spirit
        {"name": "Assault Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Brown rifle", "display_order": 1},
        {"name": "Freedom (Eagle figurine)", "accessory_type": "other", "required_for_complete": True, "rarity_level": 6, "notes": "Small eagle figure — very easily lost", "display_order": 2},
        {"name": "Spirit Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Field backpack", "display_order": 3},
    ],
    27: [  # Roadblock
        {"name": "M2 .50-Caliber Heavy Machine Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Large black M2 HMG", "display_order": 1},
        {"name": "Machine Gun Tripod", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Black tripod mount — often lost", "display_order": 2},
        {"name": "Roadblock Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Ammo carrier backpack", "display_order": 3},
    ],
    # 1985
    15: [  # Snake Eyes v2
        {"name": "Uzi Submachine Gun (Grey)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Grey Uzi, updated version", "display_order": 1},
        {"name": "Snake Eyes v2 Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Black commando backpack v2", "display_order": 2},
        {"name": "Timber (Wolf figurine)", "accessory_type": "other", "required_for_complete": True, "rarity_level": 6, "notes": "Grey wolf figure — very easily lost", "display_order": 3},
        {"name": "Commando Knife", "accessory_type": "weapon", "required_for_complete": False, "rarity_level": 5, "notes": "Small knife", "display_order": 4},
    ],
    29: [  # Lady Jaye
        {"name": "Javelin Launcher", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Unique javelin launching weapon", "display_order": 1},
        {"name": "Javelins x3", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 6, "notes": "3 small javelins — very easily lost", "display_order": 2},
        {"name": "Camera Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Covert ops camera bag", "display_order": 3},
    ],
    30: [  # Flint
        {"name": "Remington 870 Shotgun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black pump-action shotgun", "display_order": 1},
        {"name": "Flint Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Field backpack", "display_order": 2},
    ],
    118: [  # Airtight
        {"name": "Chemical Warfare Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Unique green chemical sprayer rifle", "display_order": 1},
        {"name": "Air Tank Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Yellow air tanks / decontamination backpack", "display_order": 2},
    ],
    119: [  # Alpine
        {"name": "Climbing Axe / Ice Axe", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black climbing tool / weapon", "display_order": 1},
        {"name": "Climbing Rope with Hook", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Rope + grappling hook — often lost", "display_order": 2},
        {"name": "Alpine Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Mountain climbing backpack", "display_order": 3},
    ],
    121: [  # Crimson Guard
        {"name": "Crimson Guard Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Red/crimson assault rifle", "display_order": 1},
        {"name": "Crimson Guard Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Red backpack", "display_order": 2},
    ],
    126: [  # Shipwreck
        {"name": "Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black navy pistol", "display_order": 1},
        {"name": "Polly (Parrot figurine)", "accessory_type": "other", "required_for_complete": True, "rarity_level": 6, "notes": "Green/yellow parrot — very easily lost", "display_order": 2},
        {"name": "Shipwreck Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Navy gear backpack", "display_order": 3},
    ],
    125: [  # Ripper (Dreadnoks)
        {"name": "XMLR-3A Laser Carbine (Jaws of Death)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Unique Dreadnok weapon", "display_order": 1},
        {"name": "Ripper Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Dreadnok gear backpack", "display_order": 2},
    ],
    130: [  # Torch (Dreadnoks)
        {"name": "Blowtorch Weapon", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Unique Dreadnok blowtorch", "display_order": 1},
        {"name": "Torch Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Dreadnok gear backpack", "display_order": 2},
    ],
    # 1986
    16: [  # Leatherneck
        {"name": "M16 Assault Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Black M16", "display_order": 1},
        {"name": "Combat Bayonet/Knife", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Small combat knife", "display_order": 2},
        {"name": "Leatherneck Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Marine field backpack", "display_order": 3},
    ],
    17: [  # Lifeline
        {"name": "Medical Backpack (Red Cross)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "White medical backpack", "display_order": 1},
        {"name": "Stretcher", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Folding stretcher", "display_order": 2},
        {"name": "Pistol", "accessory_type": "weapon", "required_for_complete": False, "rarity_level": 4, "notes": "Pacifist medic rarely armed but pistol included", "display_order": 3},
    ],
    18: [  # General Hawk
        {"name": "Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Commander sidearm", "display_order": 1},
        {"name": "General Hawk Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Command backpack", "display_order": 2},
    ],
    19: [  # Serpentor
        {"name": "Cobra-Headed Javelin", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Gold cobra-head spear — often lost", "display_order": 1},
        {"name": "Serpentor Shoulder Armor (Snake)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Removable serpent shoulder piece", "display_order": 2},
        {"name": "Cape (soft goods)", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 6, "notes": "Cobra Emperor cape — fragile, often torn/lost", "display_order": 3},
    ],
    139: [  # Beach Head
        {"name": "M16 Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Black M16", "display_order": 1},
        {"name": "Combat Knife", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Small combat knife", "display_order": 2},
        {"name": "Beach Head Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Ranger field backpack", "display_order": 3},
    ],
    143: [  # Low-Light
        {"name": "Sniper Rifle with Night Sight", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black sniper rifle with scope", "display_order": 1},
        {"name": "Low-Light Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Night ops backpack", "display_order": 2},
    ],
    147: [  # Sci-Fi
        {"name": "Laser Rifle (Neon Green)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Bright green laser rifle", "display_order": 1},
        {"name": "Power Pack Backpack (Neon Green)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Green power backpack for laser", "display_order": 2},
    ],
    149: [  # Wet-Suit
        {"name": "Spear Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Blue spear gun", "display_order": 1},
        {"name": "Dive Tank Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Blue wetsuit dive tanks", "display_order": 2},
        {"name": "Flippers (2 pieces)", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 5, "notes": "Rubber flippers — often lost", "display_order": 3},
    ],
    138: [  # B.A.T.S.
        {"name": "Laser Arm Attachment", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Right arm laser — interchangeable", "display_order": 1},
        {"name": "Claw Arm Attachment", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Right arm claw — interchangeable", "display_order": 2},
        {"name": "Flamethrower Arm Attachment", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Right arm flamethrower — interchangeable", "display_order": 3},
        {"name": "BAT Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Android trooper backpack", "display_order": 4},
    ],
    142: [  # Iceberg
        {"name": "Winter Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "White/grey winter sniper rifle", "display_order": 1},
        {"name": "Iceberg Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "White winter backpack", "display_order": 2},
    ],
    # 1987
    20: [  # Jinx
        {"name": "Sword", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Pink/red ninja sword — often lost", "display_order": 1},
        {"name": "Knife", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Small combat knife", "display_order": 2},
        {"name": "Jinx Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Ninja ops backpack", "display_order": 3},
    ],
    21: [  # Tunnel Rat
        {"name": "Machine Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black SMG/machine pistol", "display_order": 1},
        {"name": "Bomb/Explosives Bag", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Small explosives satchel", "display_order": 2},
        {"name": "Flashlight", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 5, "notes": "Small flashlight accessory — often lost", "display_order": 3},
    ],
    179: [  # Falcon
        {"name": "Shotgun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black pump shotgun", "display_order": 1},
        {"name": "Falcon Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Green Beret field backpack", "display_order": 2},
    ],
    180: [  # Fast Draw
        {"name": "Shoulder-Launched Rocket System", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Back-mounted rocket launcher system", "display_order": 1},
        {"name": "Fast Draw Backpack with Rockets", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Backpack that holds rockets — complex assembly", "display_order": 2},
    ],
    183: [  # Outback
        {"name": "Assault Rifle", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 3, "notes": "Black rifle", "display_order": 1},
        {"name": "Survival Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 3, "notes": "Large survival kit backpack", "display_order": 2},
    ],
    166: [  # Big Boa
        {"name": "Boxing Gloves (Left)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Red boxing glove — unique to Big Boa", "display_order": 1},
        {"name": "Boxing Gloves (Right)", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Red boxing glove — unique to Big Boa", "display_order": 2},
        {"name": "Big Boa Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Training backpack", "display_order": 3},
    ],
    168: [  # Cobra Commander v3 (Battle Armor)
        {"name": "Battle Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black pistol", "display_order": 1},
        {"name": "Battle Armor Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Armor-plated backpack", "display_order": 2},
    ],
    170: [  # Croc Master
        {"name": "Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black sidearm", "display_order": 1},
        {"name": "Crocodile Figurine", "accessory_type": "other", "required_for_complete": True, "rarity_level": 6, "notes": "Green croc figure — very easily lost", "display_order": 2},
        {"name": "Leash", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 7, "notes": "Rubber leash for croc — very easily lost", "display_order": 3},
        {"name": "Croc Master Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Swamp ops backpack", "display_order": 4},
    ],
    173: [  # Crystal Ball
        {"name": "Crystal Ball (clear sphere)", "accessory_type": "other", "required_for_complete": True, "rarity_level": 7, "notes": "Clear plastic sphere — very easily lost", "display_order": 1},
        {"name": "Crystal Ball Stand", "accessory_type": "other", "required_for_complete": True, "rarity_level": 7, "notes": "Clear stand — very easily lost", "display_order": 2},
        {"name": "Shield / Cape (soft goods)", "accessory_type": "gear", "required_for_complete": False, "rarity_level": 6, "notes": "Cloth shield — often torn/lost", "display_order": 3},
    ],
    # 1988
    22: [  # Shockwave
        {"name": "MP5 Submachine Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black tactical SMG", "display_order": 1},
        {"name": "Ballistic Shield", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "SWAT-style shield", "display_order": 2},
        {"name": "Shockwave Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "SWAT gear backpack", "display_order": 3},
    ],
    23: [  # Iron Grenadier
        {"name": "Iron Grenadier Pistol", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Gold/black sidearm", "display_order": 1},
        {"name": "Iron Grenadier Helmet (Gold)", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 5, "notes": "Iconic gold helmet — often lost", "display_order": 2},
        {"name": "Iron Grenadier Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Black/gold backpack", "display_order": 3},
    ],
    # 1989
    24: [  # Snake Eyes v3
        {"name": "Uzi Submachine Gun", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 4, "notes": "Black Uzi", "display_order": 1},
        {"name": "Combat Knife", "accessory_type": "weapon", "required_for_complete": True, "rarity_level": 5, "notes": "Small black knife", "display_order": 2},
        {"name": "Snake Eyes v3 Backpack", "accessory_type": "gear", "required_for_complete": True, "rarity_level": 4, "notes": "Commando backpack v3", "display_order": 3},
    ],
}

def main():
    print("=== Loading catalog items ===")
    url = f"{BASE_URL}/catalog_items?select=id,display_name,year&order=year.asc"
    req = urllib.request.Request(url, headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        catalog = json.loads(resp.read())
    print(f"Total catalog items: {len(catalog)}")

    # ---- VARIANTS ----
    print("\n=== Building variants ===")
    all_variants = []
    variant_report = {}

    for item in catalog:
        item_id = item["id"]
        item_name = item["display_name"]
        
        variants_for_item = VARIANT_DATA.get(item_name)
        if variants_for_item is None:
            base = item_name.split(" v")[0].strip()
            variants_for_item = VARIANT_DATA.get(base)
        
        if variants_for_item:
            for v in variants_for_item:
                all_variants.append({"catalog_item_id": item_id, **v})
            variant_report[item_name] = len(variants_for_item)
        else:
            all_variants.append({
                "catalog_item_id": item_id,
                "variant_name": f"{item_name} (Standard US)",
                "variant_type": "production_run",
                "region": "US",
                "distinguishing_features": "Standard US production release",
                "notes": f"{item['year']} release",
                "confidence_level": CONF["medium"]
            })
            variant_report[item_name] = 1

    print(f"Total variants to insert: {len(all_variants)}")
    total_v = 0
    for i in range(0, len(all_variants), 50):
        batch = all_variants[i:i+50]
        result = post("item_variants", batch)
        if result is None:
            print(f"  ERROR on batch {i//50+1}")
        else:
            n = len(result) if isinstance(result, list) else len(batch)
            total_v += n
            print(f"  Batch {i//50+1}: inserted {n}")
        time.sleep(0.2)
    print(f"Total variants inserted: {total_v}")

    # ---- ACCESSORIES ----
    print("\n=== Building accessories ===")
    all_acc = []
    acc_report = {}
    cat_id_to_name = {i["id"]: i["display_name"] for i in catalog}

    for item_id, accessories in ACCESSORIES_DATA.items():
        item_name = cat_id_to_name.get(item_id, f"id:{item_id}")
        for acc in accessories:
            all_acc.append({"catalog_item_id": item_id, **acc})
        acc_report[item_name] = len(accessories)

    print(f"Total accessories to insert: {len(all_acc)}")
    total_a = 0
    for i in range(0, len(all_acc), 50):
        batch = all_acc[i:i+50]
        result = post("accessories", batch)
        if result is None:
            print(f"  ERROR on batch {i//50+1}")
        else:
            n = len(result) if isinstance(result, list) else len(batch)
            total_a += n
            print(f"  Batch {i//50+1}: inserted {n}")
        time.sleep(0.2)
    print(f"Total accessories inserted: {total_a}")

    # ---- REPORT ----
    print("\n=== VARIANTS per figure (detailed entries) ===")
    # Only show figures with > 1 variant (they're interesting)
    multi = {k: v for k, v in variant_report.items() if v > 1}
    for k, v in sorted(multi.items()):
        print(f"  {k}: {v}")
    print(f"  ... plus {len(variant_report) - len(multi)} figures with 1 variant each")

    print("\n=== ACCESSORIES per figure ===")
    for k, v in sorted(acc_report.items()):
        print(f"  {k}: {v} accessories")

    print(f"\n=== FINAL SUMMARY ===")
    print(f"  Variants inserted: {total_v} (across {len(catalog)} catalog items)")
    print(f"  Accessories inserted: {total_a} (across {len(acc_report)} figures with detailed data)")
    print(f"  Figures covered with accessories: {len(acc_report)}")
    print(f"  Estrela BR variants: Cobra Commander, Snake Eyes, Scarlett, Destro, Gung-Ho, Duke, Baroness, Storm Shadow, Zartan, Lady Jaye, Flint, Roadblock + v1.5 swivel-arm variants for 1982 figures")

if __name__ == "__main__":
    main()
