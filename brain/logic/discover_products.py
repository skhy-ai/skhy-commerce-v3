import requests
import csv
import re
import os
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

# Configuration
CSV_PATH = "download/strategic_component_manufacturers.csv"
OUTPUT_PATH = "download/discovered_urls.json"

def get_sitemap_urls(base_url):
    """Try various sitemap patterns for a given base URL."""
    if not base_url or base_url == "Not readily available":
        return []
    
    # Strip notes/brackets
    clean_base = re.split(r'[\s\(\)\[\]]', base_url)[0].strip()
    if "." not in clean_base or len(clean_base) < 4:
        return []
        
    if not clean_base.startswith(('http://', 'https://')):
        clean_base = "https://" + clean_base

    parsed = urlparse(clean_base)
    host = f"{parsed.scheme}://{parsed.netloc}".rstrip('/')
    
    # Common sitemap patterns
    patterns = [
        f"{host}/sitemap.xml",
        f"{host}/sitemap_index.xml",
        f"{host}/sitemap_products_1.xml", # Shopify
        f"{host}/shop/sitemap.xml",
        f"{host}/store/sitemap.xml"
    ]
    
    found_urls = []
    processed_sitemaps = set()
    
    def fetch_sitemap(url):
        if url in processed_sitemaps or len(processed_sitemaps) > 20:
            return
        processed_sitemaps.add(url)
        
        try:
            print(f"-- Checking sitemap: {url}", file=sys.stderr)
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                return
            
            # 1. Check for child sitemaps (Sitemap Index)
            child_sitemaps = re.findall(r'<loc>(.*?\.xml.*?)</loc>', resp.text)
            for child in child_sitemaps:
                fetch_sitemap(child.strip())
            
            # 2. Extract product-like URLs
            urls = re.findall(r'<loc>(.*?)</loc>', resp.text)
            patterns = ["/products/", "/product/", "/shop/", "/item/", "/p/"]
            for u in urls:
                u = u.strip()
                if any(p in u.lower() for p in patterns):
                    # Filter out base shop pages, category pages, etc.
                    is_base = any(u.rstrip('/').lower().endswith(p.strip('/')) for p in patterns)
                    if not is_base and ".png" not in u.lower() and ".jpg" not in u.lower():
                        found_urls.append(u)
        except Exception:
            pass

    for start_url in patterns:
        fetch_sitemap(start_url)
            
    return list(set(found_urls))

def detect_strategy(url):
    """Analyze a product page to determine the best extraction strategy."""
    try:
        print(f"   -- Analyzing strategy for: {url}", file=sys.stderr)
        resp = requests.get(url, timeout=15)
        if resp.status_code != 200:
            return "unknown"
        
        html = resp.text.lower()
        
        # 1. Shopify Check
        if "shopify.cdn" in html or "window.shopify" in html:
            return "shopify"
        
        # 2. WooCommerce Check
        if "wp-content/plugins/woocommerce" in html or "wc-ajax" in html:
            return "woocommerce"
            
        # 3. Odoo Check
        if "/shop/product/" in html or "odoo" in html:
            return "odoo"
            
        # 4. LD+JSON (Generic) Check
        if 'type="application/ld+json"' in html and '"@type": "product"' in html:
            return "ld-json"
            
        return "generic-html"
    except Exception:
        return "unknown"

def main():
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found", file=sys.stderr)
        return

    results = {}
    
    with open(CSV_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            company = row.get('Company Name')
            website = row.get('Website')
            
            urls = get_sitemap_urls(website)
            if urls:
                # Sample the first few URLs to detect strategy
                strategy = "unknown"
                for sample_url in urls[:3]:
                    strategy = detect_strategy(sample_url)
                    if strategy != "unknown":
                        break
                
                results[company] = {
                    "strategy": strategy,
                    "urls": urls
                }

    import json
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(results, f, indent=2)
        
    print(f"Discovery complete. Results in {OUTPUT_PATH}", file=sys.stderr)

if __name__ == "__main__":
    main()
