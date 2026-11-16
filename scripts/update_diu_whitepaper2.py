import sys

file_path = r'C:\Users\localasus2023\.gemini\antigravity-ide\brain\a9e1372f-f24a-48b8-b61c-b3df7273e7a1\diu_defense_whitepaper.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update TRLs
content = content.replace('Weight: ~240g | Power: 5V DC, 200mA–4A\n- **TRL-4**', 'Weight: ~240g | Power: 5V DC, 200mA–4A\n- **TRL-5**')
content = content.replace('Correlates acoustic signatures with RF intelligence to **virtually eliminate false positives**\n- **TRL-4**', 'Correlates acoustic signatures with RF intelligence to **virtually eliminate false positives**\n- **TRL-5**')
content = content.replace('Anti-Jam/Spoof GNSS with heading\n- **TRL-4**', 'Anti-Jam/Spoof GNSS with heading\n- **TRL-5**')
content = content.replace('Unit cost: **$1,550**\n- **TRL-4**', 'Unit cost: **$1,550**\n- **TRL-5**')
content = content.replace('APEX-24 Interceptor USV | Autonomous Surface Vessel | **TRL-4**', 'APEX-24 Interceptor USV | Autonomous Surface Vessel | **TRL-5**')
content = content.replace('| Acoustic Sensor (A7) | SKHY-A7 Compact Sentinel | **TRL-4**', '| Acoustic Sensor (A7) | SKHY-A7 Compact Sentinel | **TRL-5**')
content = content.replace('| Multi-Spectral Station | SKHY-MOBISENSE | **TRL-4**', '| Multi-Spectral Station | SKHY-MOBISENSE | **TRL-5**')
content = content.replace('| Edge AI Node (Heavy) | Jamming-Resilient RF Fusion | **TRL-4**', '| Edge AI Node (Heavy) | Jamming-Resilient RF Fusion | **TRL-5**')
content = content.replace('| Edge AI Node (Light) | Light Edge AI & RF Fusion | **TRL-4**', '| Edge AI Node (Light) | Light Edge AI & RF Fusion | **TRL-5**')

# 2. Remove CRPA
crpa_section = """### Anti-Jamming GNSS (CRPA) Systems

All edge nodes can be hardened with SKHY's CRPA (Controlled Reception Pattern Antenna) systems for GPS-denied operations:

| Model | Channels | Suppression | Weight | Est. Cost |
| :--- | :--- | :--- | :--- | :--- |
| AJGPS 301 | 4-channel | Wideband/Pulse/Sweep | < 128g | $1,200 |
| AJGPS 302 | 4-channel | ≥100 dB | 100×100×25 mm | $1,800 |
| AJGPS 303 | 4-channel (L1/L2/L5) | ≥105 dB | < 2000g | $2,800 |
| AJGPS 601 | 8-channel | 6 simultaneous sources | — | $3,800 |
| AJGPS 602 | 8-channel (beamforming) | 7 simultaneous sources | Low-profile | $4,500 |

![AJGPS Anti-Jamming GNSS System](C:/Users/localasus2023/.gemini/antigravity-ide/brain/a9e1372f-f24a-48b8-b61c-b3df7273e7a1/ajgps301-2.png)"""
content = content.replace(crpa_section, "")

content = content.replace('Hardware-enforced anti-jamming GNSS (CRPA arrays suppressing ≥100dB)', 'Resilient edge devices for location resilience')
content = content.replace('| **Jamming Resilience** | ✅ Hardware-enforced Anti-Jam PNT (CRPA) |', '| **Jamming Resilience** | ✅ Resilient Edge Devices for Location Resilience |')

# 3. Surveyor Drone TRL-6
content = content.replace('SKHY Surveyor Drone**, TRL-7, 150–180 min endurance)', 'SKHY Surveyor Drone**, TRL-6, 150–180 min endurance)')
content = content.replace('| SKHY Surveyor Drone | VTOL ISR Platform | **TRL-7** | Operational prototype |', '| SKHY Surveyor Drone | VTOL ISR Platform | **TRL-6** | Operational prototype |')

# 4. Effectors update
old_effector_section = """### Canister-Launched Drone Systems
Our interceptors are deployed via canister-launch for rapid vertical deployment, allowing autonomous engagement of threats without runway infrastructure.

### Interceptor Models & Threat Profiles

SKHY's effector fleet is tailored to specific threat classes:

| Interceptor | Target Profile | Max Speed | MTOW | Payload | Range | Key Advantage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Interceptor 5** | Group 1 & 2 ISR drones | 500+ km/h | 1.5 kg | Light kinetic | 20 km | Ultra-light VTOL rapid launch |
| **Interceptor 7** | FPV kamikaze drones | 360 km/h | 2.5 kg | 500g | 5+ km | 5.8 GHz video TX, STM32 F722 |
| **Interceptor 8** | FPV swarms, medium UAS | 500+ km/h | 3 kg | 300g | 20 km | 8S high-performance battery |
| **Interceptor 11** | Heavy loitering munitions | 400+ km/h | 4 kg | 800g | 40 km | Dual 8S packs, 40+ min endurance |"""

