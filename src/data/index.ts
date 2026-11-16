import { NavLink, Industry, EngagementStep, Whitepaper, Partner } from '../types';

export const navLinks: NavLink[] = [
  { name: 'Defense', href: '/' },
  { name: 'Industries', href: '/industries' },
  { name: 'Home Security', href: '/residential' },
  { name: 'Store', href: '/skhy-store' },
  { name: 'Resources', href: '/resources' }
];


export const techStackMapping = {
  threat: {
    title: " Threat Awareness and Prevention - Advanced Defense Intelligence",
    description: "Real-time threat detection, airspace C2, and urban skyways (UTM/AAM) monitoring mesh using passive acoustic and RF fusion.",
    frameworks: ["Vision", "Signal", "Acoustic"],
    techniques: ["Anomaly Detection", "Sensor Fusion", "Directional Inference"],
    security: ["Network Vulnerability Scanning", "Network Defense"],
    hardware: ["Low-light enhanced Cameras", "Skhy Acoustic Long-Range Sensors", "RF Spectrum Analyzers", "Edge Computing Units Intergation"],
    details: {
      "Vision": "Computer vision for perimeter monitoring, object detection, and behavioral analysis",
      "Signal": "RF signal analysis for detecting unauthorized communications and electronic warfare",
      "Acoustic": "Audio pattern recognition for identifying vehicle signatures and human activity",
      "Anomaly Detection": "Identifies unusual patterns in network traffic, behavior, and sensor data",
      "Sensor Fusion": "Combines multiple sensor inputs for comprehensive situational awareness",
      "Directional Inference": "Determines threat direction and movement patterns for tactical response",
      "Network Vulnerability Scanning": "Proactive identification of system weaknesses and attack vectors",
      "Network Defense": "Real-time network protection against cyber attacks and intrusion attempts",
      "Low-light enhanced Cameras": "Cameras connected to Light-enhancing vision models",
      "RF Spectrum Analyzers": "Real-time monitoring of electromagnetic spectrum for signal intelligence",
      "Skhy Acoustic Long-Range Sensors": "Long Range Acoustic Sensors",
      "Edge Computing Units Integration": "MQTT/HTTP protocol integration for real-time AI inference in field conditions",
    }
  },
  marine: {
    title: " Marine Observation - Van Atta BackScatter",
    description: "Comprehensive maritime monitoring using satellite imagery, acoustic sensors, and AI-driven analysis.",
    frameworks: ["Satellite Imaging", "Acoustic", "Vision", "Signal"],
    techniques: ["Sensor Fusion", "Anomaly Detection", "ML Optimization"],
    security: ["Network Vulnerability Scanning", "Network Defense"],
    hardware: ["Sonar Arrays", "Van-Atta Backscatter Sensors"],
    details: {
      "Acoustic": "Underwater acoustic monitoring for marine life, submarine detection, and ocean health",
      "Vision": "Surface vessel identification, oil spill detection, and marine wildlife monitoring",
      "Signal": "AIS data processing, radar signature analysis, and communication interception",
      "Sensor Fusion": "Integrates satellite, acoustic, and surface sensors for complete ocean picture",
      "Anomaly Detection": "Identifies unusual vessel behavior, environmental changes, and security threats",
      "ML Optimization": "Optimizes sensor placement, data processing, and prediction accuracy",
      "Network Vulnerability Scanning": "Secures maritime communication networks and IoT sensor infrastructure",
      "Network Defense": "Protects maritime systems from cyber threats and unauthorized access",
      "Low-energy Acoustic Arrays": "Advanced underwater acoustic detection systems for comprehensive marine monitoring"
    }
  },
  mining: {
    title: " Mining & Exploration - Intelligent Resource Discovery",
    description: "AI-driven mining operations with geological analysis and autonomous equipment control.",
    frameworks: ["Satellite Imaging", "Signal", "Vision", "Acoustic"],
    techniques: ["ML Optimization", "Sensor Fusion", "Anomaly Detection"],
    security: ["Visual Inspection", "Network Vulnerability Scanning", "Network Defense"],
    hardware: ["Secure Communications"],
    details: {
      "Satellite Imaging": "Geological survey, mineral identification, and environmental impact monitoring",
      "Signal": "Ground-penetrating radar analysis and wireless sensor network management",
      "Vision": "Autonomous vehicle navigation, equipment monitoring, and safety oversight",
      "Acoustic": "Seismic analysis for geological mapping and equipment health monitoring",
      "ML Optimization": "Optimizes extraction processes, equipment utilization, and resource allocation",
      "Sensor Fusion": "Combines geological, environmental, and operational sensor data",
      "Anomaly Detection": "Identifies equipment failures, safety hazards, and geological anomalies",
      "Visual Inspection": "Automated monitoring of processing of mined materials",
      "Network Vulnerability Scanning": "Secures mining control systems and communication networks",
      "Network Defense": "Protects mining operations from cyber threats and unauthorized access",
      "Secure Communications": "Robust Mesh communication networks for remote mining operations reyling over RoIP"
    }
  },
  'advanced-acoustic-engine': {
    title: "Advanced Acoustic Engine and Sensors- AI-Powered Sound Intelligence",
    description: "Real-time acoustic analysis system for sound classification, threat detection, and environmental monitoring using advanced machine learning algorithms.",
    frameworks: ["Deep Learning", "Signal Processing", "Pattern Recognition", "Neural Networks"],
    techniques: ["Spectral Analysis", "Feature Extraction", "Real-time Classification", "Noise Filtering"],
    security: ["Encrypted Data Transmission", "Secure Model Storage", "Access Control"],
    hardware: ["High-Sensitivity Microphones", "Edge Computing Units", "Digital Signal Processors", "Weatherproof Enclosures"],
    details: {
      "Deep Learning": "Advanced neural networks trained on extensive acoustic datasets for accurate sound classification and anomaly detection",
      "Signal Processing": "Real-time digital signal processing for noise reduction, frequency analysis, and feature extraction from audio streams",
      "Pattern Recognition": "Machine learning algorithms that identify specific acoustic signatures and patterns in complex audio environments",
      "Neural Networks": "Convolutional and recurrent neural networks optimized for temporal audio data processing and classification",
      "Spectral Analysis": "Frequency domain analysis using FFT and wavelet transforms to identify unique acoustic fingerprints",
      "Feature Extraction": "Automated extraction of relevant acoustic features including MFCCs, spectral centroids, and temporal characteristics",
      "Real-time Classification": "Low-latency classification system capable of processing and categorizing sounds within milliseconds",
      "Noise Filtering": "Advanced filtering algorithms to separate target sounds from background noise and environmental interference",
      "Encrypted Data Transmission": "End-to-end encryption for secure transmission of acoustic data and analysis results",
      "Secure Model Storage": "Protected storage of AI models and acoustic signatures with access control and integrity verification",
      "Access Control": "Role-based access control system for managing user permissions and system configuration",
      "High-Sensitivity Microphones": "Professional-grade microphones with wide frequency response and high dynamic range for accurate sound capture",
      "Edge Computing Units": "Ruggedized computing hardware for real-time AI inference and acoustic processing in field conditions",
      "Digital Signal Processors": "Specialized DSP chips optimized for real-time audio processing and feature extraction",
      "Weatherproof Enclosures": "IP67-rated protective housings designed for harsh environmental conditions and long-term outdoor deployment"
    }
  },
  'resilicom-communication': {
    title: "Resilient Mesh Networks",
    description: "Robust communication infrastructure providing reliable connectivity for distributed AI systems and remote operations through adaptive mesh networking.",
    frameworks: ["Mesh Networking", "Software Defined Radio", "Network Protocols", "Adaptive Routing"],
    techniques: ["Dynamic Routing", "Load Balancing", "Fault Tolerance", "Bandwidth Optimization"],
    security: ["End-to-End Encryption", "Network Segmentation", "Intrusion Detection", "Secure Key Management"],
    hardware: ["SDR Transceivers", "Mesh Network Nodes", "Satellite Uplinks", "Ruggedized Routers"],
    details: {
      "Mesh Networking": "Self-healing network topology that automatically routes traffic through available nodes, ensuring continuous connectivity",
      "Software Defined Radio": "Flexible radio platform supporting multiple frequency bands and communication protocols for versatile deployment",
      "Network Protocols": "Implementation of robust protocols including OLSR, BATMAN, and custom protocols optimized for tactical environments",
      "Adaptive Routing": "Intelligent routing algorithms that dynamically adjust paths based on network conditions and node availability",
      "Dynamic Routing": "Real-time path optimization that responds to network changes, node failures, and varying signal conditions",
      "Load Balancing": "Traffic distribution across multiple network paths to optimize bandwidth utilization and prevent congestion",
      "Fault Tolerance": "Redundant communication paths and automatic failover mechanisms ensuring network resilience",
      "Bandwidth Optimization": "Intelligent data compression and prioritization to maximize throughput over limited bandwidth connections",
      "End-to-End Encryption": "Military-grade encryption protecting all data transmissions across the network infrastructure",
      "Network Segmentation": "Isolated network zones with controlled access points to contain potential security breaches",
      "Intrusion Detection": "Real-time monitoring and detection of unauthorized access attempts and network anomalies",
      "Secure Key Management": "Automated key distribution and rotation system ensuring cryptographic security across all network nodes",
      "SDR Transceivers": "Software-defined radio units supporting multiple frequency bands and modulation schemes for flexible communication",
      "Mesh Network Nodes": "Ruggedized communication nodes with integrated antennas and processing capabilities for autonomous operation",
      "Satellite Uplinks": "Backup satellite communication capability for remote areas without terrestrial infrastructure",
      "Ruggedized Routers": "Military-grade networking equipment designed for harsh environments and extended field deployment"
    }
  }
};


