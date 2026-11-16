import { COMPANY_INFO } from '../constants/companyInfo';

export const SKHY_KNOWLEDGE_BASE = {
  company: {
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    registrationNo: COMPANY_INFO.registrationNo,
    tagline: COMPANY_INFO.tagline,
    mission: "To democratize sovereign defense technology, airspace security, and industrial AI by offering modular, jamming-resilient hardware and edge intelligence at a fraction of legacy defense costs.",
    overview: `SKHY AI (operating under ${COMPANY_INFO.legalName}) is a global defense deep-tech pioneer headquartered in Pune, India, with an international sales office in Kuala Lumpur, Malaysia. Specializing in passive acoustic intelligence (ACINT), C-UAS (Counter-Unmanned Aerial Systems) threat awareness, electronic warfare (EW) resilience, RF spectrum fusion, and industrial AI monitoring. Our asymmetric defense model delivers 50km² perimeter protection for $351K, contrasting legacy $4M+ active-radar SHORAD systems.`,
    hqAddress: COMPANY_INFO.hq.formattedAddress,
    globalHeadquarters: `${COMPANY_INFO.hq.city}, ${COMPANY_INFO.hq.country}`,
    salesOffice: `${COMPANY_INFO.salesOffice.city}, ${COMPANY_INFO.salesOffice.country}`,
    salesOfficeAddress: COMPANY_INFO.salesOffice.formattedAddress,
    indiaFacility: `${COMPANY_INFO.indiaEntity.legalName} (CIN: ${COMPANY_INFO.indiaEntity.cin})`,
    contactEmail: COMPANY_INFO.contact.email,
    contactPhone: COMPANY_INFO.contact.phone,
    portalUrl: COMPANY_INFO.contact.website
  },

  asymmetricCostComparison: {
    skhyMeshCost: "$351,000 for 50km² multi-layered passive perimeter defense",
    legacyCost: "$4,000,000+ for legacy SHORAD active radar systems",
    keyAdvantage: "Zero RF footprint (silent passive detection), immunity to anti-radiation missiles, zero cloud-dependency, air-gapped zero-trust OTA edge updates."
  },

  fiveLayersOfDefenseProtection: {
    overview: "The SKHY AI Defense Platform is built upon five integrated layers of protection, delivering an air-gapped, zero-RF emission, multi-modal airspace and perimeter security grid that bridges detection to kinetic threat elimination.",
    layers: [
      {
        layerNumber: "Layer 01",
        name: "Command & Control (C2): Threat Awareness Manager (TAM)",
        focus: "Plan, Simulate & Monitor",
        thoughtProcess: "Building an impenetrable defense network begins with simulation and upfront financial transparency. Commanders define tactical perimeters, simulate effector range, and calculate total hardware Bill of Materials (BOM) costs prior to physical deployment. Integrates live multi-modal sensors across thousands of square miles.",
        keyProducts: ["Threat Awareness Manager (TAM - https://skhytam.netlify.app)", "BOM Area Cost Calculator", "Tactical Perimeter Planner"],
        capabilities: ["Instant tactical perimeter mapping", "BOM cost estimation per km²", "Live sensor aggregation across large geographic operational areas"]
      },
      {
        layerNumber: "Layer 02",
        name: "Sensors: Passive Acoustic Arrays & Decoupled Nodes",
        focus: "Passive Detection & Zero-RF Footprint",
        thoughtProcess: "Decentralized sensor nodes designed for zero-RF emission. Unlike active radar that paints a target for anti-radiation missiles, passive MEMS acoustic arrays silently capture motor commutation, propeller blade-slap, and acoustic shockwaves in non-line-of-sight (NLOS) urban canyons or battlefield terrain.",
        keyProducts: ["SKHY-A16 Long-Range Sentinel (16-MEMS array, 500m-2km NLOS)", "SKHY-A7 Tactical Platoon Sentinel (7-MEMS, 48h battery)", "SKHY-MOBISENSE (6m pneumatic mast with dual LPDA RF antennas)", "AeroGuard Cones (UAV acoustic protection)"],
        capabilities: ["Sub-second acoustic threat classification (<300ms)", "NLOS detection through structures & terrain", "Zero electromagnetic emissions"]
      },
      {
        layerNumber: "Layer 03",
        name: "Edge Intelligence: SKHY MOBISUITE & Multi-Modal Fusion",
        focus: "Multi-Sensor Fusion & Automated Sequencing",
        thoughtProcess: "Eliminates operational blind spots by fusing RF spectrum intelligence (30MHz-6GHz) with acoustic DoA bearing data into a single pane of glass. Automated alert sequencing bridges initial detection directly to interceptor readiness, reducing reaction time and human error. Features GNSS-jamming resilient offline maps and buoy-mounted maritime RF/AIS fusion nodes.",
        keyProducts: ["SKHY MOBISUITE Engine", "Automated Alert Sequencer", "Buoy-Mounted Maritime RF/AIS Fusion Nodes"],
        capabilities: ["Acoustic + RF cross-correlation to eliminate false positives", "Resilient offline map caching during GPS spoofing", "Automated threat-to-effector queuing"]
      },
      {
        layerNumber: "Layer 04",
        name: "Eliminate Threat: Canister-Launched Kinetic Interceptors",
        focus: "Rapid Interception & Radio Mesh Resilience",
        thoughtProcess: "Deploys networked kinetic interceptors via canister-launched drone systems for rapid vertical takeoff and re-targeting of drone swarms. Integrated relay nodes maintain secure communications and high radio resilience during kinetic engagements.",
        keyProducts: ["SKHY Interceptor 5 (VTOL Light Kinetic Impact)", "SKHY Interceptor 7 (Carbon Fiber Sleek Kinetic Interceptor)", "APEX-24 Maritime Interceptor USV"],
        capabilities: ["Canister-launched rapid VTOL deployment", "Kinetic impact swarm neutralization", "Integrated radio relay for contested EW airspace"]
      },
      {
        layerNumber: "Layer 05",
        name: "Orchestration & Continuous AI: Vidur Manager & AutoML Loop",
        focus: "Field Orchestration & AutoML Retraining",
        thoughtProcess: "Field AI server managing edge inference models and zero-trust Over-The-Air (OTA) updates. Features an automated feedback loop (AutoML) for false positive training: confirmed false positives in TAM are transmitted over the mesh network to instantly retrain model weights, ensuring battle accuracy improves continuously with operational experience.",
        keyProducts: ["Vidur Manager (Air-Gapped AI Server & Hardware Guard)", "AutoML Continuous Retraining Engine", "Sovereign Edge OS (TPM 2.0 Root of Trust)"],
        capabilities: ["Air-gapped offline computer vision inference", "Real-time false positive AutoML retraining loop", "Zero-trust OTA model updates over MANET mesh"]
      }
    ]
  },

  defenseProductsAndOfferings: [
    {
      id: "skhy-a16-sentinel",
      name: "SKHY-A16 Long-Range Sentinel Array",
      category: "Layer 02: Sensors & C-UAS",
      tagline: "16-Element MEMS Passive Acoustic Threat Detector",
      description: "High-sensitivity 16-element MEMS acoustic microphone array in an 18cm ruggedized IP67 enclosure. Uses INT8 TensorRT neural inference (FFT spectral analysis, wavelet transforms, MFCC feature extraction) to detect, classify, and track Class 1 & 2 micro/fixed-wing drones, gunshots, and incoming projectiles from non-line-of-sight (NLOS) positions over 500m-2km without emitting any RF footprint.",
      hardwareSpecs: ["16-Element MEMS sensor array (18cm footprint)", "NVIDIA Jetson Orin Nano Edge Compute", "IP67 Weatherproof All-Weather Casing", "Sub-second detection latency (<300ms)"],
      actionCards: [
        {
          title: "SKHY-A16 Sentinel Specs",
          description: "Read technical specs on passive acoustic MEMS arrays & C-UAS threat detection.",
          linkText: "Read C-UAS Whitepaper",
          linkUrl: "/ThreatAwareness.html",
          isExternal: true
        }
      ]
    },
    {
      id: "skhy-a7-sentinel",
      name: "SKHY-A7 Tactical Platoon Sentinel",
      category: "Layer 02: Sensors & Tactical Guard",
      tagline: "Compact Platoon-Level Acoustic Guard",
      description: "Ultra-compact 7-element MEMS acoustic sensor designed for squad and platoon-level perimeter defense. Operates fully air-gapped on battery power for 48+ hours, providing instant audio direction-of-arrival (DoA) alerts for approaching FPV drones or sniper fire.",
      hardwareSpecs: ["7-MEMS Array", "Ultra-low power DSP", "48h Field Battery", "Tactical Radio Alert Integration"]
    },
    {
      id: "skhy-mobisense",
      name: "SKHY-MOBISENSE / Mobisuite Mobile Mast",
      category: "Layer 02 & 03: Mobile Perimeter Defense",
      tagline: "Rapid-Deploy Telescoping Acoustic + RF Sentinel Mast",
      description: "Vehicle-mountable or field-deployable telescoping mast fusing SKHY-A16 acoustic arrays with 30MHz-6GHz edge RF spectrum analyzers. Designed for rapid deployment along national borders, forward operating bases, and high-value VIP events.",
      hardwareSpecs: ["6m Pneumatic Telescoping Mast", "30MHz-6GHz RF Spectrum Analyzer", "SKHY-A16 Acoustic Array", "Dual 5GHz MANET + Satellite Backup"]
    },
    {
      id: "vidur-c2-manager",
      name: "SKHY Vidur Offline C2 AI Infrastructure",
      category: "Layer 05: Orchestration & AI",
      tagline: "Hardware-Agnostic Air-Gapped AI Guard & Command Center",
      description: "Sovereign, air-gapped field AI server and management system. Runs local edge computer vision (weapons, uniforms, combat vehicles, drone classification) and multi-sensor fusion without reaching out to external cloud servers, preventing cyber-espionage and data leaks.",
      softwareSpecs: ["Air-Gapped Zero-Trust Security", "Local Computer Vision Models", "Tactical Map C2 Overlay", "MQTT/HTTP Edge Protocols"]
    },
    {
      id: "resilicom-manet-radios",
      name: "Resilicom MANET Mesh Radios",
      category: "Layer 03: Resilient Communications",
      tagline: "Self-Healing Adaptive Tactical Mesh Network",
      description: "Military-grade Mobile Ad-Hoc Network (MANET) radios engineered for electronic warfare (EW) resilience. Features Frequency-Hopping Spread Spectrum (FHSS), dynamic BATMAN/OLSR mesh routing, and AES-256 encryption to connect drone swarms and field sensors in denied environments.",
      hardwareSpecs: ["Software-Defined Radio (USRP E310 / B210)", "Dual 5GHz & Sub-1GHz LoRa Transceivers", "AES-256 Hardware Encryption", "Satellite Uplink Failover"],
      actionCards: [
        {
          title: "Resilicom MANET Specifications",
          description: "Read whitepaper on tactical mesh networking in high-jamming environments.",
          linkText: "Read Resilicom Spec",
          linkUrl: "/Resilicomai.html",
          isExternal: true
        }
      ]
    },
    {
      id: "skhy-interceptors",
      name: "SKHY Interceptor 5 & 7 Canister-Launched Drones",
      category: "Layer 04: Eliminate Threat",
      tagline: "Networked VTOL Kinetic Drone Swarm Interceptors",
      description: "Canister-launched kinetic interceptor drones designed for rapid vertical launch and swarm neutralization. Features aerodynamic carbon fiber frames, integrated radio mesh relays, and automated target tracking.",
      hardwareSpecs: ["Canister Launch Pods", "VTOL Vertical Takeoff", "Carbon Fiber Airframe", "Kinetic Swarm Neutralization"]
    },
    {
      id: "apex24-interceptor",
      name: "APEX-24 Maritime Interceptor Platform",
      category: "Layer 04: Maritime Interception",
      tagline: "Canister-Launched Coastal Interceptor USV",
      description: "Unmanned Surface Vehicles (USV) acting as canister-launch platforms for kinetic interceptors, securing coastal waters, ports, and offshore infrastructure against illegal maritime intrusions.",
      hardwareSpecs: ["Canister-Launch Mechanism", "Subsea Hydrophone Interface", "AIS Radar Parser", "Autonomous USV Guidance"],
      actionCards: [
        {
          title: "APEX-24 Maritime Interceptor",
          description: "Canister-launched interceptor platform for coastal domain defense.",
          linkText: "Read APEX-24 Whitepaper",
          linkUrl: "/APEX24Interceptor.html",
          isExternal: true
        }
      ]
    },
    {
      id: "crpa-antennas-swarm-ai",
      name: "CRPA Anti-Jamming Antennas & Swarm AI C2",
      category: "Layer 03 & 04: Electronic Warfare",
      tagline: "Controlled Radiation Pattern Antennas & Decentralized Swarm C2",
      description: "Multi-element Controlled Radiation Pattern Antennas (CRPA) offering null-steering anti-jamming GPS reception for multirotor & fixed-wing UAVs, combined with decentralized swarm task allocation algorithms for kinetic target interception.",
      hardwareSpecs: ["4-Element / 7-Element CRPA Antennas", "GPS L1/L2 Anti-Jamming Nulling", "Decentralized Swarm Auction Engine", "PX4/ArduPilot Native Driver Integration"]
    }
  ],

  researchAndAdvancedRAndD: [
    {
      id: "van-atta-backscatter-research",
      name: "Van Atta Retroreflective Backscatter Radar Array",
      category: "Frontier Research & Advanced R&D",
      status: "Active Research Topic (Not a Commercial Product)",
      description: "Ongoing deep-tech research initiative exploring passive zero-power retroreflective Van Atta antenna arrays for radar cross-section (RCS) amplification, unpowered maritime transponder reflection, and dark vessel tracking theory. This is strictly a frontier research topic in electromagnetic simulation and lab validation phase, not available as a commercial product.",
      researchAreas: [
        "Zero-Power Passive Electromagnetic Backscatter",
        "Van Atta Array Phase-Conjugate Reflection Theory",
        "Subsea Acoustic & Radar Cross-Modulation",
        "Unpowered Maritime Transponder Augmentation"
      ]
    },
    {
      id: "quantum-tactical-mesh-research",
      name: "Quantum Key Distribution (QKD) & Post-Quantum Tactical Mesh",
      category: "Frontier Research & Advanced R&D",
      status: "Exploratory R&D Topic",
      description: "Research exploring Kyber KEM post-quantum cryptography and quantum key distribution over mobile ad-hoc networks (MANET) for air-gapped battlefield sensor grids."
    }
  ],

  industrialProductsAndOfferings: [
    {
      id: "pipeline-gis-acoustic",
      name: "Pipeline GIS Acoustic Integrity Sentinel",
      category: "Energy & Infrastructure Protection",
      tagline: "24/7 Acoustic MEMS + Satellite GIS Leak Detection",
      description: "Combines ground-mounted acoustic MEMS sensors with satellite GIS mapping to detect high-pressure gas leaks, pinhole ruptures, third-party illegal excavation/tapping, and ground vibration anomalies across thousands of kilometers of oil and gas pipelines.",
      details: "Detects sub-audible acoustic shockwaves and vibration frequencies in real-time, sending pinpoint GPS coordinates to pipeline operators via GIS dashboards.",
      actionCards: [
        {
          title: "Pipeline Monitoring Whitepaper",
          description: "GIS acoustic sensing case study for pipeline leak detection.",
          linkText: "View Pipeline Case Study",
          linkUrl: "https://drive.google.com/file/d/1c_nOnTvQmTOPytKAU_AbAImsBwksQlRR/view?usp=sharing",
          isExternal: true
        }
      ]
    },
    {
      id: "refinery-emission-sentinel",
      name: "Refinery & Industrial Chemical Fugitive Emission Sentinel",
      category: "Chemical & Industrial Safety",
      tagline: "Continuous Acoustic Leak & Bearing Friction Monitor",
      description: "Continuous 24/7 industrial acoustic monitoring arrays designed for refineries, chemical plants, and heavy manufacturing. Detects high-pressure steam leaks, hazardous gas valve failures, bearing friction degradation, and structural stress prior to catastrophic failures.",
      details: "Operates in extreme temperature environments (-40°C to +85°C) with intrinsic safety ratings."
    },
    {
      id: "mining-subsurface-seismic",
      name: "Mining Sub-Surface Seismic & Autonomous Vehicle AI",
      category: "Mining & Heavy Industry",
      tagline: "GPS-Denied Sub-surface Acoustic Navigation & Rockfall AI",
      description: "Ground-penetrating acoustic radar signal processing and sub-surface seismic intelligence for autonomous mining vehicle navigation and real-time rockfall hazard detection in deep underground mines.",
      details: "Provides 3D seismic acoustic mapping for underground tunnel stability and autonomous haul truck positioning."
    },
    {
      id: "smart-port-coastal-sonar",
      name: "Smart Port & Offshore Platform Acoustic Guard",
      category: "Maritime Infrastructure & Supply Chain",
      tagline: "Subsea Hydrophone & AIS Coastal Perimeter Shield",
      description: "Undersea hydrophone arrays combined with automated AIS vessel tracking for commercial shipping ports, LNG terminals, and offshore oil platforms to detect illegal divers, dark vessels, and underwater sabotage.",
      details: "Fuses underwater acoustic sonar signatures with surface optical AIS data to secure commercial maritime supply chains."
    }
  ],

  simulatorsAndTools: [
    {
      name: "Mission Architect 3D Simulator",
      route: "/plan-scenario",
      description: "Interactive 3D physics-validated simulation tool for designing custom multirotor and fixed-wing drone payloads, transmission mesh range, motor KV selection, and mission scenario execution.",
      videoEmbed: "https://www.youtube.com/embed/bIorfmCbCKc",
      videoTitle: "Mission Architect & Drone Modeling Demo",
      actionCards: [
        {
          title: "Launch 3D Mission Architect",
          description: "Design custom multirotor & fixed-wing drone payloads, CRPA antennas, and motor blueprints.",
          linkText: "Launch Simulator",
          linkUrl: "/plan-scenario",
          isExternal: false
        }
      ]
    },
    {
      name: "Heavy Lift Cargo Calculator",
      route: "/simulators/heavy-lift",
      description: "Payload capacity, motor KV, ESC current limit, and flight duration calculator for heavy-lift industrial cargo drones.",
      actionCards: [
        {
          title: "Heavy Lift Payload Calculator",
          description: "Calculate hover thrust, battery draw, and max payload mass.",
          linkText: "Open Payload Calculator",
          linkUrl: "/simulators/heavy-lift",
          isExternal: false
        }
      ]
    }
  ],

  publishedWhitepapers: [
    {
      id: "threat-awareness",
      title: "Threat Awareness Management using Sensor Fusion",
      downloadUrl: "/ThreatAwareness.html",
      videoEmbed: "https://www.youtube.com/embed/_XKa9y0jX9Q",
      abstract: "14-page technical analysis on integrating passive acoustic MEMS arrays and RF spectrum intelligence for low-altitude drone threat detection."
    },
    {
      id: "gas-pipeline",
      title: "Gas Pipeline Monitoring with Acoustic AI and GIS",
      downloadUrl: "https://drive.google.com/file/d/1c_nOnTvQmTOPytKAU_AbAImsBwksQlRR/view?usp=sharing",
      videoEmbed: "https://www.youtube.com/embed/Pa2i2aB3DZk",
      abstract: "Real-time pipeline integrity monitoring using distributed acoustic sensors and geographic information systems."
    },
    {
      id: "advanced-acoustic-engine",
      title: "Advanced Acoustic Engine and Sensors",
      downloadUrl: "/AdvancedAcousticEngine.html",
      abstract: "AI-powered acoustic analysis system for real-time sound classification and threat detection using deep learning."
    },
    {
      id: "resilicom-communication",
      title: "Resilicom Communication Mesh",
      downloadUrl: "/Resilicomai.html",
      abstract: "Tactical mesh networking protocols for high-jamming battlefield environments."
    },
    {
      id: "apex24-interceptor",
      title: "APEX-24 Maritime Interceptor Platform",
      downloadUrl: "/APEX24Interceptor.html",
      abstract: "Canister-launched unmanned surface interceptor for maritime domain defense."
    }
  ],

  marketplaceAndPartnership: {
    storeRoute: "/skhy-store",
    marketplaceRoute: "/marketplace",
    partnerOnboardingRoute: "/partner/onboarding",
    ndaRoute: "/nda",
    details: "SKHY AI operates a global hardware marketplace connecting verified defense component vendors, sensor builders, and prime contractors. Vendors can list motors, ESCs, CRPA antennas, AI compute units, and sensor payloads after completing seller onboarding.",
    actionCards: [
      {
        title: "Partner Onboarding Portal",
        description: "Register your organization to list defense hardware or co-develop AI payloads.",
        linkText: "Onboard as Partner",
        linkUrl: "/partner/onboarding",
        isExternal: false
      },
      {
        title: "Execute NDA Request",
        description: "Submit Non-Disclosure Agreement for confidential defense spec access.",
        linkText: "Request NDA",
        linkUrl: "/nda",
        isExternal: false
      }
    ]
  },

  careerOpenings: [
    {
      title: "Director of Sovereign Edge OS",
      type: "Full-time / Leadership",
      focus: "Air-gapped machine learning edge OS, zero-trust security architecture, TPM 2.0 root of trust, and P2P OTA updates over MANET."
    },
    {
      title: "Chief Drone Swarm Architect",
      type: "Full-time / Leadership",
      focus: "Decentralized C2 swarm algorithms, PX4/ArduPilot integration, auction-based task allocation, and kinetic target tracking."
    },
    {
      title: "Senior Acoustic Signal Processing Engineer",
      type: "Full-time / Deep-Tech",
      focus: "MEMS microphone array calibration, wavelet transform feature extraction, INT8 TensorRT neural inference for drone sound signatures."
    }
  ]
};

export function getKnowledgeBasePromptContext(): string {
  return `
MASTER SKHY AI KNOWLEDGE REPOSITORY WITH 5 LAYERS OF PROTECTION & DIU WHITEPAPERS:
${JSON.stringify(SKHY_KNOWLEDGE_BASE, null, 2)}
`;
}
