"""
build_catalog_products.py
Processes extracted catalog page images and raw_pages.json to build 
structured marketplace product entries.

Usage: python scripts/build_catalog_products.py
"""

import json
import os
import re
import sys
import uuid
from datetime import datetime

EXTRACT_DIR = os.path.join(os.path.dirname(__file__), 'catalog_extract')
PAGE_RENDERS_DIR = os.path.join(EXTRACT_DIR, 'page_renders')
OUT_FILE = os.path.join(EXTRACT_DIR, 'catalog_products.json')

# ID range for catalog products - starts at 3000001 to avoid conflicts
ID_START = 3000001

# Standard SKHY seller block
SKHY_SELLER = {
    "email": "nikki@skhy.systems",
    "user_id": "bb48fabc-b101-4d3c-a419-3c305143a80e",
    "seller_type": "seller",
    "company_name": "SKHY",
    "shipping_rates": [
        {
            "id": "01b9b559-d78d-4c43-a81c-24926a78312d",
            "currency": "USD",
            "base_rate": 10,
            "is_active": True,
            "rate_type": "flat",
            "seller_id": "bb48fabc-b101-4d3c-a419-3c305143a80e",
            "created_at": "2026-01-29T16:48:24.221229+00:00",
            "max_weight": None,
            "min_weight": None,
            "product_id": None,
            "updated_at": "2026-01-29T16:48:23.757+00:00",
            "courier_name": None,
            "per_unit_rate": None,
            "estimated_days": None,
            "origin_country": "MY",
            "destination_country": "US"
        }
    ]
}

def is_cuas_applicable(name, description, category, subcategory):
    """Determine if a product should link to the CUAS order form."""
    combined = f"{name} {description} {category} {subcategory}".lower()
    cuas_keywords = [
        'anti-jam', 'anti jam', 'jamming', 'crpa', 'null steering', 
        'counter-drone', 'counter drone', 'c-uas', 'cuas', 'defeat',
        'jammer', 'gnss protection', 'electronic warfare', 'ew system',
        'rf detection', 'drone detection', 'drone defense', 'neutralize',
        'inhibitor', 'countermeasure', 'anti-uav', 'anti uav'
    ]
    return any(k in combined for k in cuas_keywords)

def make_product_entry(
    product_id: int,
    name: str,
    description: str,
    category: str,
    subcategory: str,
    features: list,
    weight_kg: float | None,
    dimensions: str | None,
    img_local_path: str | None,
    page_num: int
) -> dict:
    """Build a full marketplace product entry."""
    
    now = datetime.utcnow().isoformat() + '+00:00'
    
    product_assets = []
    if img_local_path:
        asset_id = str(uuid.uuid4())
        product_assets.append({
            "id": asset_id,
            "file_url": img_local_path,
            "file_name": f"{asset_id}.png",
            "file_size": None,
            "asset_type": "image",
            "created_at": now,
            "is_primary": True,
            "product_id": product_id,
            "updated_at": now,
            "display_order": 0,
            "local_url": img_local_path
        })
    
    cuas = is_cuas_applicable(name, description, category, subcategory)
    
    return {
        "id": product_id,
        "user_id": "bb48fabc-b101-4d3c-a419-3c305143a80e",
        "name": name,
        "description": description,
        "type": "hardware",
        "category": category,
        "pricing_model": "unit",
        "base_price": 0,
        "unit": None,
        "currency": "USD",
        "tax_exempt": False,
        "show_on_marketplace": True,
        "youtube_url": None,
        "hide_pricing": True,  # All catalog products are "Request for Price"
        "ready_to_sale": False,
        "subcategory": subcategory,
        "inventory_quantity": 0,
        "is_active": True,
        "requires_shipping": True,
        "is_digital": False,
        "restricted_countries": None,
        "created_at": now,
        "updated_at": now,
        "stock_quantity": 0,
        "sku": None,
        "weight_kg": weight_kg,
        "dimensions": dimensions,
        "low_stock_threshold": 5,
        "features": features,
        "power_draw_w": None,
        "segment": "air",
        "manufacturer": "SKHY",
        "country_of_origin": "MY",
        "pin_layout": None,
        "operating_voltage": None,
        "operating_current": None,
        "supplier_managed_pricing": False,
        "is_cuas_applicable": cuas,  # Custom flag for CTA routing
        "catalog_source": f"Product Catalogue -A.pdf, page {page_num}",
        "product_assets": product_assets,
        "seller": SKHY_SELLER
    }


def load_page_products():
    """Load the manually curated product data (from visual inspection)."""
    # This will be populated after visual inspection of the rendered pages
    products_data_file = os.path.join(EXTRACT_DIR, 'products_data.json')
    if os.path.exists(products_data_file):
        with open(products_data_file, encoding='utf-8') as f:
            return json.load(f)
    return []


def main():
    # Load manually curated product data
    products_data = load_page_products()
    
    if not products_data:
        print("ERROR: No products_data.json found in catalog_extract/")
        print("Please run the visual extraction step first.")
        return
    
    print(f"Processing {len(products_data)} products...")
    
    products = []
    for i, item in enumerate(products_data):
        product_id = ID_START + i
        
        img_path = item.get('img_local_path')
        
        product = make_product_entry(
            product_id=product_id,
            name=item['name'],
            description=item.get('description', ''),
            category=item.get('category', 'Hardware'),
            subcategory=item.get('subcategory', 'Other'),
            features=item.get('features', []),
            weight_kg=item.get('weight_kg'),
            dimensions=item.get('dimensions'),
            img_local_path=img_path,
            page_num=item.get('page', 0)
        )
        
        products.append(product)
        print(f"  [{product_id}] {item['name'][:60]} - {'CUAS' if product['is_cuas_applicable'] else 'Bulk'}")
    
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Saved {len(products)} products to {OUT_FILE}")
    
    # Summary
    cuas_count = sum(1 for p in products if p['is_cuas_applicable'])
    bulk_count = len(products) - cuas_count
    print(f"  CUAS-applicable: {cuas_count}")
    print(f"  Bulk Order:      {bulk_count}")


if __name__ == '__main__':
    main()