export const industries: Industry[] = [
  {
    id: 'aerospace',
    name: 'Aerospace & Defense',
    icon: 'plane',
    description: 'Advanced sensing and AI solutions for aerospace applications, including threat detection, satellite tracking, and autonomous systems integration.',
    image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1260'
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    icon: 'zap',
    description: 'Comprehensive monitoring for power infrastructure, renewable energy optimization, and smart grid management.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1260'
  },
  {
    id: 'maritime',
    name: 'Maritime & Fisheries',
    icon: 'anchor',
    description: 'Advanced sonar and acoustic solutions for marine life monitoring, vessel tracking, and underwater infrastructure inspection.',
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=1260'
  },
  {
    id: 'smart-cities',
    name: 'Smart Cities',
    icon: 'building-2',
    description: 'Urban intelligence systems for traffic management, environmental monitoring, and public safety enhancement.',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1260'
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Forestry',
    icon: 'tree',
    description: 'Precision agriculture solutions using hyperspectral imaging for crop health monitoring and forest management.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1260'
  },
  {
    id: 'disaster',
    name: 'Disaster Response',
    icon: 'alert-triangle',
    description: 'Real-time monitoring and early warning systems for natural disasters and emergency response coordination.',
    image: 'https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&q=80&w=1260'
  },
  {
    id: 'industrial-logistic',
    name: 'Industrial & Logistics',
    icon: 'truck',
    description: 'Optimize supply chain and heavy lifting operations using our advanced drone payload calculators and simulators.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7e66a6a?auto=format&fit=crop&q=80&w=1260',
    actionText: 'Try Simulator',
    actionUrl: '/simulators/heavy-lift'
  }
];

