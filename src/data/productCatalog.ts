export type ProductDetailBlock =
  | {
    type: 'text';
    title?: string;
    text: string;
  }
  | {
    type: 'list';
    title: string;
    items: string[];
  }
  | {
    type: 'specs';
    title: string;
    items: Array<{ label: string; value: string }>;
  }
  | {
    type: 'table';
    title: string;
    columns: string[];
    rows: string[][];
  };

export interface CatalogProduct {
  id: string;
  name: string;
  tagline: string;
  category: 'acoustic' | 'edge-ai' | 'ajgps' | 'manet' | 'paas' | 'hardware' | 'drone' | 'software';
  imageUrl: string;
  imageUrls?: string[];
  details: ProductDetailBlock[];
  isThirdParty?: boolean;
  thirdPartyType?: 'OEM' | 'Partner';
  base_price?: number;
  operating_voltage?: string;
  operating_current?: string;
  localImageUrl?: string;
  trl?: string;
}

export function getTRLStatus(product: { name?: string; category?: string; trl?: string | null }): string | null {
  if (product.trl) return product.trl;
  if (!product.name) return null;
  const name = product.name.toLowerCase();
  const cat = product.category?.toLowerCase() || '';
  if (name.includes('surveyor')) {
    return 'TRL-3';
  } else if (cat.includes('acoustic') || name.includes('edge device') || name.includes('edge ai')) {
    return 'TRL-4';
  }
  return null;
}

export const categoryCatalogLinks: Record<string, string> = {
  'drone':   '/marketplace?category=drone',
  'acoustic': 'https://tinyurl.com/skhy-pc-acoustic',
  'edge-ai': 'https://tinyurl.com/skhy-pc-edge-ai-adv',
  'manet': 'https://tinyurl.com/skhy-pc-manet',
  'ajgps': 'https://tinyurl.com/skhy-pc-crpa',
  'paas': '/marketplace?category=paas',
  'software': '/marketplace?category=software',
  'hardware': '/marketplace?category=hardware'
};

