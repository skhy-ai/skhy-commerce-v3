import json
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(r"c:\Projects\skhyai-website\skhy-ai-website-main")
CHUNKS_DIR = BASE_DIR / "src/data/marketplace"
CATALOG_TS = BASE_DIR / "src/data/productCatalog.ts"

# 1. Gather all IDs from chunks
all_chunk_ids = set()
for i in range(33):
    chunk_file = CHUNKS_DIR / f"chunk_{i}.json"
    if not chunk_file.exists():
        continue
    with open(chunk_file, "r", encoding="utf-8") as f:
        try:
            products = json.load(f)
            for p in products:
                all_chunk_ids.add(str(p.get("id")))
        except Exception:
            pass

# 2. Parse productCatalog.ts to find missing products
with open(CATALOG_TS, "r", encoding="utf-8") as f:
    content = f.read()

# We need to extract the object for each catalog product
catalog_products = []

# Simple regex parsing
pattern = r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*tagline:\s*['\"]([^'\"]+)['\"],\s*category:\s*['\"]([^'\"]+)['\"],(.*?)imageUrl:\s*['\"]([^'\"]+)['\"]"
matches = re.finditer(pattern, content, re.DOTALL)
for m in matches:
    p_id = m.group(1)
    name = m.group(2)
    tagline = m.group(3)
    category = m.group(4)
    image_url = m.group(6)
    
    if p_id not in all_chunk_ids:
        # We need to add this to chunk 32
        catalog_products.append({
            "id": p_id,
            "user_id": "skhy-system-generated",
            "name": name,
            "description": tagline,
            "type": "hardware" if category in ["drone", "hardware", "acoustic", "edge-ai"] else "software",
            "category": category,
            "pricing_model": "unit",
            "base_price": 5000, # default
            "unit": None,
            "currency": "USD",
            "tax_exempt": False,
            "show_on_marketplace": True,
            "show_on_skhy_store": True,
            "youtube_url": None,
            "hide_pricing": False,
            "ready_to_sale": True,
            "subcategory": "Other",
            "inventory_quantity": 100,
            "is_active": True,
            "requires_shipping": True,
            "is_digital": False,
            "restricted_countries": None,
            "created_at": datetime.utcnow().isoformat() + "+00:00",
            "updated_at": datetime.utcnow().isoformat() + "+00:00",
            "stock_quantity": 100,
            "seller": {
                "company_name": "SKHY",
                "seller_type": "seller"
            },
            "product_assets": [
                {
                    "local_url": image_url,
                    "file_url": image_url,
                    "asset_type": "image",
                    "is_primary": True
                }
            ]
        })

print(f"Found {len(catalog_products)} missing products from the catalog to inject.")

if catalog_products:
    chunk_32_file = CHUNKS_DIR / "chunk_32.json"
    if chunk_32_file.exists():
        with open(chunk_32_file, "r", encoding="utf-8") as f:
            c32 = json.load(f)
    else:
        c32 = []
        
    c32.extend(catalog_products)
    
    with open(chunk_32_file, "w", encoding="utf-8") as f:
        json.dump(c32, f, indent=2, ensure_ascii=False)
        
    print("Updated chunk_32.json")
