import json
import re
import os
from pathlib import Path

BASE_DIR = Path(r"c:\Projects\skhyai-website\skhy-ai-website-main")
CHUNKS_DIR = BASE_DIR / "src/data/marketplace"
CACHED_TS = BASE_DIR / "src/data/cachedMarketplace.ts"
CATALOG_TS = BASE_DIR / "src/data/productCatalog.ts"

bom_items = {
    "Threat Awareness Manager": {"price": 25000, "category": "software", "desc": "Command center's unified pane of glass for planning, simulating, and monitoring defensive deployments.", "img": "/images/marketplace/threat-awareness-manager.png"},
    "SKHY-A16 Long-Range Array": {"price": 2000},
    "SKHY-MOBISENSE Mobile Station": {"price": 5000},
    "Light Edge AI & RF Fusion Node": {"price": 1550},
    "AB40": {"price": 4800},
    "AB20": {"price": 2500},
    "VC20": {"price": 3500},
    "HH20": {"price": 2000},
    "SKHY Surveyor Drone": {"price": 9999},
    "Fiber-Optic Tethered Drone": {"price": 1250},
    "Interceptor 5": {"price": 4000},
    "Interceptor 6": {"price": 6000, "category": "drone", "desc": "Mid-range threats interceptor, canister-launched, vertical deployment, 400+ km/h, 2.0 kg MTOW, 15 km range.", "img": "/images/marketplace/interceptor-6.png"},
    "Interceptor 7": {"price": 5000},
    "Interceptor 11": {"price": 8000},
}

def update_marketplace():
    all_products = []
    chunk_files = list(CHUNKS_DIR.glob("chunk_*.json"))
    
    found_names = set()
    for chunk_file in chunk_files:
        with open(chunk_file, "r", encoding="utf-8") as f:
            products = json.load(f)
            
        modified = False
        for p in products:
            name = p.get("name", "")
            for bom_key, data in bom_items.items():
                if bom_key.lower() in name.lower():
                    if "price" in data:
                        p["base_price"] = data["price"]
                    p["show_on_marketplace"] = True
                    modified = True
                    found_names.add(bom_key)
        
        if modified:
            with open(chunk_file, "w", encoding="utf-8") as f:
                json.dump(products, f, indent=2, ensure_ascii=False)

    missing_items = []
    for bom_key, data in bom_items.items():
        if bom_key not in found_names and "desc" in data:
            # We need to add it
            new_id = 4000000 + len(missing_items)
            new_prod = {
                "id": new_id,
                "name": bom_key,
                "description": data["desc"],
                "base_price": data["price"],
                "category": data["category"],
                "show_on_marketplace": True,
                "product_assets": [{
                    "asset_type": "image",
                    "file_url": data["img"]
                }]
            }
            missing_items.append(new_prod)
            
    if missing_items:
        chunk_32 = CHUNKS_DIR / "chunk_32.json"
        if chunk_32.exists():
            with open(chunk_32, "r", encoding="utf-8") as f:
                existing = json.load(f)
            existing.extend(missing_items)
            with open(chunk_32, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2, ensure_ascii=False)
        else:
            with open(chunk_32, "w", encoding="utf-8") as f:
                json.dump(missing_items, f, indent=2, ensure_ascii=False)
                
        # Update cachedMarketplace.ts
        ts_content = CACHED_TS.read_text(encoding="utf-8")
        if "chunk_32.json" not in ts_content:
            ts_content = ts_content.replace(
                "import('./marketplace/chunk_31.json')", 
                "import('./marketplace/chunk_31.json'),\n    import('./marketplace/chunk_32.json')"
            )
            CACHED_TS.write_text(ts_content, encoding="utf-8")

update_marketplace()
print("Done updating marketplace.")
