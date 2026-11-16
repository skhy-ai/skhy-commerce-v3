/**
 * Drone component catalog data used by the Heavy Lift Simulator.
 * Extracted from HeavyLiftSimulator.tsx for modularity and reuse.
 */

export interface Camera {
    id: string;
    name: string;
    weight_kg: number;
    price: number;
    imageUrl?: string;
}

export interface Motor {
    id: string;
    name: string;
    brand: string;
    class: 'medium' | 'industrial';
    weight_kg: number;
    max_thrust_kg: number;
    voltage_req: 'LV' | 'HV';
    efficiency_hover: number;
    kv: number;
    watts_max: number;
    max_amps: number;
    price: number;
    imageUrl?: string;
}

export interface Prop {
    id: string;
    name: string;
    size: number;
    weight_kg: number;
    price: number;
    imageUrl?: string;
}

export interface Battery {
    id: string;
    name: string;
    type: 'LV' | 'HV';
    voltage: number;
    capacity_wh: number;
    weight_kg: number;
    price: number;
    imageUrl?: string;
}

export interface ESC {
    name: string;
    weight_kg: number;
    type: 'single' | '4in1';
    rating: number;
    price: number;
    imageUrl?: string;
}

export interface Frame {
    arms: number;
    weight_kg: number;
    radius: number;
    class: 'medium' | 'industrial';
    min_prop: number;
    max_prop: number;
    desc: string;
    price: number;
    imageUrl?: string;
    type: 'multirotor' | 'fixed-wing';
    wingspan_m?: number;
    glide_ratio?: number;
    fuselage_length_m?: number;
    fuselage_material?: string;
    motor_config?: 'pusher' | 'tractor';
}

// ─── Frames ──────────────────────────────────────────────────────────────────

