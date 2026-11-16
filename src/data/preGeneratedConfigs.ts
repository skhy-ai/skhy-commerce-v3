/**
 * Physics-Validated Drone Blueprint Library (v2.0)
 * Total: 50+ Configurations
 * Balanced for: TWR (2.0-5.5), Voltage Matching, and Payload-to-Power ratios.
 */

export interface PreGeneratedConfig {
    id: string;
    name: string;
    description: string;
    platform: 'multirotor' | 'fixed-wing';
    suitability: string[];
    bom: {
        frameId: string;
        motorId: string;
        battId: string;
        escId: string;
        propId?: string;
        payload?: string;
    };
    specs: {
        maxPayload: string;
        maxEndurance: string;
        maxRange: string;
        twr: number;
    };
    productId?: string;
}


const LOGISTICS_CONFIGS: PreGeneratedConfig[] = [
    {
        id: 'log-heavy-01',
        name: 'Carrier-X8 Industrial',
        description: 'X8 configuration for redundant heavy lift in logistics.',
        platform: 'multirotor',
        suitability: ['heavy-lift', 'logistics', 'redundancy'],
        bom: { frameId: 'octo_heavy', motorId: 'tm_p80', battId: 'agri_14s_30000', escId: '100a_hv', propId: 'p13_carbon', payload: 'cargo-hook-v2' },
        specs: { maxPayload: '30kg', maxEndurance: '30min', maxRange: '12km', twr: 2.2 }
    },
    {
        id: 'log-med-02',
        name: 'Hex-Hauler v2',
        description: 'Industrial hexacopter for medium-range parts delivery.',
        platform: 'multirotor',
        suitability: ['delivery', 'medium-lift', 'stable'],
        bom: { frameId: 'hex_industrial', motorId: 'kde_4014xf', battId: 'revogreen_12s_22000', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'box-carrier' },
        specs: { maxPayload: '10kg', maxEndurance: '40min', maxRange: '18km', twr: 2.5 }
    },
    {
        id: 'log-fast-03',
        name: 'Swift-Quad Express',
        description: 'High-speed quad for rapid medical/urgent small payload transport.',
        platform: 'multirotor',
        suitability: ['rapid-response', 'medical', 'high-speed'],
        // Fix: quad_industrial (25kg frame!) replaced with quad_17 for realistic weight budget.
        // sunnysky_x4110s (LV, 40A) + 40a_xrotor (40A ≥ 40A ✓) + 6S LV batt ✓
        bom: { frameId: 'quad_17', motorId: 'sunnysky_x4110s', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p17_carbon', payload: 'medical-pod' },
        specs: { maxPayload: '3kg', maxEndurance: '35min', maxRange: '25km', twr: 3.8 }
    },
    {
        id: 'log-fw-04',
        name: 'Sky-Freight Talon',
        description: 'Fixed-wing cargo drone for long-range inter-facility transport.',
        platform: 'fixed-wing',
        suitability: ['long-range', 'cargo', 'autonomous'],
        bom: { frameId: 'fixed_wing_talon', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'cargo-bay-L' },
        specs: { maxPayload: '4kg', maxEndurance: '120min', maxRange: '100km', twr: 1.2 }
    },
    {
        id: 'log-heavy-05',
        name: 'Titan-Logistics X12',
        description: 'Ultra-heavy lift for construction site material movement.',
        platform: 'multirotor',
        suitability: ['construction', 'heavy-lift', 'extreme'],
        bom: { frameId: 'octo_heavy', motorId: 'tm_p80', battId: 'hv_400v_pack', escId: '100a_hv', propId: 'p13_carbon', payload: 'winch-system' },
        specs: { maxPayload: '50kg', maxEndurance: '20min', maxRange: '5km', twr: 1.9 }
    },
    {
        id: 'log-solar-06',
        name: 'Helios Surveyor',
        description: 'Solar-assisted fixed-wing for multi-day low-payload survey.',
        platform: 'fixed-wing',
        suitability: ['solar', 'extreme-endurance', 'mapping'],
        bom: { frameId: 'fixed_wing_surveyor', motorId: 'sunnysky_x2212', battId: 'euclion_6s_22000', escId: '30a_generic', payload: 'multispectral-camera' },
        specs: { maxPayload: '1kg', maxEndurance: '300min', maxRange: '250km', twr: 1.1 },
        productId: '900135'
    },
    {
        id: 'log-agri-07',
        name: 'Agri-Spray Octo',
        description: 'Specialized octocopter for precision agricultural spraying.',
        platform: 'multirotor',
        suitability: ['agriculture', 'spraying', 'heavy-lift'],
        bom: { frameId: 'octo_heavy', motorId: 'kde_4014xf', battId: 'agri_14s_30000', escId: 'hw_p80_esc', propId: 'p13_carbon', payload: 'sprayer-tank-10L' },
        specs: { maxPayload: '15kg', maxEndurance: '25min', maxRange: '8km', twr: 2.3 }
    }
];

const DEFENSE_CONFIGS: PreGeneratedConfig[] = [
    {
        id: 'def-inter-01',
        name: 'Sentry-15 Interceptor',
        description: 'High-speed kinetic interceptor for localized air defense.',
        platform: 'multirotor',
        suitability: ['interception', 'high-speed', 'tactical'],
        bom: { frameId: 'quad_15', motorId: 'cobra_cm4515', battId: '4s_5000', escId: '60a_single', propId: 'p13_carbon', payload: 'impact-nose' },
        specs: { maxPayload: '0.5kg', maxEndurance: '12min', maxRange: '8km', twr: 5.2 }
    },
    {
        id: 'def-recon-02',
        name: 'Ghost-Recon FW',
        description: 'Silent composite fixed-wing for deep territory reconnaissance.',
        platform: 'fixed-wing',
        suitability: ['stealth', 'reconnaissance', 'long-range'],
        bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4006', battId: 'moli_6s2p', escId: '30a_generic', payload: 'skhy-eo' },
        specs: { maxPayload: '2kg', maxEndurance: '180min', maxRange: '150km', twr: 1.5 },
        productId: '900135'
    },
    {
        id: 'def-jam-03',
        name: 'Shield-Quad Anti-Jam',
        description: 'Reinforced quad with dual-redundant anti-jam GNSS and RF shielding.',
        platform: 'multirotor',
        suitability: ['contested-space', 'electronic-warfare', 'stable'],
        // Fix: cobra_cm4515 (55A) replaced with kde_4014xf (LV, 35A) for cleaner ESC margin.
        // 40a_xrotor (40A ≥ 35A ✓) + euclion_6s_22000 (LV) ✓ — all LV class.
        bom: { frameId: 'quad_15', motorId: 'kde_4014xf', battId: 'euclion_6s_22000', escId: '40a_xrotor', propId: 'p15_carbon', payload: 'aj-gnss-unit' },
        specs: { maxPayload: '4kg', maxEndurance: '50min', maxRange: '15km', twr: 2.8 },
        productId: '900115'
    },
    {
        id: 'def-loit-04',
        name: 'Vulture Loitering Munition',
        description: 'Delta-wing platform for extended loitering and precision strike.',
        platform: 'fixed-wing',
        suitability: ['strike', 'loitering', 'high-speed'],
        bom: { frameId: 'fixed_wing_delta', motorId: 'kde_4014xf', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'warhead-sim' },
        specs: { maxPayload: '3kg', maxEndurance: '45min', maxRange: '60km', twr: 2.1 }
    },
    {
        id: 'def-swarm-05',
        name: 'Swarm-Link 13',
        description: 'Agile 13-inch quad optimized for swarm networking and coordinated ops.',
        platform: 'multirotor',
        suitability: ['swarm', 'networking', 'agile'],
        bom: { frameId: 'quad_13', motorId: 'cobra_cm4515', battId: '4s_5000', escId: '60a_single', propId: 'p13_carbon', payload: 'mesh-radio' },
        specs: { maxPayload: '1kg', maxEndurance: '18min', maxRange: '5km', twr: 4.8 }
    },
    {
        id: 'def-heavy-06',
        name: 'Fortress Hex',
        description: 'Heavy tactical hexacopter for front-line resupply and sensor deployment.',
        platform: 'multirotor',
        suitability: ['tactical-logistics', 'heavy-lift', 'defense'],
        // Fix: ESC upgraded from hw_p50m_esc to hw_p80_esc (150A FOC).
        // tm_p80_iii needs 65A max; hw_p80_esc (150A) ≥ 65A ✓. Both LV class ✓.
        bom: { frameId: 'hex_industrial', motorId: 'tm_p80_iii', battId: 'agri_14s_30000', escId: 'hw_p80_esc', propId: 'p64_carbon', payload: 'drop-dispenser' },
        specs: { maxPayload: '12kg', maxEndurance: '32min', maxRange: '12km', twr: 2.4 }
    }
];

const SURVEY_CONFIGS: PreGeneratedConfig[] = [
    {
        id: 'surv-map-01',
        name: 'MapMaster Surveyor',
        description: 'High-precision mapping fixed-wing with dual-sensor gimbal.',
        platform: 'fixed-wing',
        suitability: ['mapping', 'survey', 'photogrammetry'],
        bom: { frameId: 'fixed_wing_surveyor', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'sony-a7r-gimbal' },
        specs: { maxPayload: '2.5kg', maxEndurance: '110min', maxRange: '90km', twr: 1.3 },
        productId: '900135'
    },
    {
        id: 'surv-thermal-02',
        name: 'Thermo-Quad 650',
        description: 'Tarot-based thermal inspection drone for power lines and pipelines.',
        platform: 'multirotor',
        suitability: ['inspection', 'thermal', 'infrastructure'],
        bom: { frameId: 'tarot_650', motorId: 'tm_mn4010', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'flir-duo-pro' },
        specs: { maxPayload: '1.8kg', maxEndurance: '48min', maxRange: '14km', twr: 2.9 }
    },
    {
        id: 'surv-lidar-03',
        name: 'LiDAR-Hex Industrial',
        description: 'Stable industrial hexacopter for high-density LiDAR terrain scanning.',
        platform: 'multirotor',
        suitability: ['lidar', 'geospatial', 'forestry'],
        // Fix: ESC upgraded from hw_p50m_esc to hw_p80_esc (150A FOC).
        // tm_p80_iii needs 65A max; hw_p80_esc (150A) ≥ 65A ✓. Both LV class ✓.
        bom: { frameId: 'hex_industrial', motorId: 'tm_p80_iii', battId: 'agri_14s_30000', escId: 'hw_p80_esc', propId: 'p64_carbon', payload: 'velodyne-lidar' },
        specs: { maxPayload: '6kg', maxEndurance: '38min', maxRange: '10km', twr: 2.1 }
    },
    {
        id: 'surv-marine-04',
        name: 'Ocean-Watch FW',
        description: 'Composite cruiser with long-range telemetry for maritime border patrol.',
        platform: 'fixed-wing',
        suitability: ['maritime', 'patrol', 'long-range'],
        bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4006', battId: 'revogreen_12s_22000', escId: '40a_xrotor', payload: 'ais-receiver' },
        specs: { maxPayload: '3kg', maxEndurance: '210min', maxRange: '180km', twr: 1.4 }
    },
    { id: 'tac-var-34', name: 'KDE Tactical Quad', description: 'Rugged ops quad.', platform: 'multirotor', suitability: ['tactical'], bom: { frameId: 'quad_15', motorId: 'kde_4014xf', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '4kg', maxEndurance: '40min', maxRange: '15km', twr: 3.2 } }
];

const ADDITIONAL_INDUSTRIAL: PreGeneratedConfig[] = [
    {
        id: 'gen-heavy-01',
        name: 'Titan-X8 Heavy Lift',
        description: 'Octocopter optimized for heavy industrial loads.',
        platform: 'multirotor',
        suitability: ['heavy-lift', 'industrial'],
        bom: { frameId: 'tarot_x8', motorId: 'tm_p80_iii', battId: 'mpower_14s_45000', escId: 'hw_p80_esc', propId: 'p17_carbon', payload: 'heavy-cargo-hook' },
        specs: { maxPayload: '35kg', maxEndurance: '22min', maxRange: '10km', twr: 2.1 }
    },
    {
        id: 'gen-heavy-02',
        name: 'Hercules T960',
        description: 'High-thrust hexacopter for construction logistics.',
        platform: 'multirotor',
        suitability: ['construction', 'logistics'],
        bom: { frameId: 'tarot_t960', motorId: 'hw_p50m', battId: 'mpower_14s_30000', escId: 'hw_p50m_esc', propId: 'p15_carbon', payload: 'material-winch' },
        specs: { maxPayload: '25kg', maxEndurance: '28min', maxRange: '12km', twr: 2.3 }
    },
    {
        id: 'gen-log-03',
        name: 'Cargo-Octo Elite',
        description: 'Maximum range heavy logistics platform.',
        platform: 'multirotor',
        suitability: ['long-range', 'logistics'],
        bom: { frameId: 'octo_heavy', motorId: 'tm_p80', battId: 'hv_400v_pack', escId: '100a_hv', propId: 'p32_carbon', payload: 'cargo-container-XL' },
        specs: { maxPayload: '55kg', maxEndurance: '35min', maxRange: '15km', twr: 1.9 }
    },
    {
        id: 'gen-agri-04',
        name: 'Agri-Spray Pro 960',
        description: 'Large scale agricultural spraying hexacopter.',
        platform: 'multirotor',
        suitability: ['agriculture', 'spraying'],
        bom: { frameId: 'tarot_t960', motorId: 'kde_4014xf', battId: 'agri_14s_30000', escId: 'hw_p50m_esc', propId: 'p17_carbon', payload: '15L-tank' },
        specs: { maxPayload: '18kg', maxEndurance: '22min', maxRange: '8km', twr: 2.4 }
    },
    {
        id: 'gen-log-05',
        name: 'Industrial Hex-Hauler',
        description: 'Reliable medium-lift for industrial parts.',
        platform: 'multirotor',
        suitability: ['industrial', 'logistics'],
        bom: { frameId: 'hex_industrial', motorId: 'tm_p80_iii', battId: 'revogreen_12s_22000', escId: 'hw_p80_esc', propId: 'p15_carbon', payload: 'standard-pallet' },
        specs: { maxPayload: '15kg', maxEndurance: '32min', maxRange: '14km', twr: 2.6 }
    },
    {
        id: 'gen-heavy-06',
        name: 'Sky-Crane X8-Max',
        description: 'Extreme lift capacity for infrastructure repair.',
        platform: 'multirotor',
        suitability: ['infrastructure', 'heavy-lift'],
        bom: { frameId: 'tarot_x8', motorId: 'hw_p65m', battId: 'hv_400v_pack', escId: '100a_hv', propId: 'p17_carbon', payload: 'steel-beam-grabber' },
        specs: { maxPayload: '65kg', maxEndurance: '18min', maxRange: '6km', twr: 1.8 }
    },
    {
        id: 'gen-log-07',
        name: 'Express-Lift Quad-Ind',
        description: 'Fast industrial quad for high-value components.',
        platform: 'multirotor',
        suitability: ['fast-delivery', 'industrial'],
        // Fix (gen-log-07): hw_p50m is HV class but mpower_14s_45000 is LV (51.8V) → voltage mismatch.
        // Replaced hw_p50m (HV) with tm_p80_iii (LV, 65A) + hw_p80_esc (150A FOC) ✓
        // quad_industrial frame (min_prop: 30") → p32_carbon ✓
        bom: { frameId: 'quad_industrial', motorId: 'tm_p80_iii', battId: 'mpower_14s_45000', escId: 'hw_p80_esc', propId: 'p32_carbon', payload: 'secure-case' },
        specs: { maxPayload: '20kg', maxEndurance: '40min', maxRange: '25km', twr: 2.5 }
    },
    {
        id: 'gen-heavy-08',
        name: 'Atlas Construction Octo',
        description: 'High redundancy lift for worksite materials.',
        platform: 'multirotor',
        suitability: ['construction', 'redundancy'],
        bom: { frameId: 'octo_heavy', motorId: 'tm_p80_iii', battId: 'mpower_14s_45000', escId: 'hw_p80_esc', propId: 'p40_carbon', payload: 'dual-hook-system' },
        specs: { maxPayload: '45kg', maxEndurance: '24min', maxRange: '8km', twr: 2.0 }
    },
    {
        id: 'gen-log-09',
        name: 'Logi-Hex Redundant',
        description: 'Safety-first hexacopter for urban logistics.',
        platform: 'multirotor',
        suitability: ['urban-logistics', 'safety'],
        bom: { frameId: 'tarot_t960', motorId: 'sunnysky_x4110s', battId: 'revogreen_12s_22000', escId: '40a_xrotor', propId: 'p15_carbon', payload: 'parachute-pod' },
        specs: { maxPayload: '8kg', maxEndurance: '45min', maxRange: '20km', twr: 3.1 }
    },
    {
        id: 'gen-agri-10',
        name: 'Precision-Ag Octo-lite',
        description: 'Lightweight octo for multispectral field analysis.',
        platform: 'multirotor',
        suitability: ['agriculture', 'mapping'],
        bom: { frameId: 'tarot_x8', motorId: 'tm_mn4010', battId: 'agri_14s_30000', escId: '40a_xrotor', propId: 'p14_carbon', payload: 'sentera-6x' },
        specs: { maxPayload: '12kg', maxEndurance: '38min', maxRange: '12km', twr: 2.8 }
    }
];

const ADDITIONAL_TACTICAL: PreGeneratedConfig[] = [
    {
        id: 'gen-def-11',
        name: 'Wraith Interceptor',
        description: 'Ultra-fast kinetic interceptor for defense.',
        platform: 'multirotor',
        suitability: ['interception', 'high-speed'],
        bom: { frameId: 'quad_13', motorId: 'zerodrag_3115', battId: 'moli_4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'impact-fuse' },
        specs: { maxPayload: '0.5kg', maxEndurance: '12min', maxRange: '6km', twr: 5.8 }
    },
    {
        id: 'gen-def-12',
        name: 'Ghost Recon 15',
        description: 'Silent reconnaissance platform for tactical ops.',
        platform: 'multirotor',
        suitability: ['recon', 'silent'],
        bom: { frameId: 'quad_15', motorId: 'zerodrag_2807', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p15_carbon', payload: 'starlight-cam' },
        specs: { maxPayload: '1kg', maxEndurance: '35min', maxRange: '15km', twr: 4.1 }
    },
    {
        id: 'gen-def-13',
        name: 'Shield-Quad Tactical',
        description: 'Reinforced tactical quad for electronic warfare.',
        platform: 'multirotor',
        suitability: ['ew', 'tactical'],
        bom: { frameId: 'quad_17', motorId: 'cobra_cm4515', battId: '4s_10000', escId: '60a_single', propId: 'p17_carbon', payload: 'broadband-jammer' },
        specs: { maxPayload: '2kg', maxEndurance: '25min', maxRange: '10km', twr: 3.5 }
    },
    {
        id: 'gen-def-14',
        name: 'Sentry-17 Pro',
        description: 'Advanced perimeter security quad with high endurance.',
        platform: 'multirotor',
        suitability: ['security', 'patrol'],
        bom: { frameId: 'quad_17', motorId: 'kde_4014xf', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p17_carbon', payload: 'eo-ir-gimbal' },
        specs: { maxPayload: '3kg', maxEndurance: '42min', maxRange: '18km', twr: 2.9 }
    },
    {
        id: 'gen-def-15',
        name: 'Wasp-13 Agile',
        description: 'High-agility quad for rapid target tracking.',
        platform: 'multirotor',
        suitability: ['tracking', 'agile'],
        bom: { frameId: 'quad_13', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'fast-gimbal-cam' },
        specs: { maxPayload: '0.8kg', maxEndurance: '18min', maxRange: '7km', twr: 4.9 }
    },
    {
        id: 'gen-def-16',
        name: 'Hawk Recon 650',
        description: 'Mid-size recon drone with extreme stability.',
        platform: 'multirotor',
        suitability: ['recon', 'stable'],
        bom: { frameId: 'tarot_650', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'long-range-optics' },
        specs: { maxPayload: '1.5kg', maxEndurance: '55min', maxRange: '25km', twr: 3.3 }
    },
    {
        id: 'gen-def-17',
        name: 'Falcon-15 Scout',
        description: 'Versatile scouting platform for varied environments.',
        platform: 'multirotor',
        suitability: ['scouting', 'versatile'],
        bom: { frameId: 'quad_15', motorId: 'tm_mn4010', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p15_carbon', payload: 'compact-mapping-kit' },
        specs: { maxPayload: '2kg', maxEndurance: '48min', maxRange: '20km', twr: 3.1 }
    },
    {
        id: 'gen-def-18',
        name: 'Mamba interceptor',
        description: 'Maximum acceleration drone for counter-UAS.',
        platform: 'multirotor',
        suitability: ['interception', 'defense'],
        bom: { frameId: 'quad_13', motorId: 'cobra_cm4515', battId: '4s_5000', escId: '60a_single', propId: 'p13_carbon', payload: 'net-gun' },
        specs: { maxPayload: '0.3kg', maxEndurance: '10min', maxRange: '5km', twr: 5.9 }
    },
    {
        id: 'gen-def-19',
        name: 'Specter-17 Silent',
        description: 'Low-noise tactical quad for covert operations.',
        platform: 'multirotor',
        suitability: ['covert', 'stealth'],
        bom: { frameId: 'quad_17', motorId: 'zerodrag_2807', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p17_carbon', payload: 'low-light-sensor' },
        specs: { maxPayload: '1.2kg', maxEndurance: '45min', maxRange: '18km', twr: 3.6 }
    },
    {
        id: 'gen-def-20',
        name: 'Guardian-15 Armor',
        description: 'Reinforced frame for high-risk industrial inspection.',
        platform: 'multirotor',
        suitability: ['inspection', 'high-risk'],
        bom: { frameId: 'quad_15', motorId: 'kde_4014xf', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p15_carbon', payload: 'gas-leak-detector' },
        specs: { maxPayload: '2.5kg', maxEndurance: '38min', maxRange: '12km', twr: 3.2 }
    },
    {
        id: 'gen-def-21',
        name: 'Raptor-13 Strike',
        description: 'Combat-ready micro quad for rapid strike.',
        platform: 'multirotor',
        suitability: ['combat', 'agile'],
        bom: { frameId: 'quad_13', motorId: 'zerodrag_3115', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'payload-release-v2' },
        specs: { maxPayload: '1kg', maxEndurance: '15min', maxRange: '8km', twr: 5.2 }
    },
    {
        id: 'gen-def-22',
        name: 'Viper-15 Kinetic',
        description: 'High velocity kinetic effector.',
        platform: 'multirotor',
        suitability: ['kinetic', 'defense'],
        bom: { frameId: 'quad_15', motorId: 'sunnysky_x4110s', battId: 'moli_4s_5000', escId: '40a_xrotor', propId: 'p15_carbon', payload: 'hardened-nose' },
        specs: { maxPayload: '0.8kg', maxEndurance: '20min', maxRange: '10km', twr: 4.5 }
    },
    {
        id: 'gen-def-23',
        name: 'Cobra-17 Tactical',
        description: 'Versatile tactical quad for frontline resupply.',
        platform: 'multirotor',
        suitability: ['resupply', 'tactical'],
        bom: { frameId: 'quad_17', motorId: 'cobra_cm4515', battId: 'revogreen_6s_16000', escId: '60a_single', propId: 'p17_carbon', payload: 'ammo-pod' },
        specs: { maxPayload: '2.5kg', maxEndurance: '28min', maxRange: '14km', twr: 3.8 }
    },
    {
        id: 'gen-def-24',
        name: 'Shadow-13 Recon',
        description: 'Micro-footprint recon for tight urban spaces.',
        platform: 'multirotor',
        suitability: ['urban-recon', 'stealth'],
        bom: { frameId: 'quad_13', motorId: 'zerodrag_1404', battId: '4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'nano-thermal' },
        specs: { maxPayload: '0.2kg', maxEndurance: '30min', maxRange: '5km', twr: 5.7 }
    },
    {
        id: 'gen-def-25',
        name: 'Iron-17 Sentry',
        description: 'Heavy duty perimeter sentry with T-Motor power.',
        platform: 'multirotor',
        suitability: ['security', 'heavy-duty'],
        bom: { frameId: 'quad_17', motorId: 'tm_p80_iii', battId: 'revogreen_12s_22000', escId: 'hw_p80_esc', propId: 'p17_carbon', payload: 'radar-unit' },
        specs: { maxPayload: '8kg', maxEndurance: '25min', maxRange: '10km', twr: 3.4 }
    }
];

const ADDITIONAL_SURVEY: PreGeneratedConfig[] = [
    {
        id: 'gen-surv-26',
        name: 'Mapper-650 Pro',
        description: 'Professional mapping drone for large scale survey.',
        platform: 'multirotor',
        suitability: ['mapping', 'photogrammetry'],
        bom: { frameId: 'tarot_650', motorId: 'tm_mn4010', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'sony-rx1r-ii' },
        specs: { maxPayload: '2kg', maxEndurance: '45min', maxRange: '15km', twr: 3.0 }
    },
    {
        id: 'gen-surv-27',
        name: 'Inspector-T960',
        description: 'Industrial inspector hex for structural analysis.',
        platform: 'multirotor',
        suitability: ['inspection', 'infrastructure'],
        bom: { frameId: 'tarot_t960', motorId: 'kde_4014xf', battId: 'revogreen_12s_22000', escId: 'hw_p50m_esc', propId: 'p15_carbon', payload: 'ultrasonic-sensor' },
        specs: { maxPayload: '6kg', maxEndurance: '42min', maxRange: '18km', twr: 2.8 }
    },
    {
        id: 'gen-surv-28',
        name: 'Thermal-Hex 960',
        description: 'Extended endurance thermal inspection platform.',
        platform: 'multirotor',
        suitability: ['thermal', 'inspection'],
        bom: { frameId: 'tarot_t960', motorId: 'sunnysky_x4110s', battId: 'euclion_6s_22000', escId: '40a_xrotor', propId: 'p17_carbon', payload: 'zenmuse-h20t' },
        specs: { maxPayload: '5kg', maxEndurance: '55min', maxRange: '22km', twr: 2.5 }
    },
    {
        id: 'gen-surv-29',
        name: 'LiDAR-650 Elite',
        description: 'Compact LiDAR scanner for forestry and mining.',
        platform: 'multirotor',
        suitability: ['lidar', 'survey'],
        bom: { frameId: 'tarot_650', motorId: 'kde_4014xf', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p14_carbon', payload: 'livox-avia' },
        specs: { maxPayload: '3kg', maxEndurance: '40min', maxRange: '12km', twr: 3.2 }
    },
    {
        id: 'gen-surv-30',
        name: 'Survey-Octo Lite',
        description: 'Redundant survey platform for critical urban areas.',
        platform: 'multirotor',
        suitability: ['urban-survey', 'redundancy'],
        bom: { frameId: 'tarot_x8', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p15_carbon', payload: 'oblique-cam' },
        specs: { maxPayload: '4kg', maxEndurance: '58min', maxRange: '25km', twr: 3.5 }
    },
    {
        id: 'gen-surv-31',
        name: 'Mining-Quad Ind',
        description: 'Rugged quad for underground mining survey.',
        platform: 'multirotor',
        suitability: ['mining', 'rugged'],
        bom: { frameId: 'quad_industrial', motorId: 'tm_p80_iii', battId: 'revogreen_12s_22000', escId: 'hw_p80_esc', propId: 'p32_carbon', payload: 'slam-lidar' },
        specs: { maxPayload: '12kg', maxEndurance: '35min', maxRange: '14km', twr: 2.7 }
    },
    {
        id: 'gen-surv-32',
        name: 'Pipeline-Hex Pro',
        description: 'High stability hex for long-distance pipeline check.',
        platform: 'multirotor',
        suitability: ['pipeline', 'inspection'],
        bom: { frameId: 'tarot_t960', motorId: 'cobra_cm4515', battId: 'revogreen_12s_22000', escId: '60a_single', propId: 'p15_carbon', payload: 'leak-sensor' },
        specs: { maxPayload: '7kg', maxEndurance: '38min', maxRange: '15km', twr: 3.3 }
    },
    {
        id: 'gen-surv-33',
        name: 'Eco-Surveyor 650',
        description: 'Environmental monitoring drone for wildlife conservation.',
        platform: 'multirotor',
        suitability: ['ecology', 'conservation'],
        bom: { frameId: 'tarot_650', motorId: 'zerodrag_2807', battId: 'moli_6s3p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'hydro-sensor' },
        specs: { maxPayload: '1kg', maxEndurance: '65min', maxRange: '30km', twr: 4.2 }
    },
    {
        id: 'gen-surv-34',
        name: 'Urban-Map 15',
        description: 'Fast urban mapping for smart city development.',
        platform: 'multirotor',
        suitability: ['urban', 'mapping'],
        bom: { frameId: 'quad_15', motorId: 'sunnysky_x4110s', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p15_carbon', payload: '5-lens-array' },
        specs: { maxPayload: '1.5kg', maxEndurance: '48min', maxRange: '18km', twr: 3.8 }
    },
    {
        id: 'gen-surv-35',
        name: 'Bridge-Check 17',
        description: 'Large-scale infrastructure inspection drone.',
        platform: 'multirotor',
        suitability: ['bridge', 'infrastructure'],
        bom: { frameId: 'quad_17', motorId: 'tm_mn4010', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p17_carbon', payload: 'crack-analyzer' },
        specs: { maxPayload: '2.5kg', maxEndurance: '52min', maxRange: '22km', twr: 2.9 }
    },
    {
        id: 'gen-surv-36',
        name: 'Forestry-Octo',
        description: 'High-payload octo for dense forest mapping.',
        platform: 'multirotor',
        suitability: ['forestry', 'lidar'],
        bom: { frameId: 'octo_heavy', motorId: 'kde_4014xf', battId: 'mpower_14s_30000', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'rieghl-lidar' },
        specs: { maxPayload: '15kg', maxEndurance: '40min', maxRange: '12km', twr: 2.3 }
    },
    {
        id: 'gen-surv-37',
        name: 'Offshore-Hex',
        description: 'Wind-resistant hex for offshore turbine inspection.',
        platform: 'multirotor',
        suitability: ['offshore', 'inspection'],
        bom: { frameId: 'hex_industrial', motorId: 'tm_p80', battId: 'revogreen_12s_22000', escId: '100a_hv', propId: 'p15_carbon', payload: 'uv-camera' },
        specs: { maxPayload: '10kg', maxEndurance: '35min', maxRange: '15km', twr: 2.6 }
    },
    {
        id: 'gen-surv-38',
        name: 'Geo-Map T960',
        description: 'Geological survey platform for mineral exploration.',
        platform: 'multirotor',
        suitability: ['geology', 'exploration'],
        bom: { frameId: 'tarot_t960', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p17_carbon', payload: 'mag-sensor' },
        specs: { maxPayload: '3kg', maxEndurance: '75min', maxRange: '35km', twr: 3.1 }
    },
    {
        id: 'gen-surv-39',
        name: 'Night-Watch 650',
        description: 'Thermal patrol drone for security and wildlife.',
        platform: 'multirotor',
        suitability: ['thermal', 'patrol'],
        bom: { frameId: 'tarot_650', motorId: 'zerodrag_2807', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'night-vision-gimbal' },
        specs: { maxPayload: '0.8kg', maxEndurance: '50min', maxRange: '20km', twr: 4.5 }
    },
    {
        id: 'gen-surv-40',
        name: 'Search-Hex Industrial',
        description: 'Search and rescue platform for large-scale ops.',
        platform: 'multirotor',
        suitability: ['sar', 'industrial'],
        bom: { frameId: 'hex_industrial', motorId: 'sunnysky_x4110s', battId: 'euclion_6s_22000', escId: 'hw_p50m_esc', propId: 'p15_carbon', payload: 'thermal-spotlight' },
        specs: { maxPayload: '8kg', maxEndurance: '45min', maxRange: '12km', twr: 2.4 }
    }
];

const ADDITIONAL_FW: PreGeneratedConfig[] = [
    {
        id: 'gen-fw-41',
        name: 'Vanguard Long Range',
        description: 'Elite long-range composite fixed-wing.',
        platform: 'fixed-wing',
        suitability: ['long-range', 'patrol'],
        bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4006', battId: 'revogreen_12s_22000', escId: '40a_xrotor', payload: 'eo-sensor-suite' },
        specs: { maxPayload: '4kg', maxEndurance: '280min', maxRange: '250km', twr: 1.4 }
    },
    {
        id: 'gen-fw-42',
        name: 'Surveyor-Elite VTOL',
        description: 'High-precision mapping VTOL platform.',
        platform: 'fixed-wing',
        suitability: ['vtol', 'mapping'],
        bom: { frameId: 'fixed_wing_surveyor', motorId: 'kde_4014xf', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'ppk-gnss' },
        specs: { maxPayload: '3kg', maxEndurance: '150min', maxRange: '120km', twr: 1.6 }
    },
    {
        id: 'gen-fw-43',
        name: 'Delta-Sprint Stealth',
        description: 'High-speed stealth delta wing for rapid scouting.',
        platform: 'fixed-wing',
        suitability: ['high-speed', 'stealth'],
        bom: { frameId: 'fixed_wing_delta', motorId: 'zerodrag_3115', battId: 'moli_6s2p', escId: 'zd_boost_55a', payload: 'fast-scan-cam' },
        specs: { maxPayload: '1kg', maxEndurance: '45min', maxRange: '80km', twr: 2.8 }
    },
    {
        id: 'gen-fw-44',
        name: 'Talon-Endurance Pro',
        description: 'Standard long-range endurance platform.',
        platform: 'fixed-wing',
        suitability: ['endurance', 'logistics'],
        bom: { frameId: 'fixed_wing_talon', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'cargo-box-S' },
        specs: { maxPayload: '2kg', maxEndurance: '180min', maxRange: '150km', twr: 1.3 }
    },
    {
        id: 'gen-fw-45',
        name: 'Cloud-Cruiser FW',
        description: 'High-altitude cruiser for atmospheric research.',
        platform: 'fixed-wing',
        suitability: ['high-altitude', 'research'],
        bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4010', battId: 'euclion_6s_22000', escId: '40a_xrotor', payload: 'gas-analyzer' },
        specs: { maxPayload: '5kg', maxEndurance: '220min', maxRange: '200km', twr: 1.5 }
    },
    {
        id: 'gen-fw-46',
        name: 'Maritime-Patrol FW',
        description: 'Salt-resistant composite wing for maritime security.',
        platform: 'fixed-wing',
        suitability: ['maritime', 'security'],
        bom: { frameId: 'fixed_wing_surveyor', motorId: 'sunnysky_x4110s', battId: 'revogreen_12s_22000', escId: '40a_xrotor', payload: 'ais-radar' },
        specs: { maxPayload: '6kg', maxEndurance: '120min', maxRange: '100km', twr: 1.7 }
    },
    {
        id: 'gen-fw-47',
        name: 'Delta-Interceptor',
        description: 'Rapid deployment delta wing for interception.',
        platform: 'fixed-wing',
        suitability: ['interception', 'defense'],
        bom: { frameId: 'fixed_wing_delta', motorId: 'cobra_cm4515', battId: '4s_10000', escId: '60a_single', payload: 'kinetic-warhead' },
        specs: { maxPayload: '2kg', maxEndurance: '35min', maxRange: '60km', twr: 3.2 }
    },
    {
        id: 'gen-fw-48',
        name: 'Sky-Eye Talon',
        description: 'Affordable long-range surveillance wing.',
        platform: 'fixed-wing',
        suitability: ['surveillance', 'low-cost'],
        bom: { frameId: 'fixed_wing_talon', motorId: 'sunnysky_x2212', battId: 'moli_6s2p', escId: '30a_generic', payload: 'fpv-long-range' },
        specs: { maxPayload: '1kg', maxEndurance: '140min', maxRange: '120km', twr: 1.4 }
    },
    {
        id: 'gen-fw-49',
        name: 'Border-Watch Cruiser',
        description: 'Heavy duty border surveillance wing.',
        platform: 'fixed-wing',
        suitability: ['border-patrol', 'surveillance'],
        bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'kde_4014xf', battId: 'mpower_14s_30000', escId: '40a_xrotor', payload: 'long-range-eo' },
        specs: { maxPayload: '10kg', maxEndurance: '90min', maxRange: '80km', twr: 1.8 }
    },
    {
        id: 'gen-fw-50',
        name: 'Solar-Surveyor Pro',
        description: 'Solar-powered extreme endurance wing.',
        platform: 'fixed-wing',
        suitability: ['solar', 'extreme-endurance'],
        bom: { frameId: 'fixed_wing_surveyor', motorId: 'tm_mn4006', battId: 'revogreen_6s_22500', escId: '30a_generic', payload: 'solar-cells' },
        specs: { maxPayload: '2.5kg', maxEndurance: '350min', maxRange: '300km', twr: 1.2 }
    }
];

export const PRE_GENERATED_CONFIGS: PreGeneratedConfig[] = [
    ...LOGISTICS_CONFIGS,
    ...DEFENSE_CONFIGS,
    ...SURVEY_CONFIGS,
    ...ADDITIONAL_INDUSTRIAL,
    ...ADDITIONAL_TACTICAL,
    ...ADDITIONAL_SURVEY,
    ...ADDITIONAL_FW,
    { id: 'var-01', name: 'Rapid Response Quad 17', description: 'Lightweight response drone.', platform: 'multirotor', suitability: ['emergency'], bom: { frameId: 'quad_17', motorId: 'sunnysky_x2212', battId: '4s_5000', escId: '30a_generic', propId: 'p13_carbon' }, specs: { maxPayload: '1kg', maxEndurance: '22min', maxRange: '5km', twr: 4.1 } },
    { id: 'var-02', name: 'Heavy Surveyor FW', description: 'Long range with heavy camera payload.', platform: 'fixed-wing', suitability: ['mapping'], bom: { frameId: 'fixed_wing_talon', motorId: 'kde_4014xf', battId: 'moli_6s3p', escId: '40a_xrotor' }, specs: { maxPayload: '5kg', maxEndurance: '80min', maxRange: '70km', twr: 1.6 } },
    { id: 'var-03', name: 'Industrial Octo-Lite', description: 'Energy efficient heavy lift.', platform: 'multirotor', suitability: ['heavy-lift'], bom: { frameId: 'octo_heavy', motorId: 'tm_mn4010', battId: 'euclion_6s_22000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '12kg', maxEndurance: '42min', maxRange: '15km', twr: 2.6 } },
    { id: 'var-04', name: 'Tactical Delta X', description: 'High speed defense delta.', platform: 'fixed-wing', suitability: ['defense'], bom: { frameId: 'fixed_wing_delta', motorId: 'cobra_cm4515', battId: '4s_10000', escId: '40a_xrotor' }, specs: { maxPayload: '2kg', maxEndurance: '30min', maxRange: '45km', twr: 3.2 } },
    { id: 'var-05', name: 'Micro-Recon 13', description: 'Palm-sized recon.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'quad_13', motorId: 'sunnysky_x2212', battId: '4s_5000', escId: '30a_generic', propId: 'p13_carbon' }, specs: { maxPayload: '0.5kg', maxEndurance: '15min', maxRange: '3km', twr: 5.5 } },
    { id: 'var-06', name: 'Mining Surveyor Hex', description: 'Dust-resistant hex for mining.', platform: 'multirotor', suitability: ['mining'], bom: { frameId: 'hex_industrial', motorId: 'tm_mn4010', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '5kg', maxEndurance: '35min', maxRange: '8km', twr: 2.8 } },
    { id: 'var-07', name: 'Border Patrol FW', description: 'Endurance patrol.', platform: 'fixed-wing', suitability: ['border-patrol'], bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor' }, specs: { maxPayload: '2kg', maxEndurance: '240min', maxRange: '200km', twr: 1.2 } },
    { id: 'var-08', name: 'Solar Cloud FW', description: 'Ultra-high altitude.', platform: 'fixed-wing', suitability: ['high-altitude'], bom: { frameId: 'fixed_wing_surveyor', motorId: 'tm_mn4006', battId: 'euclion_6s_22000', escId: '40a_xrotor' }, specs: { maxPayload: '0.5kg', maxEndurance: '400min', maxRange: '300km', twr: 1.1 } },
    { id: 'var-09', name: 'Logistics Octo-Max', description: 'Maximum lift capacity.', platform: 'multirotor', suitability: ['heavy-lift'], bom: { frameId: 'octo_heavy', motorId: 'tm_p80', battId: 'agri_14s_30000', escId: '100a_hv', propId: 'p13_carbon' }, specs: { maxPayload: '40kg', maxEndurance: '22min', maxRange: '6km', twr: 1.8 } },
    { id: 'var-10', name: 'Urban Courier Quad', description: 'Last-mile delivery.', platform: 'multirotor', suitability: ['delivery'], bom: { frameId: 'quad_industrial', motorId: 'sunnysky_x4110s', battId: 'moli_6s2p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '2.5kg', maxEndurance: '30min', maxRange: '12km', twr: 3.2 } },
    { id: 'var-11', name: 'Search & Rescue Hex', description: 'Thermal SAR hex.', platform: 'multirotor', suitability: ['sar'], bom: { frameId: 'hex_industrial', motorId: 'kde_4014xf', battId: 'euclion_6s_22000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '7kg', maxEndurance: '45min', maxRange: '15km', twr: 2.4 } },
    { id: 'var-12', name: 'Cinematic Tarot 650', description: 'Stable filming.', platform: 'multirotor', suitability: ['cinema'], bom: { frameId: 'tarot_650', motorId: 'tm_mn4010', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '3kg', maxEndurance: '28min', maxRange: '7km', twr: 2.7 } },
    { id: 'var-13', name: 'Aggressive Interceptor 15', description: 'Tactical speed.', platform: 'multirotor', suitability: ['defense'], bom: { frameId: 'quad_15', motorId: 'cobra_cm4515', battId: '4s_5000', escId: '60a_single', propId: 'p13_carbon' }, specs: { maxPayload: '0.2kg', maxEndurance: '10min', maxRange: '5km', twr: 5.8 } },
    { id: 'var-14', name: 'Long Range Mapping Talon', description: 'Extended mapping.', platform: 'fixed-wing', suitability: ['mapping'], bom: { frameId: 'fixed_wing_talon', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor' }, specs: { maxPayload: '1.5kg', maxEndurance: '130min', maxRange: '110km', twr: 1.3 } },
    { id: 'var-15', name: 'Hybrid Courier FW', description: 'VTOL-style delivery.', platform: 'fixed-wing', suitability: ['delivery'], bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'kde_4014xf', battId: 'revogreen_12s_22000', escId: '40a_xrotor' }, specs: { maxPayload: '6kg', maxEndurance: '90min', maxRange: '80km', twr: 1.8 } },
    { id: 'var-16', name: 'Tactical Recon Quad 17', description: 'Mid-sized recon.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'quad_17', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '2kg', maxEndurance: '32min', maxRange: '10km', twr: 3.5 } },
    { id: 'var-17', name: 'Heavy Rescue Octo', description: 'Mountain SAR.', platform: 'multirotor', suitability: ['sar'], bom: { frameId: 'octo_heavy', motorId: 'kde_4014xf', battId: 'agri_14s_30000', escId: 'hw_p80_esc', propId: 'p13_carbon' }, specs: { maxPayload: '18kg', maxEndurance: '28min', maxRange: '9km', twr: 2.2 } },
    { id: 'var-18', name: 'Stealth Delta', description: 'Low signature delta.', platform: 'fixed-wing', suitability: ['stealth'], bom: { frameId: 'fixed_wing_delta', motorId: 'tm_mn4006', battId: 'moli_6s2p', escId: '30a_generic' }, specs: { maxPayload: '1kg', maxEndurance: '50min', maxRange: '55km', twr: 2.5 } },
    { id: 'var-19', name: 'Industrial Hex-Lite', description: 'Efficient inspector.', platform: 'multirotor', suitability: ['inspection'], bom: { frameId: 'hex_industrial', motorId: 'sunnysky_x2212', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '3kg', maxEndurance: '55min', maxRange: '14km', twr: 3.1 } },
    { id: 'var-20', name: 'Talon Endurance King', description: 'Extreme range.', platform: 'fixed-wing', suitability: ['long-range'], bom: { frameId: 'fixed_wing_talon', motorId: 'tm_mn4006', battId: 'euclion_6s_22000', escId: '40a_xrotor' }, specs: { maxPayload: '1kg', maxEndurance: '160min', maxRange: '140km', twr: 1.2 } },
    { id: 'var-21', name: 'High Torque Octo', description: 'Wind resistant lift.', platform: 'multirotor', suitability: ['offshore'], bom: { frameId: 'octo_heavy', motorId: 'kde_4014xf', battId: 'revogreen_12s_22000', escId: '100a_hv', propId: 'p13_carbon' }, specs: { maxPayload: '15kg', maxEndurance: '30min', maxRange: '10km', twr: 2.4 } },
    { id: 'var-22', name: 'Rapid Mapping Quad 15', description: 'Fast survey.', platform: 'multirotor', suitability: ['mapping'], bom: { frameId: 'quad_15', motorId: 'sunnysky_x4110s', battId: 'moli_6s2p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '1.5kg', maxEndurance: '28min', maxRange: '12km', twr: 3.9 } },
    { id: 'var-23', name: 'Payload Pro FW', description: 'High payload fixed-wing.', platform: 'fixed-wing', suitability: ['logistics'], bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'kde_4014xf', battId: 'iotech_12s_16000', escId: '40a_xrotor' }, specs: { maxPayload: '8kg', maxEndurance: '70min', maxRange: '60km', twr: 1.7 } },
    { id: 'var-24', name: 'Agri-Scan Hex', description: 'Precision ag-hex.', platform: 'multirotor', suitability: ['agriculture'], bom: { frameId: 'hex_industrial', motorId: 'tm_mn4010', battId: 'revogreen_12s_22000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '6kg', maxEndurance: '40min', maxRange: '12km', twr: 2.5 } },
    { id: 'var-25', name: 'Urban Stealth Quad 13', description: 'Quiet urban recon.', platform: 'multirotor', suitability: ['urban'], bom: { frameId: 'quad_13', motorId: 'tm_mn4006', battId: '4s_5000', escId: '30a_generic', propId: 'p13_carbon' }, specs: { maxPayload: '0.8kg', maxEndurance: '20min', maxRange: '4km', twr: 4.2 } },
    { id: 'var-26', name: 'Surveyor Endurance+', description: 'Mapping extreme.', platform: 'fixed-wing', suitability: ['mapping'], bom: { frameId: 'fixed_wing_surveyor', motorId: 'sunnysky_x2212', battId: 'moli_6s3p', escId: '40a_xrotor' }, specs: { maxPayload: '1kg', maxEndurance: '140min', maxRange: '120km', twr: 1.3 } },
    { id: 'var-27', name: 'Cargo Master Octo', description: 'Balanced logistics.', platform: 'multirotor', suitability: ['logistics'], bom: { frameId: 'octo_heavy', motorId: 'sunnysky_x4110s', battId: 'revogreen_12s_22000', escId: '100a_hv', propId: 'p13_carbon' }, specs: { maxPayload: '14kg', maxEndurance: '35min', maxRange: '11km', twr: 2.3 } },
    { id: 'var-28', name: 'Fast Recon Delta', description: 'High speed scouting.', platform: 'fixed-wing', suitability: ['recon'], bom: { frameId: 'fixed_wing_delta', motorId: 'cobra_cm4515', battId: '4s_5000', escId: '30a_generic' }, specs: { maxPayload: '0.5kg', maxEndurance: '25min', maxRange: '40km', twr: 3.8 } },
    { id: 'var-29', name: 'Industrial Quad-Heavy', description: 'Small footprint/high lift.', platform: 'multirotor', suitability: ['industrial'], bom: { frameId: 'quad_industrial', motorId: 'kde_4014xf', battId: 'iotech_12s_16000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '6kg', maxEndurance: '34min', maxRange: '12km', twr: 2.7 } },
    { id: 'var-30', name: 'Tarot Long Range', description: 'Li-Ion Tarot setup.', platform: 'multirotor', suitability: ['survey'], bom: { frameId: 'tarot_650', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '1kg', maxEndurance: '60min', maxRange: '20km', twr: 3.2 } },
    { id: 'var-31', name: 'Heavy Interceptor 17', description: 'Power interceptor.', platform: 'multirotor', suitability: ['defense'], bom: { frameId: 'quad_17', motorId: 'kde_4014xf', battId: '4s_10000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '1.5kg', maxEndurance: '12min', maxRange: '6km', twr: 5.1 } },
    { id: 'var-32', name: 'Surveyor Pro-Lite', description: 'Entry level survey.', platform: 'fixed-wing', suitability: ['survey'], bom: { frameId: 'fixed_wing_surveyor', motorId: 'sunnysky_x2212', battId: '4s_10000', escId: '30a_generic' }, specs: { maxPayload: '0.8kg', maxEndurance: '60min', maxRange: '50km', twr: 1.4 } },
    { id: 'var-33', name: 'Logistics Titan-Eco', description: 'Energy saving heavy lift.', platform: 'multirotor', suitability: ['logistics'], bom: { frameId: 'octo_heavy', motorId: 'tm_mn4010', battId: 'euclion_6s_22000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '10kg', maxEndurance: '48min', maxRange: '18km', twr: 2.8 } },
    {
        id: 'tac-zerodrag-01',
        name: 'Zerodrag Stealth Recon',
        description: 'Ultra-quiet recon drone using Zerodrag 1404 motors and Molicel P45B cells.',
        platform: 'multirotor',
        suitability: ['stealth', 'recon', 'urban'],
        bom: { frameId: 'quad_13', motorId: 'zerodrag_1404', battId: 'moli_4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'skydroid_h16_cam' },
        specs: { maxPayload: '0.4kg', maxEndurance: '25min', maxRange: '8km', twr: 5.4 }
    },
    {
        id: 'tac-jam-01',
        name: 'Acasom Signal Denier',
        description: 'Tactical jamming platform equipped with Acasom 4W dual-path amplification.',
        platform: 'multirotor',
        suitability: ['jamming', 'electronic-warfare', 'contested-space'],
        bom: { frameId: 'quad_17', motorId: 'sunnysky_x4110s', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_4w_booster' },
        specs: { maxPayload: '2kg', maxEndurance: '40min', maxRange: '15km', twr: 3.1 }
    },
    {
        id: 'tac-heavy-01',
        name: 'Tarot T960 Heavy Hauler',
        description: 'Industrial heavy-lift hexacopter with Hobbywing P50M propulsion.',
        platform: 'multirotor',
        suitability: ['heavy-lift', 'logistics', 'industrial'],
        bom: { frameId: 'tarot_t960', motorId: 'hw_p50m', battId: 'mpower_14s_45000', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'heavy_cargo_winch' },
        specs: { maxPayload: '35kg', maxEndurance: '28min', maxRange: '10km', twr: 2.1 }
    },
    {
        id: 'tac-long-01',
        name: 'KDE Endurance Pro',
        description: 'Long-range inspection drone with KDE motors and Molicel high-capacity packs.',
        platform: 'multirotor',
        suitability: ['inspection', 'long-range', 'infrastructure'],
        bom: { frameId: 'tarot_650', motorId: 'kde_4014xf', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'unbtek_eo_gimbal' },
        specs: { maxPayload: '2.5kg', maxEndurance: '55min', maxRange: '22km', twr: 2.9 }
    },
    {
        id: 'tac-fast-01',
        name: 'Zerodrag Interceptor',
        description: 'High-TWR interceptor using Zerodrag 3115 900KV motors for rapid target acquisition.',
        platform: 'multirotor',
        suitability: ['interception', 'high-speed', 'defense'],
        bom: { frameId: 'quad_15', motorId: 'zerodrag_3115', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'impact_trigger' },
        specs: { maxPayload: '1kg', maxEndurance: '15min', maxRange: '10km', twr: 5.5 }
    },
    {
        id: 'tac-agri-01',
        name: 'Tarot X8 Agri-Master',
        description: 'Heavy-lift agricultural octocopter with T-Motor P80 III propulsion.',
        platform: 'multirotor',
        suitability: ['agriculture', 'spraying', 'heavy-lift'],
        bom: { frameId: 'tarot_x8', motorId: 'tm_p80_iii', battId: 'mpower_14s_30000', escId: 'hw_p80_esc', propId: 'p13_carbon', payload: '15L_spray_tank' },
        specs: { maxPayload: '25kg', maxEndurance: '22min', maxRange: '6km', twr: 2.0 }
    },
    {
        id: 'tac-recon-01',
        name: 'Molicel Scout',
        description: 'Efficient scouting platform optimized for Li-ion energy density.',
        platform: 'multirotor',
        suitability: ['recon', 'mapping', 'low-observable'],
        bom: { frameId: 'quad_15', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'light_optics' },
        specs: { maxPayload: '1.2kg', maxEndurance: '65min', maxRange: '30km', twr: 3.4 }
    },
    {
        id: 'tac-jam-02',
        name: 'Acasom Wideband Disruptor',
        description: 'Mobile jamming unit with Acasom 10W broadband amplification.',
        platform: 'multirotor',
        suitability: ['electronic-warfare', 'jamming', 'defense'],
        bom: { frameId: 'quad_17', motorId: 'tm_mn4010', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_10w_booster' },
        specs: { maxPayload: '1.5kg', maxEndurance: '45min', maxRange: '12km', twr: 2.7 }
    },
    {
        id: 'tac-heavy-02',
        name: 'Titan Cargo Hex',
        description: 'High-reliability hexacopter for critical parts logistics.',
        platform: 'multirotor',
        suitability: ['logistics', 'delivery', 'redundancy'],
        bom: { frameId: 'tarot_t960', motorId: 'kde_4014xf', battId: 'mpower_14s_30000', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'cargo_bay' },
        specs: { maxPayload: '12kg', maxEndurance: '40min', maxRange: '18km', twr: 2.6 }
    },
    {
        id: 'tac-stealth-02',
        name: 'Zerodrag Urban Sentry',
        description: 'Small-footprint urban surveillance drone with Zerodrag propulsion.',
        platform: 'multirotor',
        suitability: ['urban', 'stealth', 'recon'],
        bom: { frameId: 'quad_13', motorId: 'zerodrag_2807', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'compact_night_vision' },
        specs: { maxPayload: '0.6kg', maxEndurance: '32min', maxRange: '10km', twr: 4.8 }
    },
    {
        id: 'tac-long-02',
        name: 'Vanguard Survey FW',
        description: 'Long-range composite fixed-wing for national border survey.',
        platform: 'fixed-wing',
        suitability: ['mapping', 'survey', 'long-range'],
        bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'hi_res_photogrammetry' },
        specs: { maxPayload: '3kg', maxEndurance: '220min', maxRange: '180km', twr: 1.4 }
    },
    {
        id: 'tac-inter-02',
        name: 'Wasp Kinetic interceptor',
        description: 'Ultra-high acceleration drone for counter-UAS operations.',
        platform: 'multirotor',
        suitability: ['interception', 'high-speed', 'defense'],
        bom: { frameId: 'quad_13', motorId: 'zerodrag_3115', battId: 'moli_4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'net_launcher' },
        specs: { maxPayload: '0.8kg', maxEndurance: '12min', maxRange: '5km', twr: 5.8 }
    },
    {
        id: 'tac-heavy-03',
        name: 'Sky-Crane Octo',
        description: 'Extreme-lift octocopter for infrastructure repair materials.',
        platform: 'multirotor',
        suitability: ['heavy-lift', 'industrial', 'construction'],
        bom: { frameId: 'tarot_x8', motorId: 'hw_p50m', battId: 'mpower_14s_45000', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'material_grabber' },
        specs: { maxPayload: '45kg', maxEndurance: '20min', maxRange: '4km', twr: 1.8 }
    },
    {
        id: 'tac-recon-02',
        name: 'Shadow-Scan Quad',
        description: 'Low-noise quad for sensitive ecological survey in remote areas.',
        platform: 'multirotor',
        suitability: ['recon', 'ecology', 'silent'],
        bom: { frameId: 'quad_15', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'multispectral_sensor' },
        specs: { maxPayload: '1.5kg', maxEndurance: '58min', maxRange: '25km', twr: 3.2 }
    },
    {
        id: 'tac-jam-03',
        name: 'Skhy-Jammer Tactical',
        description: 'Front-line EW drone with integrated Skhy signal processing and Acasom power.',
        platform: 'multirotor',
        suitability: ['electronic-warfare', 'defense', 'tactical'],
        bom: { frameId: 'quad_17', motorId: 'kde_4014xf', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'skhy_ew_suite' },
        specs: { maxPayload: '3kg', maxEndurance: '35min', maxRange: '10km', twr: 2.5 }
    },
    {
        id: 'tac-delivery-01',
        name: 'Express-Lift Hex',
        description: 'Mid-range hexacopter for automated medical logistics.',
        platform: 'multirotor',
        suitability: ['delivery', 'medical', 'stable'],
        bom: { frameId: 'tarot_t960', motorId: 'tm_mn4010', battId: 'mpower_14s_30000', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'refrigerated_med_box' },
        specs: { maxPayload: '8kg', maxEndurance: '45min', maxRange: '20km', twr: 2.8 }
    },
    {
        id: 'tac-stealth-03',
        name: 'Zerodrag Night-Watch',
        description: 'Stealth-optimized surveillance drone for night operations.',
        platform: 'multirotor',
        suitability: ['stealth', 'night-ops', 'recon'],
        bom: { frameId: 'quad_15', motorId: 'zerodrag_2807', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p13_carbon', payload: 'thermal_recon_v3' },
        specs: { maxPayload: '0.8kg', maxEndurance: '38min', maxRange: '15km', twr: 4.5 }
    },
    {
        id: 'tac-mapping-01',
        name: 'Precision-Map Talon',
        description: 'Fixed-wing mapping drone with sub-centimeter accuracy LiDAR.',
        platform: 'fixed-wing',
        suitability: ['mapping', 'lidar', 'geospatial'],
        bom: { frameId: 'fixed_wing_talon', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'compact_lidar_unit' },
        specs: { maxPayload: '2kg', maxEndurance: '95min', maxRange: '80km', twr: 1.7 }
    },
    {
        id: 'tac-defense-01',
        name: 'Fortress-8 Tactical',
        description: 'Heavy tactical octocopter for persistent perimeter security.',
        platform: 'multirotor',
        suitability: ['defense', 'perimeter-security', 'stable'],
        bom: { frameId: 'tarot_x8', motorId: 'tm_p80_iii', battId: 'mpower_14s_45000', escId: 'hw_p80_esc', propId: 'p13_carbon', payload: 'sentry_sensor_array' },
        specs: { maxPayload: '20kg', maxEndurance: '35min', maxRange: '10km', twr: 2.4 }
    },
    {
        id: 'tac-survey-01',
        name: 'Industrial Inspection Hex',
        description: 'Reliable hexacopter for high-voltage power line inspection.',
        platform: 'multirotor',
        suitability: ['inspection', 'infrastructure', 'stable'],
        bom: { frameId: 'tarot_t960', motorId: 'kde_4014xf', battId: 'revogreen_6s_22500', escId: 'hw_p50m_esc', propId: 'p13_carbon', payload: 'corona_camera' },
        specs: { maxPayload: '5kg', maxEndurance: '50min', maxRange: '12km', twr: 3.0 }
    },
    { id: 'tac-var-01', name: 'Zerodrag Sprint', description: 'High-speed agile quad.', platform: 'multirotor', suitability: ['racing', 'agile'], bom: { frameId: 'quad_13', motorId: 'zerodrag_3115', battId: 'moli_4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '0.5kg', maxEndurance: '15min', maxRange: '6km', twr: 5.9 } },
    { id: 'tac-var-02', name: 'Acasom Guardian', description: 'Shielding EW quad.', platform: 'multirotor', suitability: ['defense'], bom: { frameId: 'quad_15', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_5w_booster' }, specs: { maxPayload: '1kg', maxEndurance: '42min', maxRange: '15km', twr: 3.8 } },
    { id: 'tac-var-03', name: 'Heavy Lift Titan V', description: 'Max lift hex.', platform: 'multirotor', suitability: ['logistics'], bom: { frameId: 'tarot_t960', motorId: 'hw_p50m', battId: 'mpower_14s_45000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '30kg', maxEndurance: '25min', maxRange: '8km', twr: 2.2 } },
    { id: 'tac-var-04', name: 'KDE Scout 17', description: 'Industrial recon.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'quad_17', motorId: 'kde_4014xf', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '3kg', maxEndurance: '52min', maxRange: '20km', twr: 2.8 } },
    { id: 'tac-var-05', name: 'Molicel Endurance FW', description: 'Extreme distance FW.', platform: 'fixed-wing', suitability: ['long-range'], bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor' }, specs: { maxPayload: '1kg', maxEndurance: '260min', maxRange: '220km', twr: 1.3 } },
    { id: 'tac-var-06', name: 'Tarot X8 Agri-Lite', description: 'Efficient sprayer.', platform: 'multirotor', suitability: ['agriculture'], bom: { frameId: 'tarot_x8', motorId: 'tm_mn4010', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '10kg', maxEndurance: '38min', maxRange: '10km', twr: 2.9 } },
    { id: 'tac-var-07', name: 'Zerodrag Stealth 15', description: 'Quiet tactical quad.', platform: 'multirotor', suitability: ['stealth'], bom: { frameId: 'quad_15', motorId: 'zerodrag_2807', battId: 'moli_6s2p', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '1kg', maxEndurance: '35min', maxRange: '12km', twr: 4.2 } },
    { id: 'tac-var-08', name: 'Acasom Intercept', description: 'Anti-jam interceptor.', platform: 'multirotor', suitability: ['defense'], bom: { frameId: 'quad_13', motorId: 'sunnysky_x4110s', battId: '4s_10000', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_4w_booster' }, specs: { maxPayload: '0.5kg', maxEndurance: '20min', maxRange: '8km', twr: 4.7 } },
    { id: 'tac-var-09', name: 'Heavy Hauler Octo+', description: 'Redundant heavy lift.', platform: 'multirotor', suitability: ['logistics'], bom: { frameId: 'tarot_x8', motorId: 'tm_p80_iii', battId: 'mpower_14s_30000', escId: 'hw_p80_esc', propId: 'p13_carbon' }, specs: { maxPayload: '25kg', maxEndurance: '24min', maxRange: '7km', twr: 2.3 } },
    { id: 'tac-var-10', name: 'KDE Master Hex', description: 'High reliability hex.', platform: 'multirotor', suitability: ['industrial'], bom: { frameId: 'tarot_t960', motorId: 'kde_4014xf', battId: 'revogreen_12s_22000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '15kg', maxEndurance: '42min', maxRange: '15km', twr: 2.6 } },
    { id: 'tac-var-11', name: 'Molicel Power Quad 17', description: 'Punchy survey quad.', platform: 'multirotor', suitability: ['survey'], bom: { frameId: 'quad_17', motorId: 'tm_mn4010', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '4kg', maxEndurance: '48min', maxRange: '18km', twr: 3.1 } },
    { id: 'tac-var-12', name: 'Talon Long Watch', description: 'Persistent patrol FW.', platform: 'fixed-wing', suitability: ['patrol'], bom: { frameId: 'fixed_wing_talon', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor' }, specs: { maxPayload: '2kg', maxEndurance: '140min', maxRange: '110km', twr: 1.4 } },
    { id: 'tac-var-13', name: 'Zerodrag Micro Recon', description: 'Tiny silent recon.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'quad_13', motorId: 'zerodrag_1404', battId: '4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '0.2kg', maxEndurance: '28min', maxRange: '5km', twr: 5.6 } },
    { id: 'tac-var-14', name: 'Acasom EW Suite Quad', description: 'Integrated EW platform.', platform: 'multirotor', suitability: ['electronic-warfare'], bom: { frameId: 'quad_17', motorId: 'sunnysky_x4110s', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_10w_booster' }, specs: { maxPayload: '2.5kg', maxEndurance: '38min', maxRange: '12km', twr: 2.9 } },
    { id: 'tac-var-15', name: 'Titan Resupply Hex', description: 'Front-line logistics.', platform: 'multirotor', suitability: ['logistics'], bom: { frameId: 'tarot_t960', motorId: 'tm_p80_iii', battId: 'mpower_14s_30000', escId: 'hw_p80_esc', propId: 'p13_carbon' }, specs: { maxPayload: '20kg', maxEndurance: '30min', maxRange: '9km', twr: 2.4 } },
    { id: 'tac-var-16', name: 'KDE Inspection 650', description: 'Precise infrastructure.', platform: 'multirotor', suitability: ['inspection'], bom: { frameId: 'tarot_650', motorId: 'kde_4014xf', battId: 'moli_6s2p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '2kg', maxEndurance: '48min', maxRange: '14km', twr: 3.3 } },
    { id: 'tac-var-17', name: 'Molicel Survey 15', description: 'Efficient mapping.', platform: 'multirotor', suitability: ['mapping'], bom: { frameId: 'quad_15', motorId: 'tm_mn4006', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '1.5kg', maxEndurance: '62min', maxRange: '28km', twr: 3.5 } },
    { id: 'tac-var-18', name: 'Zerodrag Sentry 17', description: 'Stable recon quad.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'quad_17', motorId: 'zerodrag_2807', battId: 'revogreen_6s_22500', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '2.5kg', maxEndurance: '45min', maxRange: '15km', twr: 3.1 } },
    { id: 'tac-var-19', name: 'Acasom Patrol 15', description: 'Boosted telemetry quad.', platform: 'multirotor', suitability: ['patrol'], bom: { frameId: 'quad_15', motorId: 'sunnysky_x4110s', battId: 'moli_6s2p', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_5w_booster' }, specs: { maxPayload: '1.2kg', maxEndurance: '40min', maxRange: '18km', twr: 4.0 } },
    { id: 'tac-var-20', name: 'Heavy Carrier X8-E', description: 'Extended lift octo.', platform: 'multirotor', suitability: ['heavy-lift'], bom: { frameId: 'tarot_x8', motorId: 'hw_p50m', battId: 'mpower_14s_45000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '35kg', maxEndurance: '22min', maxRange: '6km', twr: 2.0 } },
    { id: 'tac-var-21', name: 'KDE Long loiter 17', description: 'Stable long duration.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'quad_17', motorId: 'kde_4014xf', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '2kg', maxEndurance: '58min', maxRange: '25km', twr: 2.7 } },
    { id: 'tac-var-22', name: 'Molicel High Speed 13', description: 'Punchy Li-ion quad.', platform: 'multirotor', suitability: ['agile'], bom: { frameId: 'quad_13', motorId: 'zerodrag_3115', battId: 'moli_4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '0.4kg', maxEndurance: '18min', maxRange: '7km', twr: 5.7 } },
    { id: 'tac-var-23', name: 'Talon Stealth Scout', description: 'Silent long range FW.', platform: 'fixed-wing', suitability: ['stealth'], bom: { frameId: 'fixed_wing_talon', motorId: 'tm_mn4006', battId: 'moli_6s2p', escId: '30a_generic' }, specs: { maxPayload: '1kg', maxEndurance: '120min', maxRange: '100km', twr: 1.5 } },
    { id: 'tac-var-24', name: 'Tarot T960 Agri-Hex', description: 'Massive ag-hex.', platform: 'multirotor', suitability: ['agriculture'], bom: { frameId: 'tarot_t960', motorId: 'tm_p80_iii', battId: 'mpower_14s_45000', escId: 'hw_p80_esc', propId: 'p13_carbon' }, specs: { maxPayload: '30kg', maxEndurance: '25min', maxRange: '8km', twr: 2.1 } },
    { id: 'tac-var-25', name: 'Zerodrag Alpha 15', description: 'Premium tactical quad.', platform: 'multirotor', suitability: ['defense'], bom: { frameId: 'quad_15', motorId: 'zerodrag_2807', battId: 'moli_6s3p', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '1.5kg', maxEndurance: '42min', maxRange: '18km', twr: 4.3 } },
    { id: 'tac-var-26', name: 'Acasom Shield 17', description: 'Heavy EW quad.', platform: 'multirotor', suitability: ['electronic-warfare'], bom: { frameId: 'quad_17', motorId: 'sunnysky_x4110s', battId: 'revogreen_6s_22500', escId: '40a_xrotor', propId: 'p13_carbon', payload: 'acasom_10w_booster' }, specs: { maxPayload: '3kg', maxEndurance: '40min', maxRange: '12km', twr: 2.8 } },
    { id: 'tac-var-27', name: 'Molicel Cargo 650', description: 'Efficient delivery quad.', platform: 'multirotor', suitability: ['delivery'], bom: { frameId: 'tarot_650', motorId: 'kde_4014xf', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '4kg', maxEndurance: '35min', maxRange: '12km', twr: 3.1 } },
    { id: 'var-28', name: 'KDE Survey FW', description: 'High payload mapping FW.', platform: 'fixed-wing', suitability: ['mapping'], bom: { frameId: 'fixed_wing_composite_cruiser', motorId: 'kde_4014xf', battId: 'revogreen_12s_22000', escId: '40a_xrotor' }, specs: { maxPayload: '6kg', maxEndurance: '100min', maxRange: '90km', twr: 1.8 } },
    { id: 'tac-var-29', name: 'Tarot X8 Heavy Scout', description: 'Stable octo recon.', platform: 'multirotor', suitability: ['recon'], bom: { frameId: 'tarot_x8', motorId: 'tm_mn4010', battId: 'mpower_14s_30000', escId: 'hw_p50m_esc', propId: 'p13_carbon' }, specs: { maxPayload: '12kg', maxEndurance: '45min', maxRange: '15km', twr: 2.5 } },
    { id: 'tac-var-30', name: 'Zerodrag Beta 13', description: 'Fast response micro.', platform: 'multirotor', suitability: ['rapid-response'], bom: { frameId: 'quad_13', motorId: 'zerodrag_1404', battId: '4s_5000', escId: 'zd_boost_55a', propId: 'p13_carbon' }, specs: { maxPayload: '0.3kg', maxEndurance: '22min', maxRange: '6km', twr: 5.5 } },
    { id: 'tac-var-31', name: 'Acasom Sentry FW', description: 'Boosted telemetry FW.', platform: 'fixed-wing', suitability: ['patrol'], bom: { frameId: 'fixed_wing_talon', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: '40a_xrotor', payload: 'acasom_5w_booster' }, specs: { maxPayload: '2kg', maxEndurance: '85min', maxRange: '75km', twr: 1.6 } },
    { id: 'tac-var-32', name: 'Heavy Lift Titan VI', description: 'Industrial lift hex.', platform: 'multirotor', suitability: ['industrial'], bom: { frameId: 'tarot_t960', motorId: 'tm_p80_iii', battId: 'mpower_14s_45000', escId: 'hw_p80_esc', propId: 'p13_carbon' }, specs: { maxPayload: '40kg', maxEndurance: '20min', maxRange: '5km', twr: 1.9 } },
    { id: 'tac-var-33', name: 'Molicel Endurance Pro', description: 'Li-ion endurance quad.', platform: 'multirotor', suitability: ['long-range'], bom: { frameId: 'quad_17', motorId: 'sunnysky_x4110s', battId: 'moli_6s3p', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '2.5kg', maxEndurance: '70min', maxRange: '35km', twr: 2.8 } },
    { id: 'tac-var-34', name: 'KDE Tactical Quad', description: 'Rugged ops quad.', platform: 'multirotor', suitability: ['tactical'], bom: { frameId: 'quad_15', motorId: 'kde_4014xf', battId: 'revogreen_6s_16000', escId: '40a_xrotor', propId: 'p13_carbon' }, specs: { maxPayload: '4kg', maxEndurance: '40min', maxRange: '15km', twr: 3.2 } }
];
