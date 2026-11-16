import json
import os
import re
from pathlib import Path

BASE_DIR = Path(r"c:\Projects\skhyai-website\skhy-ai-website-main")
CHUNKS_DIR = BASE_DIR / "src/data/marketplace"

# We will read productCatalog.ts to extract the IDs of SKHY products.
CATALOG_TS = BASE_DIR / "src/data/productCatalog.ts"
with open(CATALOG_TS, "r", encoding="utf-8") as f:
    content = f.read()

# Simple regex to find id: '...' or id: "..." or id: 900005 in productCatalog.ts
# It looks like: id: '900005',
id_matches = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", content)
skhy_ids = set([str(id_val).strip() for id_val in id_matches])

print(f"Found {len(skhy_ids)} SKHY proprietary products in catalog.")

# Also include anything containing "Interceptor" or "SKHY" or "Threat Awareness" just in case
def is_skhy_product(p):
    p_id = str(p.get("id"))
    if p_id in skhy_ids:
        return True
    name = p.get("name", "").upper()
    if "INTERCEPTOR" in name or "THREAT AWARENESS MANAGER" in name:
        return True
    return False

modified_files = 0
for i in range(33):
    chunk_file = CHUNKS_DIR / f"chunk_{i}.json"
    if not chunk_file.exists():
        continue
    
    with open(chunk_file, "r", encoding="utf-8") as f:
        try:
            products = json.load(f)
        except json.JSONDecodeError:
            continue
            
    modified = False
    for p in products:
        if is_skhy_product(p):
            if not p.get("show_on_skhy_store"):
                p["show_on_skhy_store"] = True
                modified = True
                print(f"Adding {p.get('name')} to SKHY store")
                
    if modified:
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        modified_files += 1

print(f"Updated {modified_files} chunk files.")