export const FRAMES: Record<string, Frame> = {
    tarot_650: {
        arms: 4, weight_kg: 0.476, radius: 0.325, class: 'medium', min_prop: 10, max_prop: 17, desc: 'Tarot Iron Man 650', price: 105,
        type: 'multirotor',
        imageUrl: 'https://forumdrone.fr/uploads/gallery/album_33/gallery_1121_33_754853.jpg'
    },
    quad_13: {
        arms: 4, weight_kg: 1.1, radius: 0.33, class: 'medium', min_prop: 12, max_prop: 14, desc: 'Quad 13-inch Frame', price: 150,
        type: 'multirotor',
        imageUrl: 'https://ae01.alicdn.com/kf/Sf3b4b5e8e8e84e5e8e8e8e8e8e8e8e8eH.jpg'
    },
    quad_15: {
        arms: 4, weight_kg: 1.4, radius: 0.40, class: 'medium', min_prop: 14, max_prop: 16, desc: 'Quad 15-inch Frame', price: 180,
        type: 'multirotor',
        imageUrl: 'https://ae01.alicdn.com/kf/S5fcdb58fecb944aa818a58e8a50cfa22z.jpg'
    },
    quad_17: {
        arms: 4, weight_kg: 1.8, radius: 0.45, class: 'medium', min_prop: 16, max_prop: 18, desc: 'Quad 17-inch Frame', price: 220,
        type: 'multirotor',
        imageUrl: 'https://ae01.alicdn.com/kf/S5fcdb58fecb944aa818a58e8a50cfa22z.jpg'
    },
    quad_industrial: {
        arms: 4, weight_kg: 25, radius: 2.0, class: 'industrial', min_prop: 30, max_prop: 80, desc: 'Industrial Quad Frame', price: 1500,
        type: 'multirotor',
        imageUrl: '/images/products/heavy_lift_frame.png'
    },
    hex_industrial: {
        arms: 6, weight_kg: 35, radius: 2.5, class: 'industrial', min_prop: 30, max_prop: 80, desc: 'Industrial Hex Frame', price: 2100,
        type: 'multirotor',
        imageUrl: '/images/products/heavy_lift_frame.png'
    },
    octo_heavy: {
        arms: 8, weight_kg: 45, radius: 3.0, class: 'industrial', min_prop: 30, max_prop: 80, desc: 'Heavy Octo Frame', price: 3200,
        type: 'multirotor',
        imageUrl: '/images/products/heavy_lift_frame.png'
    },
    fixed_wing_surveyor: {
        arms: 1, weight_kg: 2.2, radius: 1.2, class: 'industrial', min_prop: 12, max_prop: 16,
        desc: 'SKHY Surveyor (VTOL Fixed-Wing)',
        price: 4500, type: 'fixed-wing', wingspan_m: 2.4, glide_ratio: 18,
        fuselage_length_m: 1.35, fuselage_material: 'Carbon Fibre / Fibreglass Composite',
        motor_config: 'pusher',
        imageUrl: 'https://i.ibb.co/Lz3VM34Y/Screenshot-2026-05-02-010558.png'
    },
    fixed_wing_talon: {
        arms: 1, weight_kg: 1.2, radius: 0.8, class: 'medium', min_prop: 10, max_prop: 13,
        desc: 'Mini Talon (Long Range)',
        price: 180, type: 'fixed-wing', wingspan_m: 1.3, glide_ratio: 12,
        fuselage_length_m: 0.8, fuselage_material: 'EPO Foam (Reinforced)',
        motor_config: 'pusher',
        imageUrl: '/images/products/mini_talon_drone.png'
    },
    fixed_wing_composite_cruiser: {
        arms: 1, weight_kg: 3.1, radius: 1.5, class: 'industrial', min_prop: 14, max_prop: 18,
        desc: 'SKHY Composite Cruiser (Mid-Wing)',
        price: 6800, type: 'fixed-wing', wingspan_m: 3.0, glide_ratio: 22,
        fuselage_length_m: 1.6, fuselage_material: 'Full Carbon Fibre Monocoque',
        motor_config: 'pusher',
        imageUrl: 'https://i.ibb.co/C3bd1HTr/AB4v1-Air-unit-for-FPV-drones.png'
    },
    fixed_wing_delta: {
        arms: 1, weight_kg: 0.9, radius: 0.65, class: 'medium', min_prop: 8, max_prop: 11,
        desc: 'Delta Flying Wing (Sprint)',
        price: 280, type: 'fixed-wing', wingspan_m: 1.1, glide_ratio: 10,
        fuselage_length_m: 0.55, fuselage_material: 'EPP Foam (High-impact)',
        motor_config: 'pusher',
        imageUrl: '/images/products/delta_wing_drone.png'
    },
    tarot_t960: {
        arms: 6, weight_kg: 1.05, radius: 0.48, class: 'industrial', min_prop: 15, max_prop: 18, desc: 'Tarot T960 Hexacopter', price: 280,
        type: 'multirotor',
        imageUrl: 'https://ae01.alicdn.com/kf/HTB1.PZ6XvfsK1RjSszgq6y8BXXaM.jpg'
    },
    tarot_x8: {
        arms: 8, weight_kg: 1.9, radius: 0.525, class: 'industrial', min_prop: 15, max_prop: 18, desc: 'Tarot X8 Octocopter', price: 450,
        type: 'multirotor',
        imageUrl: 'https://ae01.alicdn.com/kf/H0449557432f94b3c95e1e550e50257e8p.jpg'
    },
};



// ─── Motors ──────────────────────────────────────────────────────────────────

