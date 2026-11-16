#!/usr/bin/env python3
"""
fetch_drone_images.py
=====================
Reads drone component product names from droneComponents.ts,
searches Google Images for each product, retrieves a real image URL,
and stores results in drone_images.csv.

Requirements:
    pip install requests beautifulsoup4 serpapi

Usage:
    python fetch_drone_images.py

Output:
    drone_images.csv  — columns: category, product_id, product_name, image_url, source_page
"""

import csv
import json
import re
import time
import random
import os
import sys
from pathlib import Path

# ── Try to import dependencies; install hint if missing ──────────────────────
try:
    import requests
    import json
    import re
except ImportError:
    print("Missing dependencies. Run:  pip install requests")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# PRODUCTS extracted from droneComponents.ts
# Each tuple: (category, product_id, search_query)
# ─────────────────────────────────────────────────────────────────────────────
PRODUCTS = [
    # Frames
    ("frame", "tarot_650",        "Tarot Iron Man 650 quadcopter frame"),
    ("frame", "quad_13",          "13 inch quadcopter frame carbon fiber drone"),
    ("frame", "quad_15",          "15 inch quadcopter frame carbon fiber drone"),
    ("frame", "quad_17",          "17 inch quadcopter frame carbon fiber drone"),
    ("frame", "quad_industrial",  "industrial heavy lift quadcopter frame drone"),
    ("frame", "hex_industrial",   "industrial hexacopter frame heavy lift drone"),
    ("frame", "octo_heavy",       "industrial octocopter frame heavy lift drone"),

    # Motors
    ("motor", "tm_mn4010",        "T-Motor MN4010 370KV brushless motor"),
    ("motor", "sunnysky_x4110s",  "SunnySky X4110S 400KV brushless motor"),
    ("motor", "emax_mt3510",      "Emax MT3510 600KV brushless motor drone"),
    ("motor", "tm_mn4006",        "T-Motor MN4006 380KV brushless motor"),
    ("motor", "kde_4014xf",       "KDE Direct 4014XF 380KV motor drone"),
    ("motor", "cobra_cm4515",     "Cobra CM-4515 400KV brushless motor"),
    ("motor", "tm_p80",           "T-Motor P80 III 100KV industrial motor"),
    ("motor", "hw_p50m",          "Hobbywing P50M industrial motor drone system"),
    ("motor", "hw_p65m",          "Hobbywing P65M industrial motor drone system"),

    # Propellers
    ("prop", "p10_carbon",        "10 inch carbon fiber drone propeller pair"),
    ("prop", "p12_carbon",        "12 inch carbon fiber drone propeller pair"),
    ("prop", "p13_bi_cf",         "13 inch bi-blade carbon fiber drone propeller"),
    ("prop", "p15_carbon",        "15 inch carbon fiber drone propeller pair"),
    ("prop", "p17_carbon",        "17 inch carbon fiber drone propeller pair"),
    ("prop", "p32_carbon",        "32 inch carbon fiber agricultural drone propeller"),
    ("prop", "p40_carbon",        "40 inch carbon fiber heavy lift drone propeller"),
    ("prop", "p64_carbon",        "64 inch carbon fiber large drone propeller"),

    # Batteries
    ("battery", "moli_6s3p",          "Molicel P45B 6S 13.5Ah LiPo battery drone"),
    ("battery", "moli_6s2p",          "Molicel P45B 6S 9Ah LiPo battery drone pack"),
    ("battery", "revogreen_6s_16000",  "6S 16000mAh LiPo battery industrial drone"),
    ("battery", "4s_5000",            "4S 5000mAh LiPo battery drone"),
    ("battery", "4s_10000",           "4S 10000mAh LiPo battery drone"),
    ("battery", "revogreen_12s_22000", "12S 22000mAh LiPo battery industrial drone"),
    ("battery", "agri_14s_30000",     "14S 30000mAh agriculture drone battery"),
    ("battery", "hv_400v_pack",       "high voltage drone battery array industrial"),

    # ESCs
    ("esc", "20a_generic",   "20A ESC brushless motor controller drone"),
    ("esc", "30a_generic",   "30A ESC brushless motor controller drone"),
    ("esc", "40a_xrotor",    "Hobbywing XRotor 40A ESC drone"),
    ("esc", "50a_4in1",      "BLHeli 32 50A 4-in-1 ESC drone"),
    ("esc", "60a_single",    "60A single ESC industrial drone controller"),
    ("esc", "100a_hv",       "Hobbywing 100A HV FOC ESC industrial drone"),

    # Cameras
    ("camera", "siyi_zr10",      "SIYI ZR10 optical zoom gimbal camera drone"),
    ("camera", "skydroid_h16",   "Skydroid H16 camera gimbal drone"),
    ("camera", "paras_eo",       "EO IR payload camera industrial drone gimbal"),
    ("camera", "ideaforge_ref",  "surveillance drone EO camera gimbal industrial"),
    ("camera", "skhy-eo",        "EO IR gimbal camera drone surveillance payload"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def verify_image_url(url: str, timeout: int = 8) -> bool:
    """Check that the URL actually returns an image (HEAD request)."""
    if "data:image" in url:
        return False
    try:
        resp = requests.head(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        content_type = resp.headers.get("Content-Type", "")
        return resp.status_code == 200 and "image" in content_type
    except Exception:
        return False

def best_image_url(query: str) -> tuple[str, str]:
    """
    Return (image_url, note) — the first working image URL for the query.
    Uses Bing Images to avoid Google/DDG strict blocks.
    Falls back to Unsplash if that fails.
    """
    try:
        url = "https://www.bing.com/images/search"
        params = {"q": query}
        resp = requests.get(url, params=params, headers=HEADERS, timeout=12)
        resp.raise_for_status()
        
        # Bing stores image data in the 'm' attribute inside elements that have class 'iusc'
        matches = re.findall(r'm="(\{.*?\})"', resp.text)
        
        checked = 0
        for m in matches:
            if checked >= 8: break
            try:
                # Bing HTML-escapes quotes as &quot;
                m_json = m.replace('&quot;', '"')
                data = json.loads(m_json)
                img_url = data.get("murl")
                if img_url and verify_image_url(img_url):
                    return img_url, "bing_images"
            except Exception:
                pass
            checked += 1
            
    except Exception as exc:
        print(f"  ⚠  Bing search failed for '{query}': {exc}")

    # Fallback: Unsplash source (deterministic URL based on keyword)
    keyword = query.split()[0]  # use first word as topic
    fallback = f"https://source.unsplash.com/640x480/?{keyword},drone"
    return fallback, "unsplash_fallback"


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
def main():
    output_file = Path(__file__).parent / "drone_images.csv"

    print(f"🔍 Fetching images for {len(PRODUCTS)} drone components …\n")
    print(f"   Output → {output_file}\n")

    fieldnames = ["category", "product_id", "product_name", "image_url", "source"]

    # Load already-processed IDs to allow resume on re-run
    done_ids: set[str] = set()
    if output_file.exists():
        with open(output_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("source") != "unsplash_fallback":
                    done_ids.add(row["product_id"])
        print(f"   Resuming — {len(done_ids)} already done.\n")

    mode = "a" if done_ids else "w"
    with open(output_file, mode, newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        if mode == "w":
            writer.writeheader()

        for idx, (category, prod_id, query) in enumerate(PRODUCTS, 1):
            if prod_id in done_ids:
                print(f"  [{idx:2d}/{len(PRODUCTS)}] ✓ {prod_id} (already done)")
                continue

            print(f"  [{idx:2d}/{len(PRODUCTS)}] 🔎 {prod_id}: {query}")

            image_url, source = best_image_url(query)

            writer.writerow({
                "category":     category,
                "product_id":   prod_id,
                "product_name": query,
                "image_url":    image_url,
                "source":       source,
            })
            csvfile.flush()

            status = "✅" if source == "google_images" else "⚠️  fallback"
            print(f"             {status}  {image_url[:80]}")

            # Polite delay to avoid rate-limiting (2–5 seconds between requests)
            time.sleep(random.uniform(2.5, 5.0))

    print(f"\n✅  Done! Results saved to: {output_file}")
    print("\nNext step: review drone_images.csv and run update_drone_images.py")


if __name__ == "__main__":
    main()