export const productCatalog: CatalogProduct[] = [
  {
    id: '900005',
    name: 'SKHY-A7: Compact Acoustic Sentinel',
    tagline: 'The lightweight standard for autonomous aerial & ground detection.',
    category: 'acoustic',
    trl: 'TRL-4',
    imageUrl: '/images/catalog/7-MEMS-Acoustic-sensor-with-sound-board-and-edge-computer.png',
    operating_voltage: '5V DC',
    operating_current: '200mA - 4A',
    details: [
      {
        type: 'text',
        text: 'The SKHY-A7 is a lightweight 7-MEMS acoustic sensor array designed for autonomous aerial and ground-based threat detection. It provides passive, undetectable surveillance with a detection range of up to 150km for high-speed aircraft.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Sensor Array', value: '7x MEMS Microphones' },
          { label: 'Detection Range', value: 'Up to 2.5km (Drones) / 150km (Jets)' },
          { label: 'Weight', value: '~240g' }
        ]
      }
    ]
  },
  {
    id: '900006',
    name: 'SKHY-A16: Long-Range Acoustic Array',
    tagline: 'Maximum sensitivity for high-value asset protection.',
    category: 'acoustic',
    trl: 'TRL-5',
    imageUrl: '/images/catalog/18cm-16-MEMS-sensor.png',
    operating_voltage: '12V DC',
    operating_current: '3A - 4A',
    details: [
      {
        type: 'text',
        text: 'The SKHY-A16 is a high-sensitivity 16-MEMS acoustic array designed for long-range threat detection. By utilizing a larger acoustic aperture, it captures lower frequency signatures and provides extended warning times for high-speed aircraft.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Sensor Array', value: '16x MEMS Microphones' },
          { label: 'Detection Range', value: 'Up to 4km (Drones) / 250km (Jets)' },
          { label: 'Weight', value: '~650g' }
        ]
      }
    ]
  },
  {
    id: '900007',
    name: 'SKHY-MOBISENSE: Multi-Spectral Mobile Station',
    tagline: 'Fusion of Acoustic and RF Intelligence on a Rapid-Deploy Mast.',
    category: 'acoustic',
    trl: 'TRL-4',
    imageUrl: '/images/catalog/acoustic-RF-sensor-with-metal-telescopic-mast.png',
    details: [
      {
        type: 'text',
        text: 'A turnkey, rapidly deployable solution for perimeter defense. Correlates acoustic signatures with RF intelligence from dual LPDA antennas to virtually eliminate false positives.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Sensors', value: '7-MEMS Acoustic + Dual LPDA RF' },
          { label: 'RF Range', value: '400MHz – 8GHz' },
          { label: 'Mast', value: '5-meter Telescopic' }
        ]
      }
    ]
  },
  {
    id: '900008',
    name: 'AeroGuard: Aerodynamic Protective Cones',
    tagline: 'Flight-ready protection for SKHY sensors.',
    category: 'acoustic',
    trl: 'TRL-5',
    imageUrl: '/images/catalog/7-MEMS-mounted-on-drone.png',
    base_price: 125,
    details: [
      {
        type: 'text',
        text: 'Ultra-lightweight carbon fiber cones designed to provide aerodynamic efficiency and physical protection for SKHY MEMS sensor arrays during drone flight.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Material', value: 'Carbon Fiber / Acoustic Mesh' },
          { label: 'Compatibility', value: 'SKHY-A7 / SKHY-A16' },
          { label: 'Weight', value: '40g - 100g' }
        ]
      }
    ]
  },
  {
    id: '900009',
    name: 'SKHY Jamming Resilient Edge AI & RF Fusion Node',
    tagline: 'Multi-domain edge computing & signal intelligence unit.',
    category: 'edge-ai',
    trl: 'TRL-4',
    imageUrl: '/images/catalog/skhy-jamming-resilient-AI-edge-RF-fusion-device.png',
    operating_voltage: '12V DC',
    operating_current: '5A (Max)',
    details: [
      {
        type: 'text',
        text: 'Heavily ruggedized multi-domain intelligence unit for extreme EW environments. Fuses NVIDIA Ampere AI with Xilinx FPGA-based SDR and anti-jamming GNSS.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'AI Compute', value: 'Up to 67 TOPS' },
          { label: 'RF Subsystem', value: 'MIMO Mesh + Frequency Hopping' },
          { label: 'Navigation', value: 'Anti-Jam/Spoof GNSS + Heading' }
        ]
      }
    ]
  },
  {
    id: '900010',
    name: 'SKHY Light Edge AI & RF Fusion Node',
    tagline: 'Compact edge compute for RF/Acoustic classification.',
    category: 'edge-ai',
    trl: 'TRL-4',
    imageUrl: '/images/catalog/skhy-light-edge-AI.png',
    base_price: 1550,
    operating_voltage: '12V DC',
    operating_current: 'Approx. 2.3A (Max)',
    details: [
      {
        type: 'text',
        text: 'Compact edge node integrating NVIDIA Orin Nano with USRP E310 SDR. Optimized for SWaP-C constrained autonomous systems requiring real-time signal intelligence.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'AI Compute', value: 'Up to 40 TOPS' },
          { label: 'SDR Architecture', value: '2x2 MIMO (70MHz - 6GHz)' },
          { label: 'Power Draw', value: 'Approx. 28W (Integrated)' }
        ]
      }
    ]
  },
  {
    id: '900011',
    name: 'AJGPS 301 Four-channel GNSS Anti-Jamming System',
    tagline: '4-channel GNSS anti-interference with anti-deception.',
    category: 'ajgps',
    imageUrl: '/images/catalog/ajgps301-2.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 1200,
    details: [
      {
        type: 'text',
        text: 'Compact 4-channel anti-interference system for BDS_B1, GPS_L1, and GAL_E1. Protects positioning and timing in contested RF environments.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Channels', value: '4-channel processing' },
          { label: 'Suppression', value: 'Wideband / Pulse / Sweep' },
          { label: 'Weight', value: '< 128g' }
        ]
      }
    ]
  },
  {
    id: '900012',
    name: 'AJGPS 302 Four-channel GNSS Anti-Jamming System',
    tagline: '4-channel GNSS anti-jam with wide input voltage.',
    category: 'ajgps',
    imageUrl: '/images/catalog/ajgps302-2.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 1800,
    details: [
      {
        type: 'text',
        text: 'Rugged 4-channel anti-jamming system adding GLONASS G1 support. Features wide input voltage and high suppression ratios for industrial UAVs.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Constellations', value: 'GPS / BDS / GAL / GLO' },
          { label: 'Suppression Ratio', value: '≥100dB' },
          { label: 'Size', value: '100mm x 100mm x 25mm' }
        ]
      }
    ]
  },
  {
    id: '900013',
    name: 'AJGPS 303 Four-channel GNSS Anti-Jamming System',
    tagline: '4-channel GNSS anti-jam for GPS_L1/L2/L5 + GALILEO_E1.',
    category: 'ajgps',
    imageUrl: '/images/catalog/ajgps303-2.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 2800,
    details: [
      {
        type: 'text',
        text: 'Premium multi-band anti-interference system protecting GPS L1, L2, and L5. Essential for maintaining high-precision RTK positioning under jamming.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Frequencies', value: 'GPS L1/L2/L5 + GAL E1' },
          { label: 'Suppression Ratio', value: '≥105dB' },
          { label: 'Weight', value: '< 2000g' }
        ]
      }
    ]
  },
  {
    id: '900014',
    name: 'AJGPS 601 Eight-channel GNSS Anti-Jamming System',
    tagline: '8-channel anti-jam processing to counter six broadband sources.',
    category: 'ajgps',
    imageUrl: '/images/catalog/ajgps601-3.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 3800,
    details: [
      {
        type: 'text',
        text: 'Advanced 8-channel anti-jamming processor capable of nullifying up to six independent interference sources simultaneously for high-value aerospace platforms.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Channels', value: '8-channel array' },
          { label: 'Suppression', value: 'Up to 6 simultaneous sources' },
          { label: 'Accuracy', value: '≤ 10m (Contested)' }
        ]
      }
    ]
  },
  {
    id: '900015',
    name: 'AJGPS 602 Eight-channel GNSS Anti-Jamming System',
    tagline: 'Compact low-power anti-interference processing with 9 channels.',
    category: 'ajgps',
    imageUrl: '/images/catalog/ajgps602.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 4500,
    details: [
      {
        type: 'text',
        text: 'Compact 8-channel system with digital beamforming. Nullifies up to 7 concurrent broadband sources. Ideal for sleek aerodynamic platforms.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Beamforming', value: '9-channel digital' },
          { label: 'Suppression', value: 'Up to 7 simultaneous sources' },
          { label: 'Form Factor', value: 'Low-profile compact' }
        ]
      }
    ]
  },
  {
    id: '900017',
    name: 'AB40 MANET Radio (High-Altitude Backbone)',
    tagline: '100–200 km LOS air-to-ground backbone radio for high-altitude relay.',
    category: 'manet',
    imageUrl: '/images/catalog/AB40v1-125.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 4800,
    details: [
      {
        type: 'text',
        text: 'Long-range high-altitude backbone radio for persistent wide-area mesh networking. Connects platforms over distances exceeding 100km.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Range (LOS)', value: '100–200 km' },
          { label: 'Weight', value: '1.25 kg' },
          { label: 'Role', value: 'Backbone Relay' }
        ]
      }
    ]
  },
  {
    id: '900018',
    name: 'AB20 MANET Radio (Medium ISR – Active Cooling)',
    tagline: '50–100 km LOS air-to-ground medium ISR mesh node.',
    category: 'manet',
    imageUrl: '/images/catalog/AB4v1-Air-unit-for-FPV-drones.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    base_price: 2500,
    details: [
      {
        type: 'text',
        text: 'Mid-range MANET radio with active cooling for sustained high-throughput ISR missions. Optimized for video and sensor data fusion.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Range (LOS)', value: '50–100 km' },
          { label: 'Cooling', value: 'Active (Integrated Fan)' },
          { label: 'Weight', value: '279 g' }
        ]
      }
    ]
  },
  {
    id: '900019',
    name: 'AB2 MANET Radio (Tactical Swarm)',
    tagline: '20–50 km LOS tactical swarm mesh node for drones and small platforms.',
    category: 'manet',
    imageUrl: '/images/catalog/AB4v1-Air-unit-for-FPV-drones.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    details: [
      {
        type: 'text',
        text: 'Ultra-lightweight tactical MANET node for swarm operations. Thin profile and low power for space-constrained micro-UAVs.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Range (LOS)', value: '20–50 km' },
          { label: 'Weight', value: '160 g' },
          { label: 'Profile', value: 'Ultra-Thin' }
        ]
      }
    ]
  },
  {
    id: '900020',
    name: 'VC20 MANET Ground Command Unit (Four-band Antennas)',
    tagline: 'Ground command unit: 30–50 km ground-to-ground, 100+ km ground-to-air.',
    category: 'manet',
    imageUrl: '/images/catalog/command-center-with-VC20.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    details: [
      {
        type: 'text',
        text: 'Central hub for MANET networks with high-gain antennas. Provides command and control for airborne nodes and ground teams.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Air Range', value: '100+ km' },
          { label: 'Antennas', value: 'Four-band High-Gain' },
          { label: 'Weight', value: '2.95 kg' }
        ]
      }
    ]
  },
  {
    id: '900021',
    name: 'HH20 MANET Dual-Band Ground User',
    tagline: 'Dual-band user node: 10–30 km open ground, 1–5 km urban/obstructed.',
    category: 'manet',
    imageUrl: '/images/catalog/HP20.png',
    isThirdParty: true,
    thirdPartyType: 'OEM',
    details: [
      {
        type: 'text',
        text: 'Rugged handheld node for ground personnel. Provides real-time access to drone video and mission data within the mesh.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Range (Open)', value: '10–30 km' },
          { label: 'Bands', value: 'Dual-Band Support' },
          { label: 'Weight', value: '~1.1 kg' }
        ]
      }
    ]
  },
  {
    id: '900135',
    name: 'SKHY Surveyor Drone',
    tagline: 'VTOL long-range scout with acoustic & RF intelligence.',
    category: 'drone',
    trl: 'TRL-7',
    imageUrl: '/images/catalog/Screenshot-2026-05-02-010558.png',
    base_price: 9999,
    details: [
      {
        type: 'text',
        text: 'High-endurance VTOL hybrid platform for persistent ISR. Fuses visual, acoustic, and RF sensing with onboard AI processing.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Endurance', value: '150 - 180 Minutes' },
          { label: 'Platform', value: 'VTOL Fixed-Wing Hybrid' },
          { label: 'Intelligence', value: 'Acoustic + RF + AI' }
        ]
      }
    ]
  },
  {
    id: '900115',
    name: 'SKHY Fiber-Optic Tethered Drone',
    tagline: 'Secure, jam-proof observation drone via fiber-optic tether.',
    category: 'drone',
    imageUrl: '/images/catalog/Screenshot-2026-05-03-111309.png',
    imageUrls: [
      '/images/catalog/Screenshot-2026-05-03-111309.png',
      '/images/catalog/Screenshot-2026-05-03-111322.png',
      '/images/catalog/Screenshot-2026-05-03-111401.png',
      '/images/catalog/Screenshot-2026-05-03-112554.png'
    ],
    base_price: 1250,
    details: [
      {
        type: 'text',
        text: 'Immune to all RF jamming and spoofing, this drone transmits data via an ultra-lightweight fiber micro-tether for total EMSEC security.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Link', value: 'Fiber-Optic Micro Tether' },
          { label: 'Tether Length', value: 'Up to 20 km' },
          { label: 'Payload', value: '30x Zoom + Thermal + LRF' }
        ]
      }
    ]
  },
  {
    id: 'skhy-interceptor-5',
    name: 'Skhy Interceptor 5',
    tagline: 'Advanced kinetic effector drone.',
    category: 'drone',
    imageUrl: '/images/marketplace/interceptor-5.png',
    details: [
      {
        type: 'text',
        text: 'The Skhy Interceptor 5 is a lightweight, high-speed kinetic effector capable of reaching speeds over 500 Km/h. Designed for rapid vertical launch and autonomous intercept.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Max Flight Speed', value: '500+ Km/h' },
          { label: 'Max Takeoff Weight', value: '1.5 kg' },
          { label: 'Flight Time', value: '10 - 20 minutes' },
          { label: 'Max Control Distance', value: '≥5 km' },
          { label: 'Max Flight Distance', value: '20 km' },
          { label: 'Dimensions (L×W×H)', value: '292 × 292 × 348 mm' },
          { label: 'Max Flight Altitude', value: '3000m' }
        ]
      }
    ]
  },
  {
    id: 'skhy-interceptor-7',
    name: 'Skhy Interceptor 7',
    tagline: 'Advanced kinetic effector drone.',
    category: 'drone',
    imageUrl: '/images/marketplace/interceptor-7.png',
    details: [
      {
        type: 'text',
        text: 'The Skhy Interceptor 7 is a high-speed interceptor equipped with a 5.8 GHz video transmission link and a maximum flight speed of 360 KM/h. It features a sophisticated flight controller with an STM32 F722 chip and ICM-42688 gyroscope for precision maneuvers.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Dimensions', value: '385 × 234 × 234 mm' },
          { label: 'Weight (w/o battery)', value: '1000 g' },
          { label: 'Max Flight Speed', value: '360 KM/h' },
          { label: 'Max Payload', value: '500 g' },
          { label: 'Max Takeoff Weight', value: '2500 g' },
          { label: 'Battery Capacity', value: '4500 mAh' },
          { label: 'Flight Time', value: '12 Min' },
          { label: 'Main Control Chip', value: 'STM32 F722' },
          { label: 'Barometer', value: 'SPL06-001' },
          { label: 'Gyroscope', value: 'ICM-42688' },
          { label: 'Black Box Capacity', value: '16 MB' },
          { label: 'Video Transmission', value: '5.8 GHz' }
        ]
      }
    ]
  },
  {
    id: 'skhy-interceptor-8',
    name: 'Skhy Interceptor 8',
    tagline: 'Advanced kinetic effector drone.',
    category: 'drone',
    imageUrl: '/images/marketplace/interceptor-7.png',
    details: [
      {
        type: 'text',
        text: 'The Skhy Interceptor 8 is a robust kinetic effector drone built on a 310mm wheelbase. It is capable of carrying a 300g payload and reaching flight speeds in excess of 500 Km/h, powered by a high-performance 8S battery system.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Max Flight Speed', value: '500+ Km/h' },
          { label: 'Max Takeoff Weight', value: '3 KG' },
          { label: 'Power', value: 'High-performance battery' },
          { label: 'Flight Time', value: '10 - 20 minutes' },
          { label: 'Max Control Distance', value: '≥5 km' },
          { label: 'Max Flight Distance', value: '20 km' },
          { label: 'Max Battery Capacity', value: 'p7 8S 1700mAh 150C' },
          { label: 'Max Payload', value: '300 g' },
          { label: 'Wheelbase', value: '310 mm' },
          { label: 'Dimensions (L×W×H)', value: '420 × 420 × 430 mm' },
          { label: 'Max Flight Altitude', value: '3000 m' }
        ]
      }
    ]
  },
  {
    id: 'skhy-interceptor-11',
    name: 'Skhy Interceptor 11',
    tagline: 'Advanced kinetic effector drone.',
    category: 'drone',
    imageUrl: '/images/marketplace/interceptor-7.png',
    details: [
      {
        type: 'text',
        text: 'The Skhy Interceptor 11 is a heavy-duty kinetic effector featuring a 550mm wheelbase. Built to carry an 800g payload, it boasts a maximum flight distance of 40 km and an extended flight time of over 40 minutes thanks to its dual 8S battery packs.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Max Flight Speed', value: '400+ km/h' },
          { label: 'Max Takeoff Weight', value: '4 kg' },
          { label: 'Power', value: 'High-performance battery' },
          { label: 'Flight Time', value: '≥40 minutes' },
          { label: 'Max Control Distance', value: '≥5 km' },
          { label: 'Max Flight Distance', value: '40 km' },
          { label: 'Max Battery Capacity', value: 'p7 8S 1700mAh 150C (2 packs)' },
          { label: 'Max Payload', value: '800 g' },
          { label: 'Wheelbase', value: '550 mm' },
          { label: 'Dimensions (L×W×H)', value: '724 × 724 × 424 mm' },
          { label: 'Max Flight Altitude', value: '3000 m' }
        ]
      }
    ]
  },
  {
    id: 'skhy-mobisuite',
    name: 'MOBISUITE + MOBILITE',
    tagline: 'Comprehensive residential security and management software suite.',
    category: 'software',
    imageUrl: '/images/catalog/Mobilite/mobisuite-mobilite.png',
    details: [
      {
        type: 'text',
        text: 'Mobisuite paired with Mobilite offers an advanced security platform for residential and critical infrastructure, integrating seamlessly with our hardware sensors.'
      },
      {
        type: 'specs',
        title: 'Core Features',
        items: [
          { label: 'Platform', value: 'Web & Mobile App' },
          { label: 'Integration', value: 'Skhy Sensors & Cameras' },
          { label: 'Deployment', value: 'Cloud & On-Premise' }
        ]
      }
    ]
  },
  {
    id: 'skhy-mission-architect',
    name: 'Mission Architect',
    tagline: 'AI-driven simulator for optimizing mission architecture.',
    category: 'software',
    imageUrl: 'https://placehold.co/600x400/1e293b/38bdf8?text=Mission+Architect',
    details: [
      {
        type: 'text',
        text: 'Mission Architect is a TRL-8 flight-validated simulation software that allows operators to seamlessly plan, simulate, and optimize airframe, payload, and power profiles in seconds.'
      },
      {
        type: 'specs',
        title: 'Core Features',
        items: [
          { label: 'Simulation', value: 'High-fidelity aerodynamic & power models' },
          { label: 'Integration', value: 'Direct link to drone catalog & payloads' },
          { label: 'TRL Level', value: 'TRL-8' }
        ]
      }
    ]
  },
  {
    id: 'threat-awareness-manager',
    name: 'Threat Awareness Manager',
    tagline: 'Command Center C2 Software Platform',
    category: 'software',
    trl: 'TRL-5',
    imageUrl: '/images/marketplace/threat-awareness-manager.png',
    base_price: 25000,
    details: [
      {
        type: 'text',
        text: 'The Threat Awareness Manager (TAM) is the command center\'s unified pane of glass for planning, simulating, and monitoring defensive deployments across thousands of square miles.'
      },
      {
        type: 'specs',
        title: 'Core Features',
        items: [
          { label: 'Capabilities', value: 'Plan • Simulate • Monitor' },
          { label: 'Deployment', value: 'SaaS / On-Premise' },
          { label: 'Integration', value: 'Live sensor mesh network' }
        ]
      }
    ]
  },
  {
    id: 'skhy-interceptor-6',
    name: 'Skhy Interceptor 6',
    tagline: 'Canister-launched mid-range kinetic effector.',
    category: 'drone',
    trl: 'TRL-8',
    imageUrl: '/images/marketplace/interceptor-6.png',
    base_price: 6000,
    details: [
      {
        type: 'text',
        text: 'The Skhy Interceptor 6 is designed for mid-range threats with a canister-launched, vertical deployment system. Reaches 400+ km/h and carries a 400g payload.'
      },
      {
        type: 'specs',
        title: 'Core Specifications',
        items: [
          { label: 'Target Profile', value: 'Mid-range threats' },
          { label: 'Max Speed', value: '400+ km/h' },
          { label: 'Max Takeoff Weight', value: '2.0 kg' },
          { label: 'Payload', value: '400g' },
          { label: 'Range', value: '15 km' }
        ]
      }
    ]
  }
];