export const MOTORS: Motor[] = [
    {
        id: 'tm_mn4010', name: 'T-Motor MN4010 (370KV)', brand: 'T-Motor', class: 'medium', weight_kg: 0.112, max_thrust_kg: 2.2, voltage_req: 'LV', efficiency_hover: 12.0, kv: 370, watts_max: 450, max_amps: 30, price: 65,
        imageUrl: 'https://www.mhm-modellbau.de/t-motor/TM-MN4010_b03.jpg'
    },
    {
        id: 'sunnysky_x4110s', name: 'SunnySky X4110S (400KV)', brand: 'SunnySky', class: 'medium', weight_kg: 0.149, max_thrust_kg: 2.5, voltage_req: 'LV', efficiency_hover: 11.5, kv: 400, watts_max: 577, max_amps: 40, price: 55,
        imageUrl: 'https://img.gkbcdn.com/s3/p/2015-07-10/sunnysky-x4110s-400kv-outrunner-brushless-motor-for-rc-multirotor-1571991708575.jpg'
    },
    {
        id: 'emax_mt3510', name: 'Emax MT3510 (600KV)', brand: 'Emax', class: 'medium', weight_kg: 0.105, max_thrust_kg: 1.8, voltage_req: 'LV', efficiency_hover: 10.5, kv: 600, watts_max: 350, max_amps: 25, price: 45,
        imageUrl: 'https://rcdrone.top/cdn/shop/files/Original-EMAX-MT4008-380KV-470KV-600KV-motor-4-6S-for-DIY-FPV-drone-T810-T960-S800_jpg.jpg?v=1711850118'
    },
    {
        id: 'tm_mn4006', name: 'T-Motor MN4006 (380KV) – Pusher', brand: 'T-Motor', class: 'medium', weight_kg: 0.082, max_thrust_kg: 2.5, voltage_req: 'LV', efficiency_hover: 14.5, kv: 380, watts_max: 400, max_amps: 20, price: 70,
        imageUrl: 'https://vtakeoff.com/wp-content/uploads/2023/03/New-Project-24.jpg'
    },
    {
        id: 'kde_4014xf', name: 'KDE Direct 4014XF (380KV)', brand: 'KDE', class: 'medium', weight_kg: 0.115, max_thrust_kg: 2.8, voltage_req: 'LV', efficiency_hover: 13.0, kv: 380, watts_max: 500, max_amps: 35, price: 95,
        imageUrl: 'https://www.kdedirect.com/cdn/shop/products/KDE4014XF-380-D5_C_2048x2048.jpg?v=1564589326'
    },
    {
        id: 'cobra_cm4515', name: 'Cobra CM-4515 (400KV)', brand: 'Cobra', class: 'medium', weight_kg: 0.18, max_thrust_kg: 4.2, voltage_req: 'LV', efficiency_hover: 10.0, kv: 400, watts_max: 800, max_amps: 55, price: 80,
        imageUrl: 'https://www.scaleflying.com/assets/images/4130-16-l.jpg'
    },
    {
        id: 'tmotor_at2826', name: 'T-Motor AT2826 (1050KV) – FW Pusher', brand: 'T-Motor', class: 'medium', weight_kg: 0.073, max_thrust_kg: 1.4, voltage_req: 'LV', efficiency_hover: 13.5, kv: 1050, watts_max: 280, max_amps: 20, price: 55,
        imageUrl: 'https://www.mhm-modellbau.de/t-motor/TM-MN4010_b03.jpg'
    },
    {
        id: 'sunnysky_x2212', name: 'SunnySky X2212 (980KV) – FW Pusher', brand: 'SunnySky', class: 'medium', weight_kg: 0.058, max_thrust_kg: 1.2, voltage_req: 'LV', efficiency_hover: 12.8, kv: 980, watts_max: 200, max_amps: 18, price: 40,
        imageUrl: 'https://img.gkbcdn.com/s3/p/2015-07-10/sunnysky-x4110s-400kv-outrunner-brushless-motor-for-rc-multirotor-1571991708575.jpg'
    },
    {
        id: 'tm_p80', name: 'T-Motor P80 III (100KV)', brand: 'T-Motor', class: 'industrial', weight_kg: 0.7, max_thrust_kg: 18, voltage_req: 'LV', efficiency_hover: 11.0, kv: 100, watts_max: 2000, max_amps: 60, price: 200,
        imageUrl: 'https://offthegridsun.com/images/6030_dimg3.jpg'
    },
    {
        id: 'hw_p50m', name: 'Hobbywing P50M (104kg Thrust)', brand: 'Hobbywing', class: 'industrial', weight_kg: 6.3, max_thrust_kg: 104, voltage_req: 'HV', efficiency_hover: 7.1, kv: 11, watts_max: 15000, max_amps: 80, price: 850,
        imageUrl: 'https://p.globalsources.com/IMAGES/PDT/B6025352146/Drone-motor.png'
    },
    {
        id: 'hw_p65m', name: 'Hobbywing P65M (130kg Thrust)', brand: 'Hobbywing', class: 'industrial', weight_kg: 7.5, max_thrust_kg: 130, voltage_req: 'HV', efficiency_hover: 6.3, kv: 10, watts_max: 20000, max_amps: 100, price: 1100,
        imageUrl: 'https://p.globalsources.com/IMAGES/PDT/B6025352146/Drone-motor.png'
    },
    {
        id: 'zerodrag_1404', name: 'Zerodrag 1404 (3800KV)', brand: 'Zerodrag', class: 'medium', weight_kg: 0.009, max_thrust_kg: 0.45, voltage_req: 'LV', efficiency_hover: 8.5, kv: 3800, watts_max: 150, max_amps: 15, price: 18,
        imageUrl: 'https://i.ibb.co/LtbLd7J/placeholder.jpg'
    },
    {
        id: 'zerodrag_3115', name: 'Zerodrag 3115 (900KV)', brand: 'Zerodrag', class: 'medium', weight_kg: 0.115, max_thrust_kg: 3.2, voltage_req: 'LV', efficiency_hover: 9.2, kv: 900, watts_max: 1200, max_amps: 65, price: 45,
        imageUrl: 'https://i.ibb.co/LtbLd7J/placeholder.jpg'
    },
    {
        id: 'zerodrag_2807', name: 'Zerodrag 2807 (1300KV)', brand: 'Zerodrag', class: 'medium', weight_kg: 0.052, max_thrust_kg: 1.8, voltage_req: 'LV', efficiency_hover: 10.5, kv: 1300, watts_max: 800, max_amps: 45, price: 32,
        imageUrl: 'https://i.ibb.co/LtbLd7J/placeholder.jpg'
    },
    {
        id: 'tm_p80_iii', name: 'T-Motor P80 III (100KV)', brand: 'T-Motor', class: 'industrial', weight_kg: 0.72, max_thrust_kg: 19, voltage_req: 'LV', efficiency_hover: 11.2, kv: 100, watts_max: 2200, max_amps: 65, price: 220,
        imageUrl: 'https://offthegridsun.com/images/6030_dimg3.jpg'
    },
];

