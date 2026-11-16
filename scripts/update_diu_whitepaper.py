import sys

file_path = r'C:\Users\localasus2023\.gemini\antigravity-ide\brain\a9e1372f-f24a-48b8-b61c-b3df7273e7a1\diu_defense_whitepaper.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """- **Buoy-Mounted Jamming-Resilient Edge AI Nodes** — Our Jamming-Resilient Edge AI & RF Fusion Nodes can be installed inside maritime buoys equipped with AIS catcher software. These nodes provide highly accurate data to the global AIS network for ships broadcasting their locations. Because they are jamming and GNSS spoofing proof, they also serve as early-warning sentinels that detect and report any RF or GNSS jamming attempts in their vicinity.

**TRL-5** — Maritime Domain Awareness platform in beta testing."""

replacement1 = """- **Buoy-Mounted Jamming-Resilient Edge AI Nodes** — Our Jamming-Resilient Edge AI & RF Fusion Nodes can be installed inside maritime buoys equipped with AIS catcher software. These nodes provide highly accurate data to the global AIS network for ships broadcasting their locations. Because they are jamming and GNSS spoofing proof, they also serve as early-warning sentinels that detect and report any RF or GNSS jamming attempts in their vicinity.

### APEX-24 Interceptor USV (Maritime Kinetic Effector)
Extending our kinetic effector capabilities into the naval domain, the **APEX-24 Interceptor USV** serves as a high-speed, autonomous surface platform designed for maritime perimeter defense and hostile USV interdiction.
- **Direct Impact Neutralization:** Features a reinforced bow designed to physically intercept and neutralize hostile surface vessels via high-speed impact.
- **Canister-Launched Aerial Interceptors:** Acts as a forward-deployed mobile launch platform for our drone effectors, extending the engagement range for airborne threats over water.
- **Integrated Sensor Complex:** Fully equipped with the SKHY acoustic and RF sensor suite, including an on-board AIS catcher for real-time vessel tracking and anomaly detection.

**TRL-5** — Maritime Domain Awareness platform in beta testing."""

target2 = """| Threat Awareness Manager | C2 Software Platform | **TRL-5** | Validated in relevant environment |
| Maritime Domain Awareness | MDA Software Platform | **TRL-5** | Beta testing |
| Interceptors & Effectors | Skhy Interceptor Series | **TRL-8** | Flight-validated, operationally proven |"""

replacement2 = """| Threat Awareness Manager | C2 Software Platform | **TRL-5** | Validated in relevant environment |
| Maritime Domain Awareness | MDA Software Platform | **TRL-5** | Beta testing |
| APEX-24 Interceptor USV | Autonomous Surface Vessel | **TRL-4** | Validated in lab environment |
| Interceptors & Effectors | Skhy Interceptor Series | **TRL-8** | Flight-validated, operationally proven |"""

content = content.replace(target1, replacement1)
content = content.replace(target2, replacement2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
