"""
extract_catalog_pdf.py
Extracts products from Product Catalogue -A.pdf
Outputs: 
  - scripts/catalog_extract/pages/  (per-page text + image)
  - scripts/catalog_extract/products.json  (structured product list)
"""

import fitz  # pymupdf
import json
import os
import re
import sys

PDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'catalog', 'skhy catalog - Drone and components-2.pdf')
OUT_DIR = os.path.join(os.path.dirname(__file__), 'catalog_extract')
PAGES_DIR = os.path.join(OUT_DIR, 'pages')
IMAGES_DIR = os.path.join(OUT_DIR, 'images')
PAGE_RENDERS_DIR = os.path.join(OUT_DIR, 'page_renders')

os.makedirs(PAGES_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(PAGE_RENDERS_DIR, exist_ok=True)

def is_cover_or_toc(text):
    """Heuristic to skip cover/TOC/section divider pages."""
    t = text.strip().lower()
    if len(t) < 30:
        return True
    keywords = ['table of contents', 'contents', 'section', 'introduction', 'about us',
                'catalogue', 'catalog', 'index', 'foreword', 'preface']
    for kw in keywords:
        if t.startswith(kw):
            return True
    return False

def extract_largest_image(page, page_num):
    """Extract the largest image on a page and save it."""
    image_list = page.get_images(full=True)
    if not image_list:
        return None
    
    doc = page.parent
    best = None
    best_size = 0
    
    for img_index, img in enumerate(image_list):
        xref = img[0]
        try:
            base_image = doc.extract_image(xref)
            size = base_image.get('width', 0) * base_image.get('height', 0)
            if size > best_size:
                best_size = size
                best = (xref, base_image)
        except Exception:
            continue
    
    if best is None:
        return None
    
    xref, base_image = best
    img_bytes = base_image['image']
    ext = base_image.get('ext', 'png')
    img_filename = f"page_{page_num:04d}.{ext}"
    img_path = os.path.join(IMAGES_DIR, img_filename)
    
    with open(img_path, 'wb') as f:
        f.write(img_bytes)
    
    return img_filename

def clean_text(text):
    """Clean extracted text."""
    # Collapse multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove excessive whitespace
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()

def extract_product_name(text):
    """Try to extract product name from the first significant line."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines:
        return None
    # Product name is usually the first line or first bold-looking line
    for line in lines[:5]:
        if len(line) > 3 and len(line) < 120:
            # Skip very generic words
            if line.lower() not in ['specification', 'specifications', 'features', 'description', 'overview']:
                return line
    return lines[0] if lines else None

def infer_category(name, text):
    """Infer product category from name and text."""
    combined = (name + ' ' + text).lower()
    
    if any(k in combined for k in ['anti-jam', 'anti jam', 'jamming', 'gnss', 'crpa', 'null steering', 'ajgps']):
        return 'Navigation & Sensors', 'Anti-Jamming GNSS'
    if any(k in combined for k in ['drone', 'uav', 'quadcopter', 'hexacopter', 'octocopter', 'multirotor', 'fixed-wing', 'fixed wing', 'vtol']):
        return 'Drone Platforms', 'Other'
    if any(k in combined for k in ['motor', 'propulsion', 't-motor', 'brushless']):
        return 'Motors', 'Other'
    if any(k in combined for k in ['propeller', 'prop', 'blade']):
        return 'Propellers', 'Other'
    if any(k in combined for k in ['battery', 'lipo', 'power', 'charger', 'bms']):
        return 'Power Systems', 'Other'
    if any(k in combined for k in ['radio', 'rf', 'communication', 'link', 'antenna', 'transmitter', 'receiver', 'datalink']):
        return 'RF Communications', 'Other'
    if any(k in combined for k in ['flight controller', 'autopilot', 'pixhawk', 'ardupilot', 'px4']):
        return 'Flight Control', 'Other'
    if any(k in combined for k in ['gcs', 'ground control', 'ground station']):
        return 'GCS', 'Other'
    if any(k in combined for k in ['sensor', 'lidar', 'camera', 'thermal', 'payload', 'gimbal', 'optical']):
        return 'Payloads', 'Other'
    if any(k in combined for k in ['esc', 'electronic speed', 'speed controller']):
        return 'Electronics', 'ESC'
    if any(k in combined for k in ['frame', 'chassis', 'body', 'carbon fiber']):
        return 'Drone Frames', 'Other'
    if any(k in combined for k in ['software', 'sdk', 'api', 'platform', 'cloud', 'service']):
        return 'Software', 'Other'
    if any(k in combined for k in ['amplifier', 'amp', 'booster', 'signal']):
        return 'Amplifiers', 'Other'
    if any(k in combined for k in ['jammer', 'counter-drone', 'counter drone', 'c-uas', 'cuas', 'defeat']):
        return 'Jamming Systems', 'Counter-Drone'
    
    return 'Hardware', 'Other'

def is_cuas_product(category, subcategory, name, text):
    """Determine if a product is CUAS-applicable."""
    combined = (name + ' ' + text).lower()
    cuas_keywords = ['anti-jam', 'anti jam', 'jamming', 'crpa', 'null steering', 'counter-drone', 
                     'counter drone', 'c-uas', 'defeat', 'jammer', 'gnss protection',
                     'electronic warfare', 'ew system', 'rf detection']
    return any(k in combined for k in cuas_keywords)

def extract_specs(text):
    """Extract key-value specifications from text."""
    specs = []
    lines = text.split('\n')
    
    spec_patterns = [
        r'^(.+?):\s+(.+)$',
        r'^(.+?)\s{2,}(.+)$',
    ]
    
    for line in lines:
        line = line.strip()
        if not line or len(line) > 200:
            continue
        for pattern in spec_patterns:
            m = re.match(pattern, line)
            if m:
                key = m.group(1).strip()
                val = m.group(2).strip()
                if 1 < len(key) < 60 and 1 < len(val) < 100:
                    specs.append(f"{key}: {val}")
                break
    
    return specs[:10]  # Max 10 specs

def extract_weight(text):
    """Try to extract weight from text."""
    m = re.search(r'weight[:\s]+(\d+\.?\d*)\s*(g|kg|gram|kilogram)', text, re.IGNORECASE)
    if m:
        val = float(m.group(1))
        unit = m.group(2).lower()
        if unit in ('g', 'gram'):
            return val / 1000
        return val
    return None

def extract_dimensions(text):
    """Try to extract dimensions from text."""
    m = re.search(r'(\d+\.?\d*)\s*[xX×]\s*(\d+\.?\d*)\s*[xX×]?\s*(\d+\.?\d*)?\s*(mm|cm|m)', text, re.IGNORECASE)
    if m:
        dims = [m.group(1), m.group(2)]
        if m.group(3):
            dims.append(m.group(3))
        unit = m.group(4)
        return ' x '.join(dims) + f' {unit}'
    return None

def main():
    print(f"Opening PDF: {PDF_PATH}")
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    print(f"Total pages: {total_pages}")
    
    products = []
    page_data = []
    
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text()
        text = clean_text(text)
        
        # Save raw page text
        with open(os.path.join(PAGES_DIR, f'page_{page_num:04d}.txt'), 'w', encoding='utf-8') as f:
            f.write(text)
        
        # Render page
        pix = page.get_pixmap(dpi=300)
        pix.save(os.path.join(PAGE_RENDERS_DIR, f'page_{page_num:02d}.png'))
        
        # Extract image
        img_filename = extract_largest_image(page, page_num)
        
        # Skip cover/TOC pages
        if is_cover_or_toc(text):
            print(f"  Page {page_num}: [SKIP - cover/TOC]")
            continue
        
        # Extract product name
        name = extract_product_name(text)
        if not name:
            print(f"  Page {page_num}: [SKIP - no product name]")
            continue
        
        category, subcategory = infer_category(name, text)
        features = extract_specs(text)
        weight_kg = extract_weight(text)
        dimensions = extract_dimensions(text)
        
        # Build description from text (remove the name from the top)
        desc_lines = [l.strip() for l in text.split('\n') if l.strip() and l.strip() != name]
        description = ' '.join(desc_lines[:8])  # First 8 meaningful lines
        if len(description) > 600:
            description = description[:600] + '...'
        
        page_data.append({
            'page': page_num,
            'name': name,
            'description': description,
            'text': text,
            'img_filename': img_filename,
            'category': category,
            'subcategory': subcategory,
            'features': features,
            'weight_kg': weight_kg,
            'dimensions': dimensions,
            'is_cuas': is_cuas_product(category, subcategory, name, text)
        })
        
        print(f"  Page {page_num}: [{category}] {name[:60]}")
    
    doc.close()
    
    # Save raw extraction
    with open(os.path.join(OUT_DIR, 'raw_pages.json'), 'w', encoding='utf-8') as f:
        json.dump(page_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nExtracted {len(page_data)} product candidates from {total_pages} pages")
    print(f"Output saved to: {OUT_DIR}")
    print(f"  Raw pages: {os.path.join(OUT_DIR, 'raw_pages.json')}")
    print(f"  Images: {IMAGES_DIR}/")

if __name__ == '__main__':
    main()
