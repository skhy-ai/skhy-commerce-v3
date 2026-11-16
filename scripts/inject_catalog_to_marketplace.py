"""
inject_catalog_to_marketplace.py
----------------------------------
1. Reads catalog_products.json (from build_catalog_products.py)
2. Crops product images from page renders using a product→crop map
3. Saves cropped PNGs to public/images/marketplace/
4. Injects product_assets into each product
5. Writes src/data/marketplace/chunk_32.json
6. Updates src/data/cachedMarketplace.ts to include chunk_32
"""

import json
import uuid
import re
import os
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).parent.parent
CATALOG_JSON   = BASE_DIR / "scripts/catalog_extract/catalog_products.json"
PAGE_RENDERS   = BASE_DIR / "scripts/catalog_extract/page_renders"
IMG_OUT_DIR    = BASE_DIR / "public/images/marketplace"
CHUNK_OUT      = BASE_DIR / "src/data/marketplace/chunk_32.json"
CACHED_TS      = BASE_DIR / "src/data/cachedMarketplace.ts"

IMG_OUT_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------
# CROP MAP  {product_id -> (page_num, crop_box)}
# crop_box = (left, upper, right, lower)  in fraction of page size
# Page dims: 6891 x 4675 px
# Layout:
#   Most pages: 2-up side by side  → left half | right half
#   Some pages: single product     → full page
#   Page 25:    3 products across  → thirds
#   Pages 26-27: grid layout       → quadrant crops
# -----------------------------------------------------------------
W, H = 6891, 4675

def box(x0f, y0f, x1f, y1f):
    return (int(x0f*W), int(y0f*H), int(x1f*W), int(y1f*H))

# Two-up pages: left half, right half (skip header ~12%, footer ~8%)
LEFT  = box(0.00, 0.12, 0.50, 0.92)
RIGHT = box(0.50, 0.12, 1.00, 0.92)
FULL  = box(0.05, 0.12, 0.95, 0.92)

# Thirds for page 25 (3 products)
T1 = box(0.00, 0.10, 0.34, 0.90)
T2 = box(0.33, 0.10, 0.67, 0.90)
T3 = box(0.66, 0.10, 1.00, 0.90)

# Page 26: 4 products in 2x2 grid
# Row1: IronPaw (large left), RollBot (right top)
# Row2: TurretOne (left bottom), TurretHeavy (right bottom)
P26_A = box(0.00, 0.10, 0.50, 0.55)   # IronPaw
P26_B = box(0.50, 0.10, 1.00, 0.55)   # RollBot
P26_C = box(0.00, 0.55, 0.50, 0.92)   # TurretOne
P26_D = box(0.50, 0.55, 1.00, 0.92)   # TurretHeavy

# Page 27: 6 UGVs in 2x3 grid
P27_A = box(0.00, 0.10, 0.33, 0.55)   # T4 4x4
P27_B = box(0.33, 0.10, 0.66, 0.55)   # T6 6x6
P27_C = box(0.66, 0.10, 1.00, 0.55)   # T8 8x8
P27_D = box(0.00, 0.55, 0.33, 0.92)   # D80 tracked
P27_E = box(0.33, 0.55, 0.66, 0.92)   # D50 tracked
P27_F = box(0.66, 0.55, 1.00, 0.92)   # D100 tracked

# product_id → (page_number_str, crop_box)
CROP_MAP = {
    3000001: ("01", LEFT),    # SPYBUDDY1
    3000002: ("01", RIGHT),   # SPYBUDDY2
    3000003: ("02", LEFT),    # SURVEYOR
    3000004: ("02", RIGHT),   # SURVEYOR LITE
    3000005: ("03", FULL),    # Fiber-Optic Tethered Drone
    3000006: ("04", FULL),    # Fiber-Optic Tethered Drone (Max/Plus)
    3000007: ("04", RIGHT),   # DELTA INTERCEPTOR 5
    3000008: ("05", LEFT),    # DELTA INTERCEPTOR 7
    3000009: ("05", RIGHT),   # DELTA INTERCEPTOR 8
    3000010: ("06", LEFT),    # DELTA INTERCEPTOR 11
    3000011: ("06", RIGHT),   # DELTA 8A
    3000012: ("07", LEFT),    # DELTA 8B
    3000013: ("07", RIGHT),   # HEAVYLIFT 10
    3000014: ("08", LEFT),    # HEAVYLIFT 50
    3000015: ("08", P26_B),   # DROPPER 60MM
    3000016: ("08", P26_D),   # DROPPER 80MM
    3000017: ("09", P26_A),   # DROPPER 82MM
    3000018: ("09", P26_B),   # DROPPER 120MM
    3000019: ("09", P26_C),   # MICRO TURBOJET 80KGF
    3000020: ("09", P26_D),   # MICRO TURBOJET 160KGF
}


