export const CONFIG_TEMPLATES = {
    "medium_2kg": {
        name: "Medium Lift (2kg Payload / 5km Range)",
        frame: "tarot_650",
        motor: "tm_mn4006",
        prop: "p12_carbon",
        esc: "20a_generic",
        batt: "moli_6s3p",
        payload: 2
    },
    "medium_5kg": {
        name: "Logistics Specialist (5kg Payload / 10km Range)",
        frame: "tarot_650",
        motor: "tm_mn4006",
        prop: "p13_carbon",
        esc: "20a_generic",
        batt: "moli_6s3p",
        payload: 5
    },
    "heavy_10kg": {
        name: "Heavy Cargo (10kg Payload / 20km Range)",
        frame: "quad_industrial",
        motor: "hw_p50m",
        prop: "p64_carbon",
        esc: "100a_hv",
        batt: "hv_400v_pack",
        payload: 10
    },
    "heavy_25kg": {
        name: "Extreme Lift (25kg Payload / 15km Range)",
        frame: "hex_industrial",
        motor: "hw_p50m",
        prop: "p72_carbon",
        esc: "100a_hv",
        batt: "hv_400v_pack",
        payload: 25
    },
    "log_heavy_01": {
        name: "Carrier-X8 Industrial (30kg Payload / 12km Range)",
        frame: "octo_heavy",
        motor: "tm_p80",
        prop: "p64_carbon",
        esc: "100a_hv",
        batt: "agri_14s_30000",
        payload: 30
    },
    "log_med_02": {
        name: "Hex-Hauler v2 (10kg Payload / 18km Range)",
        frame: "hex_industrial",
        motor: "tm_p80_iii",
        prop: "p64_carbon",
        esc: "100a_hv",
        batt: "agri_14s_30000",
        payload: 10
    },
    // ── Swift-Quad Express ────────────────────────────────────────────────────
    // Fix: was quad_industrial (25kg frame) causing extreme overweight.
    // Now: quad_17 + sunnysky_x4110s (LV, 40A) + 40a_xrotor (40A ≥ 40A ✓) + 6S LV batt ✓
    "log_fast_03": {
        name: "Swift-Quad Express (3kg Payload / 25km Range)",
        frame: "quad_17",
        motor: "sunnysky_x4110s",
        prop: "p17_carbon",
        esc: "40a_xrotor",
        batt: "revogreen_6s_16000",
        payload: 3
    },
    // ── Shield-Quad Anti-Jam ──────────────────────────────────────────────────
    // Fix: was cobra_cm4515 (55A) + 60a_single (60A ≥ 55A ✓) — actually valid ESC,
    // but cobra at 800W on 22.2V = 36A draw so ESC was marginal.
    // Now: kde_4014xf (LV, 35A max) + 40a_xrotor (40A ≥ 35A ✓) — cleaner margin.
    "def_jam_03": {
        name: "Shield-Quad Anti-Jam (4kg Payload / 15km Range)",
        frame: "quad_15",
        motor: "kde_4014xf",
        prop: "p15_carbon",
        esc: "40a_xrotor",
        batt: "euclion_6s_22000",
        payload: 4
    },
    // ── Fortress Hex ──────────────────────────────────────────────────────────
    // Fix: tm_p80_iii (LV, 65A max) + 60a_single (60A) → ESC UNDER-RATED.
    // Now: hw_p80_esc (150A FOC, LV-compatible) → 150A ≥ 65A ✓
    "def_heavy_06": {
        name: "Fortress Hex (12kg Payload / 12km Range)",
        frame: "hex_industrial",
        motor: "tm_p80_iii",
        prop: "p64_carbon",
        esc: "hw_p80_esc",
        batt: "agri_14s_30000",
        payload: 12
    },
    // ── LiDAR-Hex Industrial ──────────────────────────────────────────────────
    // Fix: same ESC under-rating as Fortress Hex.
    // Now: hw_p80_esc (150A FOC) → 150A ≥ 65A ✓
    "surv_lidar_03": {
        name: "LiDAR-Hex Industrial (6kg Payload / 10km Range)",
        frame: "hex_industrial",
        motor: "tm_p80_iii",
        prop: "p64_carbon",
        esc: "hw_p80_esc",
        batt: "agri_14s_30000",
        payload: 6
    },
    "gen_heavy_01": {
        name: "Titan-X8 Heavy Lift (35kg Payload / 10km Range)",
        frame: "octo_heavy",
        motor: "hw_p50m",
        prop: "p64_carbon",
        esc: "100a_hv",
        batt: "hv_400v_pack",
        payload: 35
    }
};