// ─── Propellers ──────────────────────────────────────────────────────────────

export const PROPS: Prop[] = [
    {
        id: 'p10_carbon', name: '10-inch Carbon Fiber', size: 10, weight_kg: 0.012, price: 15,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p11_carbon', name: '11-inch Carbon Fiber', size: 11, weight_kg: 0.014, price: 16,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p12_carbon', name: '12-inch Carbon Fiber', size: 12, weight_kg: 0.016, price: 18,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p13_bi_cf', name: '13-inch Bi-Blade CF', size: 13, weight_kg: 0.018, price: 20,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p13_carbon', name: '13-inch Standard CF', size: 13, weight_kg: 0.02, price: 22,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p14_carbon', name: '14-inch Carbon Fiber', size: 14, weight_kg: 0.025, price: 25,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p15_carbon', name: '15-inch Carbon Fiber', size: 15, weight_kg: 0.03, price: 28,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p17_carbon', name: '17-inch Carbon Fiber', size: 17, weight_kg: 0.04, price: 35,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p32_carbon', name: '32-inch CF (Agri)', size: 32, weight_kg: 0.25, price: 80,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p40_carbon', name: '40-inch CF Heavy', size: 40, weight_kg: 0.45, price: 120,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p64_carbon', name: '64-inch Carbon Fiber', size: 64, weight_kg: 0.95, price: 350,
        imageUrl: '/images/products/carbon_propeller.png'
    },
    {
        id: 'p72_carbon', name: '72-inch Carbon Fiber', size: 72, weight_kg: 1.15, price: 500,
        imageUrl: '/images/products/carbon_propeller.png'
    },
];

// ─── Batteries ───────────────────────────────────────────────────────────────