new_effector_section = """### Aerial Interception Systems
Our interception fleet includes high-speed VTOL systems and canister-launched platforms for autonomous engagement of threats without runway infrastructure.

### Interceptor Models & Threat Profiles

SKHY's effector fleet is tailored to specific threat classes:

| Interceptor | Target Profile | Max Speed | MTOW | Payload | Range | Key Advantage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Interceptor 5** | Group 1 & 2 ISR drones | 500+ km/h | 1.5 kg | Light kinetic | 20 km | VTOL rapid launch (Not canister launched) |
| **Interceptor 6** | Mid-range threats | 400+ km/h | 2.0 kg | 400g | 15 km | Canister-launched, vertical deployment |
| **Interceptor 7** | FPV kamikaze drones | 360 km/h | 2.5 kg | 500g | 5+ km | 5.8 GHz video TX (Not canister launched) |
| **Interceptor 8** | FPV swarms, medium UAS | 500+ km/h | 3 kg | 300g | 20 km | 8S high-performance battery |
| **Interceptor 11** | Heavy loitering munitions | 400+ km/h | 4 kg | 800g | 40 km | Dual 8S packs, 40+ min endurance |

![SKHY Interceptor 6 — Canister-Launched Assembly Diagram](C:/Users/localasus2023/.gemini/antigravity-ide/brain/14cfe4e9-dcdf-438b-9138-26f5b2c342f9/media__1790308768030.png)"""
content = content.replace(old_effector_section, new_effector_section)

# 5. BOM update
old_bom = """| **Anti-Jamming GNSS** | AJGPS 302 (4-channel) | 8 | $1,800 | $14,400 |
| **MANET — Backbone** | AB40 High-Altitude Radio | 2 | $4,800 | $9,600 |
| **MANET — Tactical** | AB20 Medium ISR Radio | 8 | $2,500 | $20,000 |
| **MANET — Ground** | VC20 Ground Command Unit | 2 | ~$3,500 | $7,000 |
| **MANET — Handheld** | HH20 Dual-Band User | 6 | ~$2,000 | $12,000 |
| **Overwatch / Radar** | SKHY Surveyor Drone | 2 | $9,999 | $19,998 |
| **Secure Obs.** | Fiber-Optic Tethered Drone | 1 | $1,250 | $1,250 |
| **Effectors** | Skhy Interceptor 5 (canisters) | 24 | ~$800 | $19,200 |
| **Effectors** | Skhy Interceptor 7 (canisters) | 12 | ~$1,500 | $18,000 |
| **Effectors** | Skhy Interceptor 11 (heavy) | 4 | ~$3,500 | $14,000 |
| | | | **TOTAL** | **~$216,848** |

> [!CAUTION]
> **Cost Comparison:** A single Patriot missile costs approximately **$4 million**. A single NASAMS launcher system exceeds **$23 million**. The entire SKHY AI 50 km² perimeter defense, including 40 interceptors, 12 acoustic sensors, full mesh networking, and sovereign edge AI, costs approximately **$217K** — less than 1% of a single legacy engagement."""

new_bom = """| **MANET — Backbone** | AB40 High-Altitude Radio | 2 | $4,800 | $9,600 |
| **MANET — Tactical** | AB20 Medium ISR Radio | 8 | $2,500 | $20,000 |
| **MANET — Ground** | VC20 Ground Command Unit | 2 | ~$3,500 | $7,000 |
| **MANET — Handheld** | HH20 Dual-Band User | 6 | ~$2,000 | $12,000 |
| **Overwatch / Radar** | SKHY Surveyor Drone | 2 | $9,999 | $19,998 |
| **Secure Obs.** | Fiber-Optic Tethered Drone | 1 | $1,250 | $1,250 |
| **Effectors** | Skhy Interceptor 5 | 8 | $4,000 | $32,000 |
| **Effectors** | Skhy Interceptor 6 (canisters) | 16 | $6,000 | $96,000 |
| **Effectors** | Skhy Interceptor 7 | 8 | $5,000 | $40,000 |
| **Effectors** | Skhy Interceptor 11 (heavy) | 4 | $8,000 | $32,000 |
| | | | **TOTAL** | **~$351,248** |

> [!CAUTION]
> **Cost Comparison:** A single Patriot missile costs approximately **$4 million**. A single NASAMS launcher system exceeds **$23 million**. The entire SKHY AI 50 km² perimeter defense, including 36 interceptors, 12 acoustic sensors, full mesh networking, and sovereign edge AI, costs approximately **$351K** — less than 1% of a single legacy engagement."""

content = content.replace(old_bom, new_bom)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
