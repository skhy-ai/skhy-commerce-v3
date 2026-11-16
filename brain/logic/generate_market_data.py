
import csv
import os

# Define the output directory
OUTPUT_DIR = "download"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Data Structure
# customers: Companies that might BUY Skhy products (Defense systems, Energy monitoring, etc.)
# partners: Companies that might SELL/Collaborate (Component suppliers, Integrators, Distributors)

data = {
    "Denmark": {
        "customers": [
            ["Procurement Team", "info@terma.com", "Terma Group", "Denmark", "Europe", "Interested in: Acoustic Sensors, MANET Radios, Threat Awareness System"],
            ["Drone Fleet Manager", "contact@sky-watch.com", "Sky-Watch", "Denmark", "Europe", "Interested in: AJGPS, Edge AI Nodes, Morrigan AI"],
            ["CTO", "info@nordic-wing.com", "Nordic Wing", "Denmark", "Europe", "Interested in: AeroGuard Cones, Acoustic-AI Flight Controller"],
            ["Asset Protection", "info@orsted.com", "Orsted", "Denmark", "Europe", "Interested in: Perimeter Defense System, Robin Platform (Wind Farm Security)"],
            ["Operations", "contact@uxvtechnologies.com", "UXV Technologies", "Denmark", "Europe", "Interested in: Ground Control Units, MANET Radios"],
            ["Security Director", "info@copenhagenairports.dk", "Copenhagen Airports", "Denmark", "Europe", "Interested in: SKHY-A16 Long Range Acoustic Array, Counter-Drone Systems"],
            ["Technical Director", "contact@ad-drones.com", "Andersen Dynamics", "Denmark", "Europe", "Interested in: SKHY Jamming Resilient Edge AI"],
        ],
        "partners": [
            ["Partnership Manager", "sales@phaseone.com", "Phase One", "Denmark", "Europe", "Potential Seller of: High-resolution Aerial Cameras, Imaging Sensors"],
            ["Business Dev", "info@danelec.com", "Danelec Marine", "Denmark", "Europe", "Potential Seller of: VDR Data Interfaces, Maritime IoT Integration"],
            ["Sales", "contact@explicit.dk", "Explicit ApS", "Denmark", "Europe", "Potential Seller of: Emissions Monitoring Sensors"],
            ["Distributor Relations", "support@scandinavianavionics.com", "Scandinavian Avionics", "Denmark", "Europe", "Potential Seller of: Avionics Integration Services"],
            ["Strategic Partnerships", "info@mydefence.dk", "MyDefence", "Denmark", "Europe", "Potential Seller of: RF Sensors (Complementary to Acoustic)"],
        ]
    },
    "India": {
        "customers": [
            ["Procurement Division", "marketing@bel.co.in", "Bharat Electronics Ltd (BEL)", "India", "Asia", "Interested in: Technology Transfer, Acoustic Arrays, Anti-Jamming GPS"],
            ["Innovation Cell", "director@drdo.gov.in", "DRDO (Defence Research & Development Organisation)", "India", "Asia", "Interested in: Edge AI Fusion Nodes, MANET Research"],
            ["Operations Head", "contact@adanidefence.com", "Adani Defence & Aerospace", "India", "Asia", "Interested in: UAV Systems, Peripheral Security, Border Surveillance"],
            ["Asset Integrity", "info@ongc.co.in", "ONGC (Oil and Natural Gas Corp)", "India", "Asia", "Interested in: Scarlet Pipeline Monitoring, Robin GIS Platform"],
            ["Security Chief", "contact@ril.com", "Reliance Industries Limited", "India", "Asia", "Interested in: Refinery Perimeter Defense, Industrial Drone Security"],
            ["CTO", "info@ideaforge.co.in", "ideaForge", "India", "Asia", "Interested in: AJGPS Modules, Lightweight Acoustic Sensors for Drones"],
            ["Network Solutions", "contact@tataadvancedsystems.com", "Tata Advanced Systems", "India", "Asia", "Interested in: MANET Radios, Command & Control Systems"],
        ],
        "partners": [
            ["Sales Director", "sales@zen.in", "Zen Technologies", "India", "Asia", "Potential Seller of: Anti-Drone Simulators, Combat Training Systems"],
            ["Business Dev", "info@zmotion.in", "Z-Motion Autonomous Systems", "India", "Asia", "Potential Seller of: Drone Frames, Propulsion Systems"],
            ["Partnerships", "contact@astramed.com", "Astra Microwave Products", "India", "Asia", "Potential Seller of: Radar Sub-systems, RF Components"],
            ["Retail Manager", "sales@robu.in", "Robu.in", "India", "Asia", "Potential Seller of: Hobbyist/Prototyping Electronics Components"],
            ["Corporate Sales", "info@centumelectronics.com", "Centum Electronics", "India", "Asia", "Potential Seller of: Microelectronics, Frequency Control Products"],
        ]
    },
    "Germany": {
        "customers": [
            ["Purchasing Dept", "info@rheinmetall.com", "Rheinmetall AG", "Germany", "Europe", "Interested in: Acoustic Threat Detection, Vehicle Integration Kits"],
            ["Sensor Systems", "info@hensoldt.net", "Hensoldt", "Germany", "Europe", "Interested in: Passive Sensing, Sensor Fusion AI"],
            ["Drone Logistics", "info@wingcopter.com", "Wingcopter", "Germany", "Europe", "Interested in: AJGPS 300 Series, Long-range Comms (MANET)"],
            ["Grid Security", "contact@siemens-energy.com", "Siemens Energy", "Germany", "Europe", "Interested in: Critical Infrastructure Protection, Robin Platform"],
            ["Procurement", "info@diehl.com", "Diehl Defence", "Germany", "Europe", "Interested in: Guided Munition Components, GNSS Anti-Jamming"],
            ["Innovation Lab", "contact@volocopter.com", "Volocopter", "Germany", "Europe", "Interested in: Situational Awareness Sensors, Collision Avoidance"],
        ],
        "partners": [
            ["Sales Engineering", "support@infineon.com", "Infineon Technologies", "Germany", "Europe", "Potential Seller of: Power Semiconductors, Radar Chips, Security ICs"],
            ["Key Accounts", "sales@rohde-schwarz.com", "Rohde & Schwarz", "Germany", "Europe", "Potential Seller of: Test & Measurement Equipment, Secure Comms"],
            ["Avionics Sales", "info@jenoptik.com", "Jenoptik", "Germany", "Europe", "Potential Seller of: Optical Systems, Laser Rangefinders"],
            ["Business Dev", "contact@h-aero.com", "Hybrid-Airplane Technologies", "Germany", "Europe", "Potential Seller of: Hybrid UAV Platforms"],
            ["Distributor", "info@conrad.de", "Conrad Electronic", "Germany", "Europe", "Potential Seller of: General Electronics, Tools, Maintenance Supplies"],
        ]
    },
    "Singapore": {
        "customers": [
            ["Defence Procurement", "procurement@stengg.com", "ST Engineering", "Singapore", "Asia", "Interested in: Urban Security, Counter-UAS, Perimeter Defense"],
            ["Port Security", "security@globalpsa.com", "PSA International", "Singapore", "Asia", "Interested in: Maritime Acoustic Sensing, Drone Surveillance"],
            ["R&D Acquisition", "contact@dso.org.sg", "DSO National Laboratories", "Singapore", "Asia", "Interested in: Advanced Signal Processing, Edge AI"],
            ["Fleet Management", "info@heron-technology.com", "Heron Technology", "Singapore", "Asia", "Interested in: UTM Integration, Secure Drone Comms"],
            ["Operations", "info@cwtaerospace.com", "CWT Aerospace", "Singapore", "Asia", "Interested in: ISR Drones, Training Simulators"],
            ["Technical Lead", "contact@hope-technik.com", "Hope Technik", "Singapore", "Asia", "Interested in: Custom Robotics Sensors, MANET"],
        ],
        "partners": [
            ["Sales Team", "sales@excelaerospace.com", "Excel Aerospace", "Singapore", "Asia", "Potential Seller of: Aircraft Maintenance Services, Parts"],
            ["Business Dev", "info@visdynamics.com", "VisDynamics", "Singapore", "Asia", "Potential Seller of: Semiconductor Inspection Equipment"],
            ["Component Sales", "sales.sg@avnet.com", "Avnet Asia", "Singapore", "Asia", "Potential Seller of: Electronic Components, Embedded Boards"],
            ["Partnerships", "contact@garuda-robotics.com", "Garuda Robotics", "Singapore", "Asia", "Potential Seller of: Drone Analytics Software, Fleet Mgmt"],
            ["Operations", "info@kelvin-hughes.com", "Hensoldt (Singapore Branch)", "Singapore", "Asia", "Potential Seller of: Radar Systems Integration"],
        ]
    },
    "Switzerland": {
        "customers": [
            ["Technology Scouting", "info@ruag.com", "RUAG", "Switzerland", "Europe", "Interested in: Aerostructures, Simulation & Training"],
            ["Drone Eng", "hello@wingtra.com", "Wingtra", "Switzerland", "Europe", "Interested in: High-precision GNSS, Anti-Jamming"],
            ["Flight Ops", "info@swissdrones.com", "SwissDrones", "Switzerland", "Europe", "Interested in: Long-range Communication, Detect & Avoid"],
            ["Security", "contact@abb.com", "ABB", "Switzerland", "Europe", "Interested in: Plant Security, Industrial IoT Sensors"],
            ["Supply Chain", "info@pilatus-aircraft.com", "Pilatus Aircraft", "Switzerland", "Europe", "Interested in: Cockpit Avionics Protection, Training Systems"],
            ["Research", "info@csem.ch", "CSEM", "Switzerland", "Europe", "Interested in: Ultra-low power AI, MEMS Innovation"],
        ],
        "partners": [
            ["Sensor Sales", "info@sensirion.com", "Sensirion", "Switzerland", "Europe", "Potential Seller of: Environmental Sensors, Flow Sensors"],
            ["Drive Systems", "info@maxongroup.com", "Maxon", "Switzerland", "Europe", "Potential Seller of: High-precision Motors for Drones/Gimbals"],
            ["Connectivity", "sales@u-blox.com", "u-blox", "Switzerland", "Europe", "Potential Seller of: GNSS Modules, Cellular IoT Chips"],
            ["Imaging", "info@leica-geosystems.com", "Leica Geosystems", "Switzerland", "Europe", "Potential Seller of: Surveying Equipment, LiDAR"],
            ["Computing", "sales@toradex.com", "Toradex", "Switzerland", "Europe", "Potential Seller of: System on Modules (SoMs) for Edge Computing"],
        ]
    },
    "UAE": {
        "customers": [
            ["Procurement", "procurement@edgegroup.ae", "EDGE Group", "UAE", "Middle East", "Interested in: Full Spectrum Defense, Electronic Warfare, Smart Weapons"],
            ["Technology", "info@adnoc.ae", "ADNOC", "UAE", "Middle East", "Interested in: Oilfield Security, Pipeline Monitoring (Scarlet/Robin)"],
            ["Fleet Ops", "info@calidus.ae", "Calidus", "UAE", "Middle East", "Interested in: Land Systems Protection, Aerial Surveillance"],
            ["Operations", "contact@halcon.ae", "HALCON", "UAE", "Middle East", "Interested in: Guidance Kits, Anti-Jamming Systems"],
            ["Security", "info@enoc.com", "ENOC", "UAE", "Middle East", "Interested in: Asset Tracking, Perimeter Intrusion Detection"],
            ["Strategic Projects", "info@tawazun.ae", "Tawazun Council", "UAE", "Middle East", "Interested in: Defense R&D, Strategic Tech Localization"],
        ],
        "partners": [
            ["Sales", "sales@adasi.ae", "ADASI", "UAE", "Middle East", "Potential Seller of: Autonomous Systems Integration"],
            ["Satcom", "info@yahsat.ae", "Yahsat", "UAE", "Middle East", "Potential Seller of: Satellite Communication Links"],
            ["Armored Vehicles", "info@nimr.ae", "NIMR", "UAE", "Middle East", "Potential Seller of: Vehicle Platforms for Mobile Sensor Stations"],
            ["Maritime", "info@adsb.ae", "Abu Dhabi Ship Building", "UAE", "Middle East", "Potential Seller of: Naval Platforms for Radar/Sonar Integration"],
            ["Distributor", "sales@emiratesdefense.com", "Emirates Defense Technology", "UAE", "Middle East", "Potential Seller of: Maintenance & Logistics Services"],
        ]
    }
}

headers = ["Name", "Email", "Company", "Country", "Region", "Notes"]

for country, categories in data.items():
    # Write Customers CSV
    customer_filename = os.path.join(OUTPUT_DIR, f"potential_customers_{country.lower()}.csv")
    with open(customer_filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(categories['customers'])
    print(f"Created {customer_filename}")

    # Write Partners CSV
    partner_filename = os.path.join(OUTPUT_DIR, f"potential_partners_{country.lower()}.csv")
    with open(partner_filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(categories['partners'])
    print(f"Created {partner_filename}")

print("All CSV files generated successfully.")
