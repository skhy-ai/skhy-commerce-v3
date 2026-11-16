// src/data/threatManagerDocs.ts
// Single source of truth for SKHY Threat Awareness Manager (TAM) documentation suite

export interface ThreatManagerDoc {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  badge: string;
  googleDriveUrl: string;
  format: string;
  version: string;
  classification: string;
  keyTopics: string[];
  fullMarkdownContent: string;
}

export const THREAT_MANAGER_DOCS: ThreatManagerDoc[] = [
  {
    id: 'tam-readme',
    title: 'Threat Awareness Manager — System Architecture & README',
    subtitle: 'Autonomous Air Defense C2, Multi-Modal Swarm Simulation Engine & True 3D Tactical Planning Suite',
    description: 'Enterprise-grade architectural specification covering NATO STANAG 4869 and UK MoD SAPIENT compliance, non-circular concentric perimeter resolution, Autonomous Engagement Zones (AEZ), and 8-cardinal threat vector alignment.',
    category: 'System Architecture',
    badge: 'Core Architecture',
    googleDriveUrl: 'https://drive.google.com/file/d/1MI9-dQvp_pqXXjgw__wDvxnDC9YGAyJz/view?usp=sharing',
    format: 'Technical Whitepaper (PDF / Online)',
    version: 'v2.4 (2026 Edition)',
    classification: 'Commercial Proprietary / Export Ready',
    keyTopics: [
      'Hierarchical Perimeter Engine (Warning > Hazardous > Restricted)',
      'Autonomous Engagement Zone (AEZ) Scoping & Fire-Control Rules',
      '8-Cardinal Threat Vector Orientation (N, NE, E, SE, S, SW, W, NW)',
      'Multi-Modal Sensor Fusion (Acoustic + Wideband RF + Electro-Optical)',
      'True 3D Tactical Planning (MapLibre GL DEM Hillshading & Rooftop Masts)',
      'Dark Spot Valley Remediation & Line-of-Sight Geometry'
    ],
    fullMarkdownContent: `# Dharmic Guardian | SKHY Threat Awareness Manager
### Autonomous Air Defense C2, Multi-Modal Swarm Simulation Engine & True 3D Tactical Planning Suite

**Dharmic Guardian / Threat Awareness Manager (TAM)** is an enterprise-grade Command and Control (C2) and tactical mission planning platform engineered for counter-unmanned aircraft system (C-UAS) networks, integrated air defense, and critical infrastructure defense. Built to comply with NATO STANAG and UK MoD **SAPIENT** (Sensing for Asset Protection with Integrated Electronic Networked Technology) messaging standards, the platform provides real-time multi-modal sensor fusion, autonomous engagement zone (AEZ) management, and 3D geospatial mission planning.

---

## 🎯 Key Operational Capabilities & Doctrinal Features

### 1. Hierarchical Perimeter Engine & Threat Vector Analysis
- **Non-Circular, Concentric Polygon Geometries**: Supports complex tactical geometries (Early Warning, Defense, Critical/Restricted) with innermost-first priority resolution (\`Restricted (Priority 3)\` > \`Hazardous (Priority 2)\` > \`Warning (Priority 1)\`). Outer zones never overwrite inner zones.
- **Autonomous Engagement Zone (AEZ) Scoping**: Each perimeter maintains an independent AEZ flag. Kinetic interception is restricted strictly to active AEZ polygons, preventing false automated fires over outer warning or non-AEZ transit sectors.
- **8-Cardinal Threat Vector Orientation**: Calculates incoming threat azimuths (N, NE, E, SE, S, SW, W, NW). Interceptor launchers and directional electronic warfare (EW) jammers are automatically oriented along the threat vector before engagement.

### 2. Jammer-First Soft-Kill Trial & Fixed-Wing Shahed Escalation
- **EW Soft-Kill Trial (2-3 seconds)**: Every detected hostile target is initially engaged with directional electronic warfare to neutralize commercial or quadcopter threats without firing kinetic ammunition.
- **CRPA/INS Jamming Resistance**: Fixed-wing loitering munitions (e.g., Shahed-136 delta-wings equipped with Controlled Reception Pattern Antennas and Inertial Navigation Systems) resist RF disruption (\`jam_failed\`), triggering immediate escalation to kinetic interceptors.
- **Doctrinal Alignment Sequence**: In non-AEZ sectors, launcher vector alignment **predates** the transmission of the operator C2 authorization request, ensuring instantaneous firing the moment authorization is granted.

### 3. Residential Protection & Collateral Damage Exclusion
- **Automated Landuse Scanning**: Integrates OpenStreetMap (OSM) Overpass API to automatically identify residential, commercial, and densely populated civilian zones.
- **Collateral Damage Exclusion Zones**: Populated areas are rendered with high-visibility rose/magenta hatched overlays.
- **Kinetic Fire Lockout**: Kinetic interceptor launches and anti-air strikes directly overhead protected residential zones are hard-locked (\`collateral_risk\`), forcing the engagement engine to wait until the target enters an uninhabited buffer sector.

### 4. Weibel Continuous Wave (CW) Mobile Radar Platform & Point Defense
- **High-Precision CW Tracking**: Emulates a Weibel Scientific continuous-wave mobile radar truck that provides Doppler velocity filtering against low-RCS, slow-moving targets.
- **30mm AA Turret (<1,000m AGL)**: Provides terminal point defense for targets penetrating within 1,000 meters.
- **Anti-Radiation RF-Seeker Drone Countermeasure**:
  - When an RF-homing drone is detected, the CW radar platform immediately issues an alert.
  - Deploys an **Active RF Decoy Buoy** to lure incoming anti-radiation missiles.
  - Enters **EMCON (Emission Control / Silent Mode)** to eliminate radar RF signatures.
  - Initiates tactical truck relocation (50 km/h) to a secure standoff waypoint while distributed acoustic and passive RF sensors maintain continuous track fusion.

### 5. Weather Degradation & High-Altitude Interception Engine
- **Meteorological Scenarios**: Simulates Clear, Heavy Fog, Storm/Rain, and Low Cloud Deck atmospheric conditions.
- **Sensor Degradation**: Dynamically degrades electro-optical (EO) and infrared (FLIR) ranges down to 25% under heavy fog, automatically shifting C2 tracking weight to Doppler radar and acoustic microphone arrays.
- **High-Altitude MALE Jet Interceptor**: Targets operating at high altitudes (5,000m - 8,000m AGL) outside the envelope of ground-based point interceptors trigger the immediate scrambling of a jet-powered Medium-Altitude Long-Endurance (MALE) interceptor armed with an airborne anti-air gun pod.

### 6. True 3D Tactical Planning & Dark Spot Remediation
- **MapLibre GL 3D Terrain Engine**: Real-time 3D Digital Elevation Model (DEM) terrain hillshading, 3D building extrusions, and free-camera tilt (0° to 85°) with bearing rotation.
- **Urban Rooftop & Mast Elevation**: Each planned sensor supports adjustable mast height (1m - 50m AGL) and rooftop mounting (+15m to 80m building elevation) to overcome urban street canyon clutter.
- **3D Sensor Coverage Envelopes**: Visualizes true 3D radar domes, EW jammers, and optical envelopes elevated above buildings.
- **Interactive Repositioning & Blind Spot Remediation**: Proposed sensors can be dragged in 3D to cover terrain shadow zones ("dark spots"). A dedicated **"Remediate Dark Spot"** action automatically drops elevated gap-filler nodes into shadowed valleys.

### 7. Live Civilian Air Traffic (ADS-B Exchange Feed)
- **Local Proxy Streaming (\`/api/adsb\`)**: Queries real-time transponder data (airplanes.live and opendata.adsb.fi) with zero CORS friction.
- **Realistic Flight Corridors Fallback**: If operating in an active NOTAM/warzone corridor or offline, generates realistic commercial high-altitude flights (FL350) and low-altitude medevac flights (3,000ft AGL) for IFF and civilian deconfliction drills.`
  },
  {
    id: 'tam-api-integration',
    title: 'Threat Awareness Manager — API Integration & SAPIENT Protocol Specification',
    subtitle: 'UK DSTL BSI Flex 335 Standards, STANAG 4869 Protocols, MQTT Telemetry & External Defense Bridges',
    description: 'Comprehensive technical interface documentation detailing MQTT 3.1.1/5.0 topic architectures, REST endpoints, SAPIENT XML/JSON message structures, MANET mesh routing, and ArduDeck GCS telemetry hooks.',
    category: 'API & Systems Integration',
    badge: 'API & SAPIENT Spec',
    googleDriveUrl: 'https://drive.google.com/file/d/1665i8RINl3Vj7ULeZLPUr-tK4l1P6ytS/view?usp=drive_link',
    format: 'Technical Interface Guide (PDF / Online)',
    version: 'v2.4 (2026 Edition)',
    classification: 'Technical Confidential / Systems Integrators',
    keyTopics: [
      'UK MoD DSTL SAPIENT (BSI Flex 335 / STANAG 4869) Compliance',
      'MQTT 3.1.1 & 5.0 Topic Trees for High-Frequency Telemetry',
      'RESTful Command & Configuration Endpoints (JSON Schema)',
      'Real-Time Tactical MANET Mesh Routing (OLSR / BATMAN-adv)',
      'External GCS & ArduDeck Bi-Directional Bridge Protocols',
      'Sensor Node, Countermeasure, MANET & Kinetic Integration Checklists'
    ],
    fullMarkdownContent: `# SKHY Threat Awareness Manager — API Integration & Interface Control Document

## 1. Architecture Overview
This document specifies the technical interfaces, communication protocols, and data schemas required to integrate third-party sensors, command systems, and effectors into the SKHY Threat Awareness Manager (TAM) C2 ecosystem.

\`\`\`
+---------------------+         MQTT / REST         +-----------------------------+
| External Sensor     | --------------------------> | Threat Awareness Manager    |
| (Radar, RF, ACINT)  |                             | (SAPIENT Fusion Engine)     |
+---------------------+                             +-----------------------------+
                                                                  |
                                                                  | Real-time WebSocket
                                                                  v
+---------------------+         ArduDeck Bridge     +-----------------------------+
| Kinetic Interceptor | <-------------------------- | Common Operational Picture  |
| / Directed EW       |                             | (React / MapLibre 3D COP)   |
+---------------------+                             +-----------------------------+
\`\`\`

---

## 2. Communication Standards

### 2.1 MQTT Broker Protocol (Telemetry & Fast Alerts)
- **Version**: MQTT 3.1.1 or 5.0 over TLS (Port 8883)
- **Quality of Service**: QoS 1 (At least once) for detection alerts; QoS 0 for 1Hz heartbeats.
- **Topic Hierarchy**:
  - \`skhy/sensors/{sensor_id}/telemetry\`: Node heartbeat, battery voltage, temperature, CPU load.
  - \`skhy/sensors/{sensor_id}/alert\`: Instantaneous target detection events.
  - \`skhy/c2/effectors/{effector_id}/command\`: Jammer activation or interceptor launch commands.

### 2.2 SAPIENT Message Protocol (UK MoD DSTL / NATO STANAG 4869)
The Threat Awareness Manager natively serializes and deserializes SAPIENT Autonomous Sensor Messages (ASM) and Base Action Plans (BAP):

\`\`\`json
{
  "sapient_message": {
    "header": {
      "timestamp": "2026-10-22T02:40:00.000Z",
      "source_id": "SKHY-A16-NODE-04",
      "message_type": "DETECTION_REPORT"
    },
    "detection": {
      "track_id": "TRK-20261022-0941",
      "location": {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "altitude_m_agl": 140.5
      },
      "bearing_deg": 42.5,
      "elevation_deg": 18.2,
      "velocity_mps": 32.8,
      "classification": {
        "type": "FIXED_WING_LOITERING_MUNITION",
        "model_candidate": "Shahed-136",
        "confidence": 0.94
      },
      "threat_level": "CRITICAL"
    }
  }
}
\`\`\`

---

## 3. RESTful API Endpoints
All REST APIs accept \`application/json\` and require bearer token authentication: \`Authorization: Bearer <API_TOKEN>\`.

### 3.1 Sensor Registration & Heartbeat
- **POST** \`/api/v1/sensors/register\`
  - Registers a new fixed or mobile sensing asset.
- **POST** \`/api/v1/sensors/{id}/heartbeat\`
  - Updates operational status and health metrics.

### 3.2 Dynamic Perimeter & AEZ Configuration
- **GET** \`/api/v1/perimeters\`
  - Retrieves all active polygonal defense zones and priority ratings.
- **POST** \`/api/v1/perimeters\`
  - Pushes new concentric perimeter geometry with residential exclusion masks.

### 3.3 Interceptor Fire-Control Dispatch
- **POST** \`/api/v1/effectors/dispatch\`
  - Transmits target coordinate hand-off (WGS84 lat, lon, alt, velocity vector) to kinetic interceptor GCS.`
  }
];
