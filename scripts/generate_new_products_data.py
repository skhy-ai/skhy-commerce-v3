import json
import os

OUT_FILE = os.path.join(os.path.dirname(__file__), 'catalog_extract', 'products_data.json')

products = [
    {"name": "SKHY SPYBUDDY1", "page": 1, "category": "Drone Platforms", "subcategory": "Quadcopter", "description": "Stealthy recon drone."},
    {"name": "SKHY SPYBUDDY2", "page": 1, "category": "Drone Platforms", "subcategory": "Quadcopter", "description": "Advanced stealth recon drone."},
    {"name": "SKHY SURVEYOR", "page": 2, "category": "Drone Platforms", "subcategory": "Fixed-Wing", "description": "Surveyor fixed-wing platform."},
    {"name": "SKHY SURVEYOR LITE", "page": 2, "category": "Drone Platforms", "subcategory": "Fixed-Wing", "description": "Lightweight surveyor fixed-wing platform."},
    {"name": "SKHY Fiber-Optic Tethered Drone", "page": 3, "category": "Drone Platforms", "subcategory": "Tethered", "description": "Fiber-optic tethered drone for secure communication. Options: Seeker, Conjurer, Wizard."},
    {"name": "SKHY Fiber-Optic Tethered Drone (Max/Plus)", "page": 4, "category": "Drone Platforms", "subcategory": "Tethered", "description": "Long range tethered drone options."},
    {"name": "SKHY DELTA INTERCEPTOR 5", "page": 4, "category": "Drone Platforms", "subcategory": "Interceptor", "description": "C-UAS interceptor drone.", "is_cuas_applicable": True},
    {"name": "SKHY DELTA INTERCEPTOR 7", "page": 5, "category": "Drone Platforms", "subcategory": "Interceptor", "description": "Advanced C-UAS interceptor drone.", "is_cuas_applicable": True},
    {"name": "SKHY DELTA INTERCEPTOR 8", "page": 5, "category": "Drone Platforms", "subcategory": "Interceptor", "description": "Heavy C-UAS interceptor drone.", "is_cuas_applicable": True},
    {"name": "SKHY DELTA INTERCEPTOR 11", "page": 6, "category": "Drone Platforms", "subcategory": "Interceptor", "description": "Max C-UAS interceptor drone.", "is_cuas_applicable": True},
    {"name": "SKHY DELTA 8A", "page": 6, "category": "Drone Platforms", "subcategory": "Drone", "description": "Delta series platform."},
    {"name": "SKHY DELTA 8B", "page": 7, "category": "Drone Platforms", "subcategory": "Drone", "description": "Delta series platform."},
    {"name": "SKHY HEAVYLIFT 10", "page": 7, "category": "Drone Platforms", "subcategory": "Heavy Lift", "description": "Heavy lift multirotor 10kg payload."},
    {"name": "SKHY HEAVYLIFT 50", "page": 8, "category": "Drone Platforms", "subcategory": "Heavy Lift", "description": "Heavy lift multirotor 50kg payload."},
    {"name": "DROPPER 60MM", "page": 8, "category": "Payloads", "subcategory": "Dropper", "description": "60mm payload dropper mechanism."},
    {"name": "DROPPER 80MM", "page": 8, "category": "Payloads", "subcategory": "Dropper", "description": "80mm payload dropper mechanism."},
    {"name": "DROPPER 82MM", "page": 9, "category": "Payloads", "subcategory": "Dropper", "description": "82mm payload dropper mechanism."},
    {"name": "DROPPER 120MM", "page": 9, "category": "Payloads", "subcategory": "Dropper", "description": "120mm payload dropper mechanism."},
    {"name": "MICRO TURBOJET ENGINE 80KGF", "page": 9, "category": "Motors", "subcategory": "Turbojet", "description": "Micro turbojet engine with 80kgf thrust."},
    {"name": "MICRO TURBOJET ENGINE 160KGF", "page": 9, "category": "Motors", "subcategory": "Turbojet", "description": "Micro turbojet engine with 160kgf thrust."}
]

# Ensure directory exists
os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print(f"Generated {len(products)} products in {OUT_FILE}")
