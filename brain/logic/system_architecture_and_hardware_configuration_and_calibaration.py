import json
import os
import hashlib
import itertools
from typing import Dict, List, Any

# Component Pinout Definitions
COMPONENTS: Dict[str, Any] = {
    "900029": {
        "name": "Cube Orange+ Autopilot",
        "type": "autopilot",
        "ports": {
            "TELEM1": ["TX", "RX", "CTS", "RTS", "GND", "V5"],
            "TELEM2": ["TX", "RX", "CTS", "RTS", "GND", "V5"],
            "GPS1": ["TX", "RX", "SCL", "SDA", "GND", "V5"],
            "POWER1": ["VCC", "VOLT", "CURR", "GND"],
            "MAIN_OUT": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]
        }
    },
    "900030": {
        "name": "Holybro Pixhawk 6C Autopilot",
        "type": "autopilot",
        "ports": {
            "TELEM1": ["TX", "RX", "GND", "V5"],
            "TELEM2": ["TX", "RX", "GND", "V5"],
            "GPS1": ["TX", "RX", "GND", "V5"],
            "POWER1": ["VCC", "GND"],
            "MAIN_OUT": ["PWM", "GND"]
        }
    },
    "herelink": {
        "name": "Herelink Air Unit",
        "type": "radio",
        "ports": {
            "BUS1": ["TX", "RX", "GND"],
            "PWR": ["VCC", "GND"],
            "RF_OUT": ["ANT1", "ANT2"]
        }
    },
    "herelink_gcs": {
        "name": "Herelink Ground Control",
        "type": "gcs",
        "ports": {
            "RF_IN": ["ANT1", "ANT2"]
        }
    },
    "276137616": {
        "name": "SIYI ZR10 Gimbal",
        "type": "gimbal",
        "ports": {
            "UART": ["TX", "RX", "GND"],
            "ETH": ["T+", "T-", "R+", "R-"],
            "PWR": ["VCC", "GND"]
        }
    },
    "rfd900": {
        "name": "RFD900 Telemetry",
        "type": "radio",
        "ports": {
            "HEADER": ["TX", "RX", "GND", "VCC"],
            "ANT": ["RF_INOUT"]
        }
    },
    "900015": {
        "name": "AJGPS 602 (9-Channel CRPA)",
        "type": "sensor",
        "ports": {
            "UART": ["TX", "RX", "GND"],
            "I2C": ["SCL", "SDA", "GND"],
            "PWR": ["VCC", "GND"]
        }
    },
    "900009": {
        "name": "SKHY Jamming Resilient Core",
        "type": "computer",
        "ports": {
            "MAVLINK": ["TX", "RX", "GND"],
            "ETH": ["T+", "T-", "R+", "R-"],
            "PWR": ["VCC", "GND"]
        }
    },
    "900033": {
        "name": "ACASOM 20W GaN Telemetry",
        "type": "radio",
        "ports": {
            "SIGNAL_IN": ["SIG", "GND"],
            "RF_OUT": ["ANT"],
            "PWR": ["VCC", "GND"]
        }
    },
    "900021": {
        "name": "HH20 MANET Ground User",
        "type": "radio",
        "ports": {
            "DATA": ["TX", "RX", "GND"],
            "ANT": ["RF_OUT"],
            "PWR": ["VCC", "GND"]
        }
    },
    "900034": {
        "name": "FlySpark Opticallink Fiber GCS",
        "type": "gcs",
        "ports": {
            "FIBER": ["TX", "RX"]
        }
    },
    "900006": {
        "name": "SKHY-A16 Acoustic Array",
        "type": "sensor",
        "ports": {
            "DATA": ["TX", "RX", "GND"],
            "ETH": ["T+", "T-", "R+", "R-"],
            "PWR": ["VCC", "GND"]
        }
    },
    "900005": {
        "name": "SKHY-A7 Acoustic Node",
        "type": "sensor",
        "ports": {
            "UART": ["TX", "RX", "GND"],
            "PWR": ["VCC", "GND"]
        }
    },
    "900007": {
        "name": "SKHY-MOBISENSE Mobile Station",
        "type": "sensor",
        "ports": {
            "MAVLINK": ["TX", "RX", "GND"],
            "ETH": ["T+", "T-", "R+", "R-"],
            "PWR": ["VCC", "GND"]
        }
    },
    "generic_gcs": {
        "name": "Ground Control Station",
        "type": "gcs",
        "ports": {
            "RF_IN": ["ANT"]
        }
    },
    "esc_generic": {
        "name": "ESC Array (Propulsion)",
        "type": "esc",
        "ports": {
            "SIGNAL": ["PWM", "GND"],
            "POWER": ["VCC_IN", "GND_IN"],
            "MOTOR_OUT": ["PHASE_A", "PHASE_B", "PHASE_C"]
        }
    },
    "battery": {
        "name": "Power Source (Battery)",
        "type": "power",
        "ports": {
            "OUTPUT": ["VCC", "GND"]
        }
    }
}