export const engagementSteps: EngagementStep[] = [
  {
    id: 'consultation',
    title: 'Free Consultation',
    description: 'Understand your use case and challenges',
    icon: 'message-circle'
  },
  {
    id: 'prototype',
    title: 'Rapid AI Prototype',
    description: 'Get a functional AI model or sensing module in days',
    icon: 'cpu'
  },
  {
    id: 'pilot',
    title: 'Pilot Deployment',
    description: 'Real-world testing in your environment',
    icon: 'rocket'
  },
  {
    id: 'production',
    title: 'Scale to Production',
    description: 'Full-stack integration and support',
    icon: 'layers'
  }
];

export const whitepapers: Whitepaper[] = [
  {
    id: 'tam-readme',
    title: 'Threat Awareness Manager — System Architecture & README',
    abstract: 'Comprehensive architectural specification covering NATO STANAG 4869 and UK MoD SAPIENT compliance, non-circular concentric perimeter resolution, Autonomous Engagement Zones (AEZ), and 8-cardinal threat vector alignment.',
    downloadUrl: 'https://drive.google.com/file/d/1MI9-dQvp_pqXXjgw__wDvxnDC9YGAyJz/view?usp=sharing',
    image: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/Vc6GZCnC/skhy-jamming-resilient-AI-edge-RF-fusion-device.png'
  },
  {
    id: 'tam-api-integration',
    title: 'Threat Awareness Manager — API Integration & SAPIENT Protocol Specification',
    abstract: 'Technical interface control document detailing UK DSTL SAPIENT ASM/BAP messaging, MQTT 3.1.1/5.0 topic trees, RESTful control APIs, MANET mesh telemetry, and ArduDeck GCS bridging.',
    downloadUrl: 'https://drive.google.com/file/d/1665i8RINl3Vj7ULeZLPUr-tK4l1P6ytS/view?usp=drive_link',
    image: 'https://i.postimg.cc/8cpgYW3z/Screenshot-2025-09-04-000749.jpg?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/Q3X2B8g8/AB40v1-125.png'
  },
  {
    id: 'threat-awareness',
    title: 'Threat Awareness Management using Sensor Fusion',
    abstract: 'Research on integrating multiple sensor types for enhanced situational awareness in complex threat environments.',
    downloadUrl: '/ThreatAwareness.html',
    image: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/Vc6GZCnC/skhy-jamming-resilient-AI-edge-RF-fusion-device.png'
  },
  {
    id: 'gas-pipeline',
    title: 'Gas Pipeline Monitoring with Acoustic AI and GIS',
    abstract: 'Integration of acoustic sensing and geographic information systems for real-time pipeline integrity monitoring and leak detection.',
    downloadUrl: 'https://drive.google.com/file/d/1c_nOnTvQmTOPytKAU_AbAImsBwksQlRR/view?usp=sharing',
    image: 'https://i.postimg.cc/xd4ZLZLb/Screenshot-2025-09-13-220527.jpg?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/sdqMvbHs/acoustic-RF-sensor-with-metal-telescopic-mast.png'
  },
  {
    id: 'advanced-acoustic-engine',
    title: 'Advanced Acoustic Engine',
    abstract: 'AI-powered acoustic analysis system for real-time sound classification and threat detection using advanced machine learning algorithms.',
    downloadUrl: '/AdvancedAcousticEngine.html',
    image: 'https://i.postimg.cc/mDDMjFrQ/Screenshot-2025-09-03-232227.jpg?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/ycG3jprJ/18cm-16-MEMS-sensor.png'
  },
  {
    id: 'resilicom-communication',
    title: 'Resilicom Communication',
    abstract: 'Robust communication infrastructure providing reliable connectivity for distributed AI systems and remote operations through adaptive mesh networking.',
    downloadUrl: '/Resilicomai.html',
    image: 'https://i.postimg.cc/8cpgYW3z/Screenshot-2025-09-04-000749.jpg?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/Q3X2B8g8/AB40v1-125.png'
  },
  {
    id: 'mining-exploration',
    title: 'Mining & Exploration',
    abstract: 'AI-driven mining operations with geological analysis and autonomous equipment control for intelligent resource discovery.',
    downloadUrl: '/MiningExploration.html',
    image: 'https://i.postimg.cc/XJnZDG4V/780f6a75-f3a9-4c45-a086-83c1aea7532b.png?auto=compress&cs=tiny',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/CKqc1B4t/skhy-light-edge-AI.png'
  },
  {
    id: 'advanced-sensor-detection',
    title: 'Advanced Sensor Detection Analysis',
    abstract: 'Comprehensive multi-sensor technology performance evaluation and cost-effectiveness analysis across diverse operational environments.',
    downloadUrl: '/AdvancedSensorDetectionAnalysis.html',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/MxYgYTHs/ajgps301-2.png'
  },
  {
    id: 'mission-architect',
    title: 'Build Your Own Autonomy: Strategic Simulation & Planning',
    abstract: 'A comprehensive guide to utilizing the Skhy AI Build Your Own Autonomy simulator for designing resilient drone operations across build, transmission, and positioning phases.',
    downloadUrl: '/MissionArchitect.html',
    image: '/images/mission_architect_map.png',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: '/images/mission_architect_crpa.png'
  },
  {
    id: 'interceptor-male-guidance',
    title: 'Interceptor & MALE Drone Guidance Network',
    abstract: 'Technical analysis on networking Interceptors with MALE Drones for enhanced guidance, especially against targets employing RF jamming signals and evasive maneuvering techniques.',
    downloadUrl: '/InterceptorMALEGuidance.html',
    image: 'https://images.unsplash.com/photo-1541427468627-a47134dc517c?auto=format&fit=crop&q=80&w=1260',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: 'https://i.ibb.co/Vc6GZCnC/skhy-jamming-resilient-AI-edge-RF-fusion-device.png'
  },
  {
    id: 'apex-24-interceptor-usv',
    title: 'APEX-24 Interceptor USV Platform',
    abstract: 'An Unmanned Surface Vehicle (USV) acting as a platform to deploy canister-launched interceptors. Designed for taking down enemy USVs via direct impact, it integrates a comprehensive sensor complex including an AIS catcher.',
    downloadUrl: '/APEX24Interceptor.html',
    image: '/images/apex_24_interceptor.png',
    email: 'contact@skhy.systems',
    phone: '+91-9335193489',
    equipmentImage: '/images/apex_24_equipment.png'
  }
];