export const BATTERIES: Battery[] = [
    {
        id: 'moli_6s3p', name: 'Molicel P45B 6S3P (13.5Ah)', type: 'LV', voltage: 22.2, capacity_wh: 299.7, weight_kg: 1.36, price: 150,
        imageUrl: 'https://static.wixstatic.com/media/244a2b_02469ccc6e484baa8b956d9a37240e8a~mv2.png/v1/fit/w_500,h_500,q_90/file.png'
    },
    {
        id: 'moli_6s2p', name: 'Molicel P45B 6S2P (9.0Ah)', type: 'LV', voltage: 22.2, capacity_wh: 199.8, weight_kg: 0.91, price: 110,
        imageUrl: 'https://static.wixstatic.com/media/244a2b_02469ccc6e484baa8b956d9a37240e8a~mv2.png/v1/fit/w_500,h_500,q_90/file.png'
    },
    {
        id: 'revogreen_6s_16000', name: 'Revogreen 6S 16000mAh (Ind)', type: 'LV', voltage: 22.2, capacity_wh: 355, weight_kg: 2.1, price: 220,
        imageUrl: 'https://rcdrone.top/cdn/shop/files/MAD-6S-30Ah-Solid-State-Lithium-ion-Drone-Battery-1.jpg?v=1740362019'
    },
    {
        id: 'euclion_6s_22000', name: 'Euclion 6S 22000mAh (Ind)', type: 'LV', voltage: 22.2, capacity_wh: 488, weight_kg: 2.5, price: 300,
        imageUrl: 'https://ae01.alicdn.com/kf/S4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9.jpg'
    },
    {
        id: '4s_5000', name: '4S LiPo (5000mAh) - Tarot Rec', type: 'LV', voltage: 14.8, capacity_wh: 74, weight_kg: 0.5, price: 40,
        imageUrl: 'https://wm.cdn.cn86.cn/boyi/2023/06/543a37e81d8nrh6r.jpg'
    },
    {
        id: '4s_10000', name: '4S LiPo (10000mAh) - Tarot Ext', type: 'LV', voltage: 14.8, capacity_wh: 148, weight_kg: 0.95, price: 85,
        imageUrl: 'https://wm.cdn.cn86.cn/boyi/2023/06/d1a8f8c463wycye3.jpg'
    },
    {
        id: 'revogreen_12s_22000', name: 'Revogreen 12S 22000mAh (Ind)', type: 'LV', voltage: 44.4, capacity_wh: 976, weight_kg: 6.2, price: 650,
        imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2024/1/378582418/FP/SO/GW/39080329/drone-rechargable-lithium-ion-battery-ne21000-500x500.jpg'
    },
    {
        id: 'iotech_12s_16000', name: 'IoTech 12S 16000mAh (Ind)', type: 'LV', voltage: 44.4, capacity_wh: 710, weight_kg: 4.8, price: 500,
        imageUrl: 'https://ae01.alicdn.com/kf/S4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9.jpg'
    },
    {
        id: 'agri_14s_30000', name: 'Generic 14S 30000mAh (Agri)', type: 'LV', voltage: 51.8, capacity_wh: 1554, weight_kg: 8.5, price: 850,
        imageUrl: 'https://rcdrone.top/cdn/shop/files/ZhiAn-18S-684V-30000mAh-Smart-Battery-for-Agricultural-8.jpg?v=1727610912'
    },
    {
        id: 'lv_12s_pack', name: '12S LiPo (22000mAh) - Std', type: 'LV', voltage: 44.4, capacity_wh: 976, weight_kg: 6.5, price: 550,
        imageUrl: 'https://ae01.alicdn.com/kf/S4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9.jpg'
    },
    {
        id: 'hv_400v_pack', name: 'Ind. HV Array 400V (10kWh)', type: 'HV', voltage: 400, capacity_wh: 10000, weight_kg: 45, price: 12000,
        imageUrl: 'https://cdn.shopify.com/s/files/1/0689/2607/9256/files/29Ah_4ba089e7-372f-4938-85b2-f3de23829e60.png?v=1702018890'
    },
    {
        id: 'moli_4s_5000', name: 'Molicel P45B 4S1P (5.0Ah)', type: 'LV', voltage: 14.8, capacity_wh: 74, weight_kg: 0.35, price: 45,
        imageUrl: 'https://static.wixstatic.com/media/244a2b_02469ccc6e484baa8b956d9a37240e8a~mv2.png/v1/fit/w_500,h_500,q_90/file.png'
    },
    {
        id: 'mpower_14s_45000', name: 'MPower 14S 45000mAh (High Cap)', type: 'LV', voltage: 51.8, capacity_wh: 2331, weight_kg: 12.5, price: 1200,
        imageUrl: 'https://rcdrone.top/cdn/shop/files/ZhiAn-18S-684V-30000mAh-Smart-Battery-for-Agricultural-8.jpg?v=1727610912'
    },
    {
        id: 'mpower_14s_30000', name: 'MPower 14S 30000mAh (Standard)', type: 'LV', voltage: 51.8, capacity_wh: 1554, weight_kg: 8.8, price: 900,
        imageUrl: 'https://rcdrone.top/cdn/shop/files/ZhiAn-18S-684V-30000mAh-Smart-Battery-for-Agricultural-8.jpg?v=1727610912'
    },
    {
        id: 'revogreen_6s_22500', name: 'Revogreen 6S 22500mAh (High Density)', type: 'LV', voltage: 22.2, capacity_wh: 499.5, weight_kg: 2.6, price: 320,
        imageUrl: 'https://rcdrone.top/cdn/shop/files/MAD-6S-30Ah-Solid-State-Lithium-ion-Drone-Battery-1.jpg?v=1740362019'
    },
];

// ─── ESCs ─────────────────────────────────────────────────────────────────────