def generate_mermaid(active_ids: List[str]) -> str:
    # Safely duplicate list
    render_ids = list(active_ids)
    
    # Implicitly inject battery if powered components exist
    if any("PWR" in COMPONENTS.get(cid, {}).get("ports", {}) or "POWER1" in COMPONENTS.get(cid, {}).get("ports", {}) for cid in render_ids):
        if "battery" not in render_ids:
            render_ids.append("battery")
            
    # Implicitly inject GCS for explicit radios
    if "herelink" in render_ids and "herelink_gcs" not in render_ids:
        render_ids.append("herelink_gcs")
    elif "rfd900" in render_ids and "generic_gcs" not in render_ids:
        render_ids.append("generic_gcs")
    elif "900021" in render_ids and "generic_gcs" not in render_ids: # MANET
        render_ids.append("generic_gcs")

    lines = ["graph TD"]
    connections = []
    
    def connect(s_node, s_port, s_pin, t_node, t_port, t_pin, link_type="wire", label=None):
        connections.append({
            "s_node": s_node, "s_port": s_port, "s_pin": s_pin,
            "t_node": t_node, "t_port": t_port, "t_pin": t_pin,
            "type": link_type, "label": label
        })

    # Group Nodes structurally
    air_ids = [cid for cid in render_ids if COMPONENTS.get(cid, {}).get("type") != "gcs"]
    gcs_ids = [cid for cid in render_ids if COMPONENTS.get(cid, {}).get("type") == "gcs"]
    
    def render_subgraph(name, title, members):
        if not members: return
        lines.append(f"  subgraph {name} [\"{title}\"]")
        for cid in members:
            if cid in COMPONENTS:
                comp = COMPONENTS[cid]
                lines.append(f"    subgraph {cid} [\"{comp['name']}\"]")
                for port_name, pins in comp["ports"].items():
                    port_id = f"{cid}_{port_name}"
                    lines.append(f"      {port_id}({port_name})")
                    for pin in pins:
                        lines.append(f"      {port_id}_{pin}[{pin}]")
                lines.append("    end")
        lines.append("  end")

    render_subgraph("AIR_VEHICLE", "Vehicular Subsystems", air_ids)
    render_subgraph("GND_STATION", "Ground Segment", gcs_ids)
    
    # Identify active autopilot
    autopilot = next((cid for cid in render_ids if COMPONENTS.get(cid, {}).get("type") == "autopilot"), None)

    # 1. POWER WIRING
    if "battery" in render_ids:
        for cid in [i for i in render_ids if i != "battery"]:
            comp = COMPONENTS.get(cid)
            if not comp: continue
            if "POWER1" in comp["ports"]:
                connect("battery", "OUTPUT", "VCC", cid, "POWER1", "VCC", "power", "Power Rail")
                connect("battery", "OUTPUT", "GND", cid, "POWER1", "GND", "power", "Ground")
            elif "POWER" in comp["ports"] and "VCC_IN" in comp["ports"]["POWER"]:
                connect("battery", "OUTPUT", "VCC", cid, "POWER", "VCC_IN", "power", "High Current")
                connect("battery", "OUTPUT", "GND", cid, "POWER", "GND_IN", "power", "Ground")
            elif "PWR" in comp["ports"]:
                connect("battery", "OUTPUT", "VCC", cid, "PWR", "VCC", "power", "VBAT")
                connect("battery", "OUTPUT", "GND", cid, "PWR", "GND", "power", "Ground")

    # 2. AUTOPILOT SENSORS & SERIAL
    if autopilot:
        if "900015" in render_ids: # AJGPS
            connect(autopilot, "GPS1", "TX", "900015", "UART", "RX", "wire", "Serial")
            connect(autopilot, "GPS1", "RX", "900015", "UART", "TX", "wire", "Serial")
            connect(autopilot, "GPS1", "SCL", "900015", "I2C", "SCL", "wire", "I2C")
            connect(autopilot, "GPS1", "SDA", "900015", "I2C", "SDA", "wire", "I2C")
            connect(autopilot, "GPS1", "GND", "900015", "UART", "GND", "wire", "GND")
            if "V5" in COMPONENTS[autopilot]["ports"]["GPS1"]:
                connect(autopilot, "GPS1", "V5", "900015", "PWR", "VCC", "power", "5V")

        if "esc_generic" in render_ids:
            connect(autopilot, "MAIN_OUT", "S1", "esc_generic", "SIGNAL", "PWM", "wire", "PWM 1-4") # Use S1 or PWM dynamically
            
        if "900009" in render_ids: # Rover Core
            connect(autopilot, "TELEM2", "TX", "900009", "MAVLINK", "RX", "wire", "MAVLink")
            connect(autopilot, "TELEM2", "RX", "900009", "MAVLINK", "TX", "wire", "MAVLink")
            connect(autopilot, "TELEM2", "GND", "900009", "MAVLINK", "GND", "wire", "GND")

        if "herelink" in render_ids:
            if "900033" in render_ids: # Amplifier
                connect(autopilot, "TELEM1", "TX", "900033", "SIGNAL_IN", "SIG", "wire", "To Amp")
                connect("900033", "RF_OUT", "ANT", "herelink", "BUS1", "RX", "wire", "Amp Out")
            else:
                connect(autopilot, "TELEM1", "TX", "herelink", "BUS1", "RX", "wire", "UART")
                connect(autopilot, "TELEM1", "RX", "herelink", "BUS1", "TX", "wire", "UART")
                connect(autopilot, "TELEM1", "GND", "herelink", "BUS1", "GND", "wire", "GND")
                
        if "rfd900" in render_ids and "herelink" not in render_ids:
            connect(autopilot, "TELEM1", "TX", "rfd900", "HEADER", "RX", "wire", "UART")
            connect(autopilot, "TELEM1", "RX", "rfd900", "HEADER", "TX", "wire", "UART")

        if "900021" in render_ids: # MANET
            connect(autopilot, "TELEM1", "TX", "900021", "DATA", "RX", "wire", "Ethernet/Serial")
            connect(autopilot, "TELEM1", "RX", "900021", "DATA", "TX", "wire", "Ethernet/Serial")
            
        if "276137616" in render_ids: # Gimbal
            connect(autopilot, "TELEM2", "TX", "276137616", "UART", "RX", "wire", "Serial")
            connect(autopilot, "TELEM2", "RX", "276137616", "UART", "TX", "wire", "Serial")

    # 3. EDGE COMPUTING PERIPHERALS
    if "900009" in render_ids:
        if "900006" in render_ids:
            connect("900009", "ETH", "T+", "900006", "ETH", "R+", "wire", "Ethernet")
            connect("900009", "ETH", "T-", "900006", "ETH", "R-", "wire", "Ethernet")
        if "900007" in render_ids:
            connect("900009", "ETH", "T+", "900007", "ETH", "R+", "wire", "Ethernet")
            connect("900009", "ETH", "T-", "900007", "ETH", "R-", "wire", "Ethernet")
        if "900005" in render_ids:
            connect("900009", "MAVLINK", "TX", "900005", "UART", "RX", "wire", "UART")
            connect("900009", "MAVLINK", "RX", "900005", "UART", "TX", "wire", "UART")

    # 4. RF CONNECTIVITY (Wireless links)
    if "herelink" in render_ids and "herelink_gcs" in render_ids:
        connect("herelink", "RF_OUT", "ANT1", "herelink_gcs", "RF_IN", "ANT1", "radio", "2.4GHz Video/Telemetry")
    if "rfd900" in render_ids and "generic_gcs" in render_ids:
        connect("rfd900", "ANT", "RF_INOUT", "generic_gcs", "RF_IN", "ANT", "radio", "900MHz Link")
    if "900021" in render_ids and "generic_gcs" in render_ids:
        connect("900021", "ANT", "RF_OUT", "generic_gcs", "RF_IN", "ANT", "radio", "MANET Link")
        
    # Fiber Link
    if "900034" in render_ids and autopilot:
        connect("900034", "FIBER", "TX", autopilot, "TELEM1", "RX", "fiber", "Zero RF Link")
        connect(autopilot, "TELEM1", "TX", "900034", "FIBER", "RX", "fiber", "Zero RF Link")

    # Process and Style Connections
    link_idx = 0
    for link in connections:
        p1 = f"{link['s_node']}_{link['s_port']}_{link['s_pin']}"
        p2 = f"{link['t_node']}_{link['t_port']}_{link['t_pin']}"
        
        arrow, style = "-->", "stroke:#94a3b8,stroke-width:1px"
        if link["type"] == "power":
            arrow, style = "==>", "stroke:#ef4444,stroke-width:2px"
        elif link["type"] == "radio":
            arrow, style = "-.->", "stroke:#3b82f6,stroke-width:2px,stroke-dasharray: 5 5"
        elif link["type"] == "fiber":
            arrow, style = "--o", "stroke:#10b981,stroke-width:3px"
            
        label = f"|\"{link['label']}\"|" if link["label"] else ""
        lines.append(f"  {p1} {arrow}{label} {p2}")
        lines.append(f"  linkStyle {link_idx} {style};")
        link_idx += 1

    return "\n".join(lines)

