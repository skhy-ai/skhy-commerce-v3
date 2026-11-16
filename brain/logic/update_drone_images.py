import csv
import re
from pathlib import Path

def main():
    root_dir = Path(__file__).parent
    csv_file = root_dir / "drone_images.csv"
    ts_file = root_dir / "skhy-ai-website/src/data/droneComponents.ts"

    if not csv_file.exists():
        print(f"Error: {csv_file} not found.")
        return

    if not ts_file.exists():
        print(f"Error: {ts_file} not found.")
        return

    # 1. Load the new images from CSV into a dictionary { product_id: image_url }
    new_images = {}
    with open(csv_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            new_images[row["product_id"]] = row["image_url"]

    print(f"Loaded {len(new_images)} images from CSV.")

    # 2. Read the current contents of droneComponents.ts
    with open(ts_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 3. Use regex to find and replace the `imageUrl: '...',` or `imageUrl: "...",` 
    # based on the `id: 'prod_id',` OR key: `'prod_id': {`
    
    updates = 0
    missing = []

    for prod_id, img_url in new_images.items():
        # Match EITHER `id: '...',` OR `'...': {`  followed by `imageUrl: '...'`
        # OR unquoted key `prod_id: {`
        pattern1 = re.compile(
            r"(id\s*:\s*['\"]" + re.escape(prod_id) + r"['\"]\s*,[^}]*?imageUrl\s*:\s*)['\"][^'\"]*['\"]",
            re.DOTALL
        )
        pattern2 = re.compile(
            r"(['\"]?" + re.escape(prod_id) + r"['\"]?\s*:\s*\{[^}]*?imageUrl\s*:\s*)['\"][^'\"]*['\"]",
            re.DOTALL
        )
        
        new_content, count = pattern1.subn(rf"\1'{img_url}'", content)
        if count > 0:
            content = new_content
            updates += 1
            continue
            
        new_content, count = pattern2.subn(rf"\1'{img_url}'", content)
        if count > 0:
            content = new_content
            updates += 1
        else:
            missing.append(prod_id)

    # 4. Write back modifications
    with open(ts_file, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Successfully updated {updates} product images in {ts_file.name}.")
    if missing:
        print(f"Failed to find or update blocks for the following IDs: {missing}")

if __name__ == "__main__":
    main()