def safe_filename(name: str) -> str:
    """Convert product name to safe filename slug."""
    s = name.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s[:60]


def crop_product_image(product_id: int, page_str: str, crop_box: tuple) -> dict | None:
    """Crop the page render and save to marketplace images dir. Returns asset dict."""
    page_file = PAGE_RENDERS / f"page_{page_str}.png"
    if not page_file.exists():
        print(f"  [WARN] Page render not found: {page_file}")
        return None

    img = Image.open(page_file)
    cropped = img.crop(crop_box)

    # Resize to max 1200px wide for web use
    max_w = 1200
    if cropped.width > max_w:
        ratio = max_w / cropped.width
        new_size = (max_w, int(cropped.height * ratio))
        cropped = cropped.resize(new_size, Image.LANCZOS)

    asset_id   = str(uuid.uuid4())
    file_name  = f"{asset_id}.png"
    local_key  = f"{product_id}_catalog_page_{page_str}.png"
    local_url  = f"/images/marketplace/{local_key}"
    out_path   = IMG_OUT_DIR / local_key

    cropped.save(out_path, "PNG", optimize=True)
    print(f"  [IMG] Saved {local_key} ({cropped.width}x{cropped.height})")

    return {
        "id":            asset_id,
        "file_url":      local_url,
        "file_name":     file_name,
        "file_size":     None,
        "asset_type":    "image",
        "created_at":    "2026-05-26T05:44:00+00:00",
        "is_primary":    False,
        "product_id":    product_id,
        "updated_at":    "2026-05-26T05:44:00+00:00",
        "display_order": 0,
        "local_url":     local_url,
    }


def inject_images_and_write_chunk():
    print(f"\nLoading {CATALOG_JSON} ...")
    with open(CATALOG_JSON, encoding="utf-8") as f:
        products = json.load(f)

    print(f"Processing {len(products)} products ...\n")

    for product in products:
        pid = product["id"]
        name = product["name"]

        if pid not in CROP_MAP:
            print(f"  [SKIP] {pid} {name} — not in CROP_MAP")
            continue

        page_str, crop_box = CROP_MAP[pid]
        print(f"  [{pid}] {name[:50]}")
        asset = crop_product_image(pid, page_str, crop_box)

        if asset:
            product["product_assets"] = [asset]

    # Write chunk_32.json
    print(f"\nWriting {CHUNK_OUT} ...")
    with open(CHUNK_OUT, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"[OK] chunk_32.json written ({len(products)} products)")
    return len(products)


def update_cached_marketplace_ts():
    """Add chunk_32 import to cachedMarketplace.ts if not already present."""
    content = CACHED_TS.read_text(encoding="utf-8")

    if "chunk_32" in content:
        print("[OK] cachedMarketplace.ts already includes chunk_32")
        return

    # Find the last chunk import line and insert after it
    old_last = "    import('./marketplace/chunk_31.json')"
    new_last = (
        "    import('./marketplace/chunk_31.json'),\n"
        "    import('./marketplace/chunk_32.json')"
    )
    if old_last not in content:
        print("[WARN] Could not find chunk_31 import in cachedMarketplace.ts — please add chunk_32 manually")
        return

    content = content.replace(old_last, new_last)

    # Update the product count comment
    content = re.sub(
        r'// Number of products: \d+',
        '// Number of products: 652',
        content
    )
    content = re.sub(
        r'// Number of chunks: \d+',
        '// Number of chunks: 33',
        content
    )

    CACHED_TS.write_text(content, encoding="utf-8")
    print("[OK] cachedMarketplace.ts updated to include chunk_32")


def main():
    n = inject_images_and_write_chunk()
    update_cached_marketplace_ts()
    print(f"\nDone — {n} products injected into marketplace chunk_32.json")
    print(f"Product images saved to: {IMG_OUT_DIR}")
    print(f"Chunk written to:        {CHUNK_OUT}")


if __name__ == "__main__":
    main()