def generate_exhaustive_combinations() -> List[List[str]]:
    autopilots = ["900029", "900030"] # Cube Orange+, Pixhawk 6C
    transmissions = ["herelink", "900021", "rfd900", "900034"] # herelink, MANET, RFD900, Fiber
    
    # Core Peripherals
    payloads = ["276137616"] # ZR10 Gimbal
    navigation = ["900015"] # AJGPS
    compute = ["900009"] # Rover Core
    amplifiers = ["900033"] # 20W Amp
    sensors = ["900006", "900005", "900007"] # Acoustic Array, Node, Mobile Station
    propulsion = ["esc_generic"]
    
    all_combos = []
    
    for autopilot in autopilots:
        for trans in transmissions:
            # 1. Basic Link (Base combos)
            all_combos.append([autopilot, trans])
            all_combos.append([autopilot, trans, "esc_generic"])
            
            # 2. Add individual core peripherals
            for p in navigation + payloads + compute:
                all_combos.append([autopilot, trans, p])
                all_combos.append([autopilot, trans, p, "esc_generic"])
            
            # 3. Add combinations of Nav + Payload (Common mission profiles)
            for nav in navigation:
                for pay in payloads:
                    all_combos.append([autopilot, trans, nav, pay])
                    all_combos.append([autopilot, trans, nav, pay, "esc_generic"])
            
            # 4. Advanced Edge Stacks (Autopilot + Link + Nav + Compute + Sensor)
            for nav in navigation:
                for comp in compute:
                    for s in sensors:
                        all_combos.append([autopilot, trans, nav, comp, s])
                        all_combos.append([autopilot, trans, nav, comp, s, "esc_generic"])
                        # Add Gimbal to the stack
                        all_combos.append([autopilot, trans, nav, comp, s, "276137616"])
                        all_combos.append([autopilot, trans, nav, comp, s, "276137616", "esc_generic"])

            # 5. Multi-Sensor Stacks (Acoustic Array + Node)
            all_combos.append([autopilot, trans, "900006", "900005"])
            all_combos.append([autopilot, trans, "900006", "900005", "esc_generic"])

            # 6. Amplified Long Range combos
            if trans in ["herelink", "rfd900", "900021"]:
                for nav in navigation:
                    all_combos.append([autopilot, trans, "900033", nav])
                    all_combos.append([autopilot, trans, "900033", nav, "esc_generic"])
                    all_combos.append([autopilot, trans, "900033", nav, "276137616"])
                    all_combos.append([autopilot, trans, "900033", nav, "276137616", "esc_generic"])

    return all_combos

