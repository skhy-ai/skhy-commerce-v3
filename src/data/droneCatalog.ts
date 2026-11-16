/**
 * SKHY AI Drone Hardware Catalog & Mission Recipes
 * This serves as the "Persistent Memory" for the AI Mission Architect.
 */

export const DRONE_CATALOG = {
    platforms: [
        { id: 'multirotor', name: 'Vertical Lift / Multirotor', useCase: 'Stationary hover, heavy lift, urban operations' },
        { id: 'fixed-wing', name: 'Long Endurance / Fixed-Wing', useCase: 'Long range, high endurance, surveying large areas' }
    ],
    frames: {
        multirotor: [
            { id: 'tarot_650', name: 'Tarot 650 Sport', tlr: 7, payload: '2kg', endurance: '25min' },
            { id: 'quad_industrial', name: 'SKHY Industrial Quad', tlr: 8, payload: '5kg', endurance: '45min' },
            { id: 'octo_heavy', name: 'SKHY Octo-Heavy Lift', tlr: 9, payload: '20kg', endurance: '35min' }
        ],
        fixed_wing: [
            { id: 'fixed_wing_surveyor', name: 'Surveyor Pro', tlr: 8, range: '50km', payload: '1kg' },
            { id: 'fixed_wing_talon', name: 'Talon Long-Range', tlr: 7, range: '100km', payload: '2kg' }
        ]
    },
    motors: [
        { id: 'tm_mn4010', name: 'T-Motor MN4010', thrust: '1.2kg', efficiency: 'High' },
        { id: 'kde_4014xf', name: 'KDE Direct 4014XF', thrust: '2.5kg', industrial: true },
        { id: 'tm_p80', name: 'T-Motor P80', thrust: '15kg', heavy: true }
    ],
    batteries: [
        { id: 'moli_6s3p', name: 'Molicel 6S3P Pack', capacity: '12600mAh', type: 'Li-Ion', energy_density: 'High' },
        { id: 'euclion_6s_22000', name: 'Euclion Solid State', capacity: '22000mAh', tlr: 6 },
        { id: 'agri_14s_30000', name: 'Industrial 14S Pack', capacity: '30000mAh', heavy: true }
    ],
    payloads: [
        { id: 'siyi_zr10', name: 'SIYI ZR10 30x Hybrid', thermal: false, zoom: '30x' },
        { id: 'skhy-eo', name: 'SKHY EO/IR Edge AI', thermal: true, ai_integrated: true }
    ]
};

export const MISSION_RECIPES = [
    {
        name: 'Heavy Lift Transport',
        target: 'octo_heavy',
        components: {
            frame: 'octo_heavy',
            motors: 'tm_p80',
            battery: 'agri_14s_30000',
            esc: 'hw_p65m'
        }
    },
    {
        name: 'Long Range Mapping',
        target: 'fixed_wing_talon',
        components: {
            frame: 'fixed_wing_talon',
            motors: 'tm_mn4006',
            battery: 'moli_6s3p',
            camera: 'siyi_zr10'
        }
    },
    {
        name: 'Anti-Jam Surveillance',
        target: 'quad_industrial',
        components: {
            frame: 'quad_industrial',
            battery: 'euclion_6s_22000',
            gps: 'dual_gps_anti_jam'
        }
    }
];