export const ESCS: Record<string, ESC> = {
    '20a_generic': {
        name: '20A Generic', weight_kg: 0.015, type: 'single', rating: 20, price: 12,
        imageUrl: 'http://rcdrone.top/cdn/shop/products/HTB1bLLBde3tHKVjSZSgq6x4QFXau.jpg?v=1684070628'
    },
    '30a_generic': {
        name: '30A Generic', weight_kg: 0.025, type: 'single', rating: 30, price: 18,
        imageUrl: 'http://rcdrone.top/cdn/shop/products/HTB1bLLBde3tHKVjSZSgq6x4QFXau.jpg?v=1684070628'
    },
    '40a_xrotor': {
        name: '40A Hobbywing XRotor', weight_kg: 0.026, type: 'single', rating: 40, price: 25,
        imageUrl: 'https://xbotics.in/453-medium_default/hobbywing-xrotor-40a-esc-esc-drone.jpg'
    },
    '50a_4in1': {
        name: '50A 4-in-1 (BLHeli_32)', weight_kg: 0.015, type: '4in1', rating: 50, price: 65,
        imageUrl: 'https://ueeshop.ly200-cdn.com/u_file/SSAY/SSAY916/2407/19/products/f247f12da0.jpg'
    },
    '60a_single': {
        name: '60A Single (Industrial)', weight_kg: 0.08, type: 'single', rating: 60, price: 40,
        imageUrl: 'https://zbotic.in/wp-content/uploads/2023/03/ppppp_11zon.jpg'
    },
    '100a_hv': {
        name: '100A HV FOC (Hobbywing)', weight_kg: 0.20, type: 'single', rating: 100, price: 150,
        imageUrl: 'https://rcdrone.top/cdn/shop/products/H62b7cdb751764ac49a60d667ae529523t.jpg?v=1684076559&amp;width=1445'
    },
    'zd_boost_55a': {
        name: 'Zerodrag Boost 55A', weight_kg: 0.012, type: '4in1', rating: 55, price: 85,
        imageUrl: 'https://ueeshop.ly200-cdn.com/u_file/SSAY/SSAY916/2407/19/products/f247f12da0.jpg'
    },
    'hw_p50m_esc': {
        name: 'Hobbywing P50M ESC (FOC)', weight_kg: 0.15, type: 'single', rating: 120, price: 180,
        imageUrl: 'https://rcdrone.top/cdn/shop/products/H62b7cdb751764ac49a60d667ae529523t.jpg?v=1684076559&amp;width=1445'
    },
    'hw_p80_esc': {
        name: 'Hobbywing P80 ESC (FOC)', weight_kg: 0.25, type: 'single', rating: 150, price: 250,
        imageUrl: 'https://rcdrone.top/cdn/shop/products/H62b7cdb751764ac49a60d667ae529523t.jpg?v=1684076559&amp;width=1445'
    },
};

// ─── Cameras ─────────────────────────────────────────────────────────────────

export const CAMERAS: Camera[] = [
    { id: 'none', name: 'None', weight_kg: 0.0, price: 0 },
    {
        id: 'siyi_zr10', name: 'SIYI ZR10 (Optical)', weight_kg: 0.6, price: 650,
        imageUrl: 'https://ueeshop.ly200-cdn.com/u_file/UPAV/UPAV102/2402/22/photo/ZR10mobile7.jpg'
    },
    {
        id: 'skydroid_h16', name: 'Skydroid H16 Cam', weight_kg: 0.3, price: 200,
        imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2022/10/CA/ML/WF/49478962/camera-gimbal-for-drone-1000x1000.jpg'
    },
    {
        id: 'paras_eo', name: 'Paras Aero EO (Ind)', weight_kg: 0.8, price: 1200,
        imageUrl: 'https://img.waimaoniu.net/2229/2229-202306011454374283.jpg?x-oss-process=image'
    },
    {
        id: 'ideaforge_ref', name: 'IdeaForge Surveillance', weight_kg: 1.2, price: 1800,
        imageUrl: 'https://sgcctv.com.sg/wp-content/uploads/2022/12/Industrial-Drone-Thermal-Camera-with-Gimbal-Stabilizer-Public-Security-Transportation-Firefighting-Border-Defense.jpg'
    },
    {
        id: 'skhy-eo', name: 'SKHY EO/IR Gimbal', weight_kg: 1.5, price: 1500,
        imageUrl: 'https://img.waimaoniu.net/2229/2229-202306011454374283.jpg?x-oss-process=image'
    },
];

// ─── Payload pipe materials ───────────────────────────────────────────────────

export const MATERIALS: Record<string, { density: number; color: number }> = {
    pvc: { density: 1400, color: 0xe2e8f0 },
    steel: { density: 7850, color: 0x334155 },
    concrete: { density: 2400, color: 0x78716c },
};