def main():
    combinations = generate_exhaustive_combinations()
    # Explicit specific combinations
    combinations.append(["900029", "herelink", "276137616"])
    
    unique_combos = []
    seen = set()
    for c in combinations:
        s_c = tuple(sorted(map(str, c)))
        if s_c not in seen:
            unique_combos.append(c)
            seen.add(s_c)
    
    combinations = unique_combos
    print(f"Generating {len(combinations)} System Architecture Blueprints...")
    
    output_dirs = ["public/data/mermaid", "src/data/mermaid"]
    for d in output_dirs:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
        
    sync_commands = ["-- Sync Wiring Combinations (Generated)", "DELETE FROM public.wiring_combinations;"]
    
    for combo in combinations:
        content = generate_mermaid(combo)
        # Store in DB and FS relying only on the explicit cart IDs requested (not implicitly added parts)
        sorted_ids = sorted(map(str, combo))
        filename = f"wiring_{'_'.join(sorted_ids)}.mmd"
        checksum = hashlib.md5(content.encode()).hexdigest()
        
        for d in output_dirs:
            with open(os.path.join(d, filename), "w") as f:
                f.write(content)
            
        # Add quotes for string IDs
        id_strs = []
        for i in combo:
            if i.isdigit(): id_strs.append(str(i))
            else: id_strs.append(f'"{i}"')
            
        postgres_ids = f"{{ {', '.join(id_strs)} }}"
        sync_commands.append(f"INSERT INTO public.wiring_combinations (component_ids, mermaid_path, checksum) VALUES ('{postgres_ids}', '{filename}', '{checksum}');")

    for d in output_dirs:
        with open(os.path.join(d, "sync.sql"), "w") as f:
            f.write("\n".join(sync_commands))

    print(f"Successfully wrote mermaid files and updated sync.sql!")

if __name__ == "__main__":
    main()
